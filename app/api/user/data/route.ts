import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all user storage paths
    const { data: documents } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("user_id", user.id);

    if (documents && documents.length > 0) {
      const paths = documents.map((d) => d.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from("documents").remove(paths);
      }
    }

    // 2. Delete all records from documents (cascades to tasks and chat_messages via FK)
    await supabase.from("documents").delete().eq("user_id", user.id);
    await supabase.from("tasks").delete().eq("user_id", user.id);
    await supabase.from("chat_messages").delete().eq("user_id", user.id);

    return NextResponse.json({ success: true, message: "All user documents and tasks wiped successfully." });
  } catch (err: any) {
    console.error("Wipe data error:", err);
    return NextResponse.json({ error: err.message || "Failed to wipe data." }, { status: 500 });
  }
}
