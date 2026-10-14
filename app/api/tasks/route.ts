import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const status = searchParams.get("status");

    let query = supabase
      .from("tasks")
      .select("*, documents(original_filename, document_type)")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (documentId) {
      query = query.eq("document_id", documentId);
    }
    if (status && (status === "pending" || status === "completed")) {
      query = query.eq("status", status);
    }

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = (body.title || "").trim();

    if (!title) {
      return NextResponse.json({ error: "Task title is required." }, { status: 400 });
    }

    const { data: newTask, error: insertError } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        document_id: body.documentId || null,
        title,
        description: body.description || null,
        due_date: body.dueDate || null,
        priority: body.priority || "medium",
        status: "pending",
        source_page: body.sourcePage || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create task" }, { status: 500 });
  }
}
