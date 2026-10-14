"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TaskRecord } from "@/lib/types";
import { PriorityBadge } from "@/components/status-badge";
import { formatDate, isDateUpcomingOrOverdue } from "@/lib/utils";
import {
  CheckSquare,
  Calendar,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";

export default function TasksManagementPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .select("*, documents(original_filename, document_type)")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (data) {
      setTasks(data as TaskRecord[]);
    }
    setLoading(false);
  };

  const handleToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  const startEdit = (task: TaskRecord) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
  };

  const saveEdit = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title: editTitle.trim(), due_date: editDueDate || null }
          : t
      )
    );
    setEditingTaskId(null);

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        dueDate: editDueDate || null,
      }),
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === "pending") return task.status === "pending";
    if (statusFilter === "completed") return task.status === "completed";
    if (statusFilter === "overdue") {
      return task.status === "pending" && isDateUpcomingOrOverdue(task.due_date) === "overdue";
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Track and complete application instructions, submissions, and document steps.
          </p>
        </div>
      </div>

      {/* Tabs / Filter bar */}
      <div className="flex items-center gap-2 border-b border-muted-border pb-3 overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === "all"
              ? "bg-primary text-white shadow-xs"
              : "text-navy-600 hover:bg-slate-100"
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === "pending"
              ? "bg-primary text-white shadow-xs"
              : "text-navy-600 hover:bg-slate-100"
          }`}
        >
          Pending ({tasks.filter((t) => t.status === "pending").length})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === "completed"
              ? "bg-primary text-white shadow-xs"
              : "text-navy-600 hover:bg-slate-100"
          }`}
        >
          Completed ({tasks.filter((t) => t.status === "completed").length})
        </button>
        <button
          onClick={() => setStatusFilter("overdue")}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === "overdue"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-rose-600 hover:bg-rose-50"
          }`}
        >
          Overdue ({tasks.filter((t) => t.status === "pending" && isDateUpcomingOrOverdue(t.due_date) === "overdue").length})
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted mt-2">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-dashed border-muted-border text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-navy-800">No tasks in this view</h3>
            <p className="text-xs text-muted leading-relaxed">
              When you upload circulars and notifications, PaperPilot automatically generates your actionable checklist items here.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const dateStatus = isDateUpcomingOrOverdue(task.due_date);
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-surface border border-muted-border shadow-xs hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={() => handleToggle(task.id, task.status)}
                    className="w-4 h-4 mt-1 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                  />

                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-primary text-xs text-navy-900 bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-muted-border text-xs text-navy-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(task.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="p-1.5 rounded-lg bg-slate-200 text-navy-700 hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0 space-y-1">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          task.status === "completed"
                            ? "line-through text-muted"
                            : "text-navy-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      {task.documents && (
                        <div className="flex items-center gap-1.5 text-[11px] text-primary pt-0.5">
                          <FileText className="w-3 h-3" />
                          <Link
                            href={`/documents/${task.document_id}`}
                            className="hover:underline font-medium truncate max-w-xs"
                          >
                            {task.documents.original_filename}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-4 shrink-0 sm:self-center pl-7 sm:pl-0">
                    {task.due_date && (
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          dateStatus === "overdue" && task.status === "pending"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : dateStatus === "today" && task.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-navy-700"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    )}

                    <PriorityBadge priority={task.priority} />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="p-1.5 rounded-lg text-muted hover:text-navy-800 hover:bg-slate-100 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
