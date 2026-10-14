import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { askDocumentQuestion } from "@/lib/ai/chat";

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

    const body = await request.json();
    const question = (body.question || "").trim();

    if (!question) {
      return NextResponse.json({ error: "Question cannot be empty." }, { status: 400 });
    }

    // 1. Fetch document and verify ownership
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("id, extracted_text")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
    }

    if (!document.extracted_text) {
      return NextResponse.json(
        { error: "No readable text in this document to query." },
        { status: 422 }
      );
    }

    // 2. Fetch recent chat messages for conversational history
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("document_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(6);

    // 3. Save user message
    await supabase.from("chat_messages").insert({
      document_id: id,
      user_id: user.id,
      role: "user",
      content: question,
    });

    // 4. Query Grounded AI
    const chatResult = await askDocumentQuestion(
      document.extracted_text,
      question,
      recentMessages || []
    );

    // 5. Save assistant reply
    await supabase.from("chat_messages").insert({
      document_id: id,
      user_id: user.id,
      role: "assistant",
      content: chatResult.reply,
      source_references: chatResult.sourceReferences,
    });

    return NextResponse.json({
      success: true,
      reply: chatResult.reply,
      sourceReferences: chatResult.sourceReferences,
      errorCode: chatResult.errorCode,
    });
  } catch (err: any) {
    console.error("Chat API route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during chat." },
      { status: 500 }
    );
  }
}
