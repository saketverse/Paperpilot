import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
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

    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Also fetch tasks and recent chat messages for this document
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("document_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const { data: chatMessages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("document_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      document,
      tasks: tasks || [],
      chatMessages: chatMessages || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch document" }, { status: 500 });
  }
}

export async function DELETE(
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

    // 1. Get storage path
    const { data: document } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (document?.storage_path) {
      await supabase.storage.from("documents").remove([document.storage_path]);
    }

    // 2. Delete database row (cascades to tasks and chat_messages)
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete document" }, { status: 500 });
  }
}
