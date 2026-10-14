import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { analyzeDocumentWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch document and verify ownership
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
    }

    if (!document.extracted_text) {
      return NextResponse.json(
        { error: "No extracted text found in this document. Cannot run AI analysis." },
        { status: 422 }
      );
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          error: "Google Gemini API key is not configured.",
          errorCode: "AI_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    // 2. Mark status as 'analyzing'
    await supabase.from("documents").update({ status: "analyzing" }).eq("id", id);

    // 3. Get user language
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .single();

    const lang = profile?.preferred_language || "en";

    // 4. Run Gemini analysis
    const aiResponse = await analyzeDocumentWithGemini(document.extracted_text, lang);

    if (!aiResponse.success || !aiResponse.data) {
      await supabase
        .from("documents")
        .update({
          status: "failed",
          error_code: aiResponse.errorCode || "AI_FAILED",
        })
        .eq("id", id);

      return NextResponse.json(
        { error: aiResponse.errorMessage || "AI analysis failed.", errorCode: aiResponse.errorCode },
        { status: 500 }
      );
    }

    const analysisResult = aiResponse.data;

    // 5. Update document
    await supabase
      .from("documents")
      .update({
        document_type: analysisResult.documentType || "general",
        analysis_result: analysisResult,
        status: "completed",
        error_code: null,
      })
      .eq("id", id);

    // 6. Delete old auto-generated tasks for this document and insert newly extracted ones
    await supabase.from("tasks").delete().eq("document_id", id).eq("user_id", user.id);

    if (Array.isArray(analysisResult.actionItems) && analysisResult.actionItems.length > 0) {
      const tasksToInsert = analysisResult.actionItems.map((item) => ({
        user_id: user.id,
        document_id: id,
        title: item.title,
        description: item.description || null,
        due_date: item.suggestedDueDate || null,
        priority: item.priority || "medium",
        source_page: item.pageNumber || null,
        status: "pending",
      }));

      await supabase.from("tasks").insert(tasksToInsert);
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });
  } catch (err: any) {
    console.error("Analyze API route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
