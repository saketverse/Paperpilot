"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DocumentRecord, TaskRecord } from "@/lib/types";
import { DocumentStatusBadge, PriorityBadge } from "@/components/status-badge";
import { formatDate, isDateUpcomingOrOverdue } from "@/lib/utils";
import {
  FileText,
  UploadCloud,
  CheckSquare,
  Calendar,
  ArrowRight,
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Trash2,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) return;
      setUser(currentUser);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
      if (profileData) setProfile(profileData);

      // Load documents
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (docsData) setDocuments(docsData as DocumentRecord[]);

      // Load pending tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*, documents(original_filename, document_type)")
        .eq("user_id", currentUser.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(6);
      if (tasksData) setTasks(tasksData as TaskRecord[]);

      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
    );

    await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);
  };

  const completedDocsCount = documents.filter((d) => d.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const upcomingDeadlines = tasks.filter((t) => {
    if (t.status === "completed" || !t.due_date) return false;
    const status = isDateUpcomingOrOverdue(t.due_date);
    return status === "upcoming" || status === "today" || status === "overdue";
  });

  const userName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Scholar";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted mt-3">Loading your document workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-800 to-navy-700 text-white p-6 sm:p-8 rounded-2xl shadow-lifted">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Document Intelligence Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Upload new circulars, check eligibility requirements, and track deadlines without missing a single date.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Total Documents
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-800">
            {documents.length}
          </p>
          <span className="text-[11px] text-muted">Uploaded & encrypted</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Analyzed & Ready
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {completedDocsCount}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Fact-grounded</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Pending Tasks
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary">
            {pendingTasks.length}
          </p>
          <span className="text-[11px] text-muted">From your checklists</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Active Deadlines
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {upcomingDeadlines.length}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Requiring attention</span>
        </div>
      </div>

      {/* Main Grid: Recent Documents & Action Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Documents (2 cols on large) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-navy-800">
                Recent Documents
              </h2>
            </div>
            {documents.length > 0 && (
              <Link
                href="/documents"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View all ({documents.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface border border-dashed border-muted-border text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-navy-800">
                  No documents uploaded yet
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Upload your first college circular, scholarship notice, or admission guideline to get instant plain-language explanations.
                </p>
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-surface border border-muted-border shadow-xs hover:shadow-card hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-navy-700 shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="text-sm font-bold text-navy-800 hover:text-primary transition-colors truncate block"
                      >
                        {doc.original_filename}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
                        <span className="capitalize">{doc.document_type || "General"}</span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                        <span>•</span>
                        <span>{doc.page_count} {doc.page_count === 1 ? "page" : "pages"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <DocumentStatusBadge status={doc.status} />
                    <Link
                      href={`/documents/${doc.id}`}
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-slate-50 transition-colors"
                      title="Open Document Workspace"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Incomplete Checklist & Deadlines */}
        <div className="space-y-6">
          {/* Action Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-navy-800">
                  Tasks Checklist
                </h2>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">
                  No tasks right now. Tasks extracted from your uploaded documents will appear here automatically.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl border border-muted-border/80 bg-slate-50/50 flex items-start gap-3 hover:bg-white transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => toggleTaskStatus(task.id, task.status)}
                        className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-medium leading-snug ${
                            task.status === "completed"
                              ? "line-through text-muted"
                              : "text-navy-800"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted mt-1">
                          {task.due_date && (
                            <span className="flex items-center gap-1 font-semibold text-navy-700">
                              <Calendar className="w-3 h-3 text-muted" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Upload Helper Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/60 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Got an Indian college notice?</span>
            </div>
            <p className="text-xs text-navy-700 leading-relaxed">
              Upload scholarship circulars, exam schedules, or hostel notices to instantly get an eligibility breakdown and plain Hindi explanation.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Upload PDF or Photo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
