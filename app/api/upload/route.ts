import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { processDocumentBuffer, validateDocumentFile } from "@/lib/processing/pipeline";
import { analyzeDocumentWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";

export const maxDuration = 60; // Allow sufficient time for extraction and AI

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // 1. Validate file format and size
    const validation = validateDocumentFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Generate safe storage path
    const fileExt = file.name.split(".").pop() || "pdf";
    const documentId = crypto.randomUUID();
    const storagePath = `${user.id}/${documentId}.${fileExt}`;

    // 3. Upload to private Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 4. Initial database record with status 'extracting'
    const { error: insertError } = await supabase.from("documents").insert({
      id: documentId,
      user_id: user.id,
      original_filename: file.name,
      storage_path: storagePath,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      status: "extracting",
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 5. Extract text (PDF or OCR)
    let processedData;
    try {
      processedData = await processDocumentBuffer(buffer, file.name, file.type);
    } catch (extractErr: any) {
      console.error("Extraction error:", extractErr);
      await supabase
        .from("documents")
        .update({
          status: "failed",
          error_code: "EXTRACTION_FAILED",
        })
        .eq("id", documentId);

      return NextResponse.json(
        { error: `Text extraction failed: ${extractErr.message || String(extractErr)}` },
        { status: 422 }
      );
    }

    if (processedData.wordCount === 0 || processedData.extractionQuality === "poor") {
      await supabase
        .from("documents")
        .update({
          status: "failed",
          extracted_text: processedData.text || null,
          page_count: processedData.pageCount,
          error_code: "EMPTY_OR_UNREADABLE",
        })
        .eq("id", documentId);

      return NextResponse.json(
        {
          error:
            processedData.warning ||
            "No readable text could be extracted from this document. Please ensure it is not password-protected or unreadable.",
        },
        { status: 422 }
      );
    }

    // 6. Update document with extracted text
    await supabase
      .from("documents")
      .update({
        extracted_text: processedData.text,
        page_count: processedData.pageCount,
        status: isGeminiConfigured() ? "analyzing" : "uploaded",
      })
      .eq("id", documentId);

    // 7. If Gemini is configured, run AI analysis
    let analysisResult = null;
    if (isGeminiConfigured()) {
      // Fetch user's preferred language from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .single();

      const lang = profile?.preferred_language || "en";
      const aiResponse = await analyzeDocumentWithGemini(processedData.text, lang);

      if (aiResponse.success && aiResponse.data) {
        analysisResult = aiResponse.data;

        // Update document record
        await supabase
          .from("documents")
          .update({
            document_type: analysisResult.documentType || "general",
            analysis_result: analysisResult,
            status: "completed",
          })
          .eq("id", documentId);

        // Populate tasks table from action items
        if (Array.isArray(analysisResult.actionItems) && analysisResult.actionItems.length > 0) {
          const tasksToInsert = analysisResult.actionItems.map((item) => ({
            user_id: user.id,
            document_id: documentId,
            title: item.title,
            description: item.description || null,
            due_date: item.suggestedDueDate || null,
            priority: item.priority || "medium",
            source_page: item.pageNumber || null,
            status: "pending",
          }));

          await supabase.from("tasks").insert(tasksToInsert);
        }
      } else {
        // AI failed or returned error
        await supabase
          .from("documents")
          .update({
            status: "failed",
            error_code: aiResponse.errorCode || "AI_FAILED",
          })
          .eq("id", documentId);
      }
    }

    return NextResponse.json({
      success: true,
      documentId,
      status: isGeminiConfigured() && analysisResult ? "completed" : "uploaded",
      pageCount: processedData.pageCount,
      wordCount: processedData.wordCount,
      isOCRApplied: processedData.isOCRApplied,
      warning: processedData.warning,
    });
  } catch (err: any) {
    console.error("Upload API route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during document processing." },
      { status: 500 }
    );
  }
}
