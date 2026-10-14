"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentRecord, TaskRecord, ChatMessageRecord } from "@/lib/types";
import { DocumentStatusBadge, PriorityBadge } from "@/components/status-badge";
import { formatDate, formatBytes, formatDateTime } from "@/lib/utils";
import {
  FileText,
  Sparkles,
  Calendar,
  CheckSquare,
  HelpCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Send,
  MessageSquare,
  BookOpen,
  DollarSign,
  Languages,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Plus,
  Loader2,
  ShieldCheck,
  FileSearch,
  Quote,
} from "lucide-react";

export default function DocumentWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workspace UI states
  const [activeTab, setActiveTab] = useState<
    "overview" | "keyinfo" | "eligibility" | "tasks" | "dates" | "chat" | "rawtext"
  >("overview");
  const [langPreference, setLangPreference] = useState<"en" | "hi">("en");
  const [reanalyzing, setReanalyzing] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Document not found or you do not have permission to view it.");
        } else {
          setError("Failed to load document.");
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDocument(data.document);
      setTasks(data.tasks || []);
      setChatMessages(data.chatMessages || []);
    } catch (err: any) {
      setError(err.message || "Failed to load document workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/documents/${id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Re-analysis failed.");
      } else {
        await loadDocument();
      }
    } catch (err: any) {
      alert("Error triggering re-analysis: " + err.message);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!confirm("Are you sure you want to permanently delete this document and its associated tasks?")) {
      return;
    }
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/documents");
      } else {
        alert("Failed to delete document.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: id,
          title: newTaskTitle.trim(),
          dueDate: newTaskDueDate || null,
          priority: "medium",
        }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => [...prev, data.task]);
        setNewTaskTitle("");
        setNewTaskDueDate("");
        setShowAddTask(false);
      }
    } catch (err: any) {
      alert("Error adding task: " + err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = questionInput.trim();
    if (!q || sendingChat) return;

    setQuestionInput("");
    setSendingChat(true);

    const tempUserMsg: ChatMessageRecord = {
      id: "temp-" + Date.now(),
      document_id: id,
      user_id: "",
      role: "user",
      content: q,
      source_references: null,
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/documents/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();

      if (res.ok) {
        const assistantMsg: ChatMessageRecord = {
          id: "resp-" + Date.now(),
          document_id: id,
          user_id: "",
          role: "assistant",
          content: data.reply,
          source_references: data.sourceReferences || [],
          created_at: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessageRecord = {
          id: "err-" + Date.now(),
          document_id: id,
          user_id: "",
          role: "assistant",
          content: data.error || "Failed to get an answer from document intelligence.",
          source_references: null,
          created_at: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessageRecord = {
        id: "err-" + Date.now(),
        document_id: id,
        user_id: "",
        role: "assistant",
        content: "Network error while asking question.",
        source_references: null,
        created_at: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted mt-3">Loading document intelligence workspace...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-lg font-bold text-navy-800">Unable to load document</h2>
        <p className="text-xs text-muted">{error || "Document not found."}</p>
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </Link>
      </div>
    );
  }

  const analysis = document.analysis_result;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-muted-border">
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="p-2 rounded-xl text-muted hover:text-navy-800 hover:bg-slate-100 transition-colors"
            title="Back to Document Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-extrabold text-navy-800 truncate">
                {document.original_filename}
              </h1>
              <DocumentStatusBadge status={document.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
              <span className="font-semibold text-primary uppercase text-[10px] tracking-wider">
                {analysis?.documentType || document.document_type || "Document"}
              </span>
              <span>•</span>
              <span>{formatBytes(document.file_size)}</span>
              <span>•</span>
              <span>{document.page_count} {document.page_count === 1 ? "page" : "pages"}</span>
              <span>•</span>
              <span>Uploaded {formatDate(document.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-muted-border bg-white text-navy-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
            title="Re-run Gemini AI intelligence analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? "animate-spin text-primary" : ""}`} />
            <span>{reanalyzing ? "Analyzing..." : "Re-Analyze"}</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteDocument}
            className="p-2 rounded-xl border border-muted-border bg-white text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-muted-border overflow-x-auto gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Overview & Simple Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab("keyinfo")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "keyinfo"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Key Facts & Fees ({analysis?.keyPoints?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("eligibility")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "eligibility"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Eligibility & Docs ({analysis?.requiredDocuments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "tasks"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Action Checklist ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("dates")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "dates"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Important Dates ({analysis?.importantDates?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask PaperPilot</span>
          </button>

          <button
            onClick={() => setActiveTab("rawtext")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "rawtext"
                ? "border-primary text-primary"
                : "border-transparent text-navy-600 hover:text-navy-900"
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Extracted Source Text</span>
          </button>
        </div>

        {/* English/Hindi Toggle for Overview */}
        {activeTab === "overview" && (
          <div className="hidden sm:inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLangPreference("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                langPreference === "en" ? "bg-primary text-white shadow-xs" : "text-navy-700 hover:text-navy-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLangPreference("hi")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                langPreference === "hi" ? "bg-primary text-white shadow-xs" : "text-navy-700 hover:text-navy-900"
              }`}
            >
              हिन्दी
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW & PLAIN BREAKDOWN */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Simple Explanation Highlight Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border border-blue-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {langPreference === "en" ? "Plain Language Breakdown" : "सरल हिंदी व्याख्या"}
                  </span>
                </div>
                <div className="sm:hidden inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setLangPreference("en")}
                    className={`px-2 py-0.5 rounded ${langPreference === "en" ? "bg-primary text-white" : ""}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLangPreference("hi")}
                    className={`px-2 py-0.5 rounded ${langPreference === "hi" ? "bg-primary text-white" : ""}`}
                  >
                    HI
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-navy-800 font-medium">
                {langPreference === "en"
                  ? analysis?.simpleExplanationEnglish || analysis?.summary || "No AI explanation generated yet."
                  : analysis?.simpleExplanationHindi || "हिंदी स्पष्टीकरण अभी उपलब्ध नहीं है।"}
              </p>
            </div>

            {/* Document Purpose & Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 rounded-2xl bg-surface border border-muted-border shadow-card space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                  Comprehensive Summary
                </h3>
                <p className="text-xs sm:text-sm text-navy-700 leading-relaxed">
                  {analysis?.summary || "No detailed summary available."}
                </p>

                {analysis?.purpose && (
                  <div className="pt-3 border-t border-muted-border space-y-1">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Target Audience & Purpose
                    </span>
                    <p className="text-xs text-navy-800">{analysis.purpose}</p>
                  </div>
                )}
              </div>

              {/* Uncertainties & Warnings */}
              <div className="p-6 rounded-2xl bg-surface border border-muted-border shadow-card space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Missing Details & Uncertainties</span>
                </div>
                {analysis?.uncertainties && analysis.uncertainties.length > 0 ? (
                  <ul className="space-y-2 text-xs text-navy-700">
                    {analysis.uncertainties.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted">
                    No critical ambiguities or missing dates detected by PaperPilot.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEY FACTS & FEES */}
        {activeTab === "keyinfo" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Fees and Amounts Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                Amounts, Fees & Stipends
              </h3>
              {analysis?.amountsAndFees && analysis.amountsAndFees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {analysis.amountsAndFees.map((fee, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-surface border border-muted-border shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted uppercase">
                          {fee.feeName}
                        </span>
                        {fee.pageNumber && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-muted">
                            Page {fee.pageNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xl sm:text-2xl font-extrabold text-navy-800">
                        {fee.amount}
                      </p>
                      <div className="text-[11px] text-muted flex items-center justify-between pt-1">
                        <span>{fee.isRefundable ? "Refundable" : "Non-refundable"}</span>
                        {fee.deadline && <span>Pay by: {fee.deadline}</span>}
                      </div>
                      {fee.sourceExcerpt && (
                        <p className="text-[10px] text-muted italic border-t border-slate-100 pt-1.5">
                          &quot;{fee.sourceExcerpt}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted p-4 rounded-xl bg-surface border border-muted-border">
                  No monetary figures, fees, or scholarship amounts mentioned in this document.
                </p>
              )}
            </div>

            {/* Key Facts List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                Extracted Grounded Key Points
              </h3>
              {analysis?.keyPoints && analysis.keyPoints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-muted-border space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] uppercase">
                          {point.category || "Fact"}
                        </span>
                        {point.pageNumber && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-muted">
                            Page {point.pageNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-navy-800 leading-relaxed">
                        {point.point}
                      </p>
                      {point.sourceExcerpt && (
                        <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-muted italic">
                          <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{point.sourceExcerpt}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted p-4 rounded-xl bg-surface border border-muted-border">
                  No key points extracted.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ELIGIBILITY & REQUIRED DOCUMENTS */}
        {activeTab === "eligibility" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Eligibility Requirements */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                Eligibility Criteria
              </h3>
              {analysis?.eligibilityRequirements && analysis.eligibilityRequirements.length > 0 ? (
                <div className="space-y-3">
                  {analysis.eligibilityRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-muted-border flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              req.isMandatory
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {req.isMandatory ? "Mandatory" : "Optional"}
                          </span>
                          <span className="text-xs font-semibold text-muted">
                            Applies to: {req.appliesTo || "All"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-navy-800 leading-relaxed">
                          {req.requirement}
                        </p>
                        {req.sourceExcerpt && (
                          <p className="text-[11px] text-muted italic pt-1">
                            &quot;{req.sourceExcerpt}&quot;
                          </p>
                        )}
                      </div>
                      {req.pageNumber && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-muted whitespace-nowrap">
                          Page {req.pageNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted p-4 rounded-xl bg-surface border border-muted-border">
                  No explicit eligibility criteria found in this document.
                </p>
              )}
            </div>

            {/* Required Documents Checklist */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                Required Certificates & Documents to Submit
              </h3>
              {analysis?.requiredDocuments && analysis.requiredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.requiredDocuments.map((docItem, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-muted-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <h4 className="font-bold text-navy-800">{docItem.documentName}</h4>
                        </div>
                        {docItem.pageNumber && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-muted">
                            Page {docItem.pageNumber}
                          </span>
                        )}
                      </div>
                      {docItem.notes && (
                        <p className="text-xs text-muted pl-6">{docItem.notes}</p>
                      )}
                      {docItem.sourceExcerpt && (
                        <p className="text-[10px] text-muted italic pl-6 pt-1">
                          &quot;{docItem.sourceExcerpt}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted p-4 rounded-xl bg-surface border border-muted-border">
                  No specific required certificates listed.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TASKS & ACTION PLAN */}
        {activeTab === "tasks" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                  Document Action Plan Checklist
                </h3>
                <p className="text-xs text-muted">
                  Check off items as you complete them or add your own custom tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTask(!showAddTask)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <form onSubmit={handleCreateTask} className="p-4 rounded-2xl bg-surface border border-primary/40 shadow-card space-y-3">
                <h4 className="text-xs font-bold text-navy-800 uppercase">New Custom Task</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Attest marksheet with college dean"
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-muted-border text-xs text-navy-900 bg-white"
                  />
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-muted-border text-xs text-navy-900 bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Task list */}
            {tasks.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-muted-border space-y-2">
                <CheckSquare className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs text-muted">No checklist tasks for this document yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-surface border border-muted-border shadow-xs hover:shadow-card transition-all flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                      />
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
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-1">
                          {task.due_date && (
                            <span className="flex items-center gap-1 font-bold text-navy-700">
                              <Calendar className="w-3.5 h-3.5 text-muted" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                          <PriorityBadge priority={task.priority} />
                          {task.source_page && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-muted">
                              Page {task.source_page}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: IMPORTANT DATES */}
        {activeTab === "dates" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                Timeline & Deadlines
              </h3>
              <p className="text-xs text-muted">
                Distinguishes final application deadlines from document release dates and events.
              </p>
            </div>

            {analysis?.importantDates && analysis.importantDates.length > 0 ? (
              <div className="space-y-3">
                {analysis.importantDates.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border bg-surface flex items-start justify-between gap-4 ${
                      item.dateType === "deadline"
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-muted-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.dateType === "deadline"
                              ? "bg-rose-600 text-white"
                              : item.dateType === "event"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-navy-800"
                          }`}
                        >
                          {item.dateType}
                        </span>
                        {item.isAmbiguous && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                            Needs Verification
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-navy-800">{item.description}</h4>
                      {item.sourceExcerpt && (
                        <p className="text-xs text-muted italic">&quot;{item.sourceExcerpt}&quot;</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-navy-900 block">
                        {item.date}
                      </span>
                      {item.pageNumber && (
                        <span className="text-[11px] text-muted font-mono">
                          Page {item.pageNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted p-4 rounded-xl bg-surface border border-muted-border">
                No dates extracted from this document.
              </p>
            )}
          </div>
        )}

        {/* TAB 6: ASK PAPERPILOT (GROUNDED CHAT) */}
        {activeTab === "chat" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                Ask Questions Grounded in this Document
              </h3>
              <p className="text-xs text-muted">
                Answers cite exact page numbers and quotes. The AI will never invent facts not in the document.
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-semibold">Suggested:</span>
              {[
                "What is the final deadline to apply?",
                "Which documents do I need to bring?",
                "Explain the eligibility rules in Hindi",
                "What is the application or exam fee?",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuestionInput(suggestion);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-100 hover:bg-slate-200 text-navy-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card min-h-[350px] max-h-[500px] overflow-y-auto space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-muted">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">
                    No questions asked yet. Type a question below or pick a suggestion above.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-xs"
                          : "bg-slate-100 text-navy-800 rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Source Citations */}
                      {msg.role === "assistant" &&
                        msg.source_references &&
                        msg.source_references.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                              Source Citations:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.source_references.map((ref, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-navy-700 font-mono"
                                >
                                  {ref.pageNumber ? `Page ${ref.pageNumber}` : "Document"}
                                  {ref.quote && (
                                    <span className="max-w-[150px] truncate italic text-muted">
                                      - &quot;{ref.quote}&quot;
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                    <span className="text-[10px] text-muted mt-1 px-1">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                ))
              )}

              {sendingChat && (
                <div className="flex items-center gap-2 text-xs text-primary font-medium p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching document text & formulating grounded answer...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask anything about this document..."
                disabled={sendingChat}
                className="flex-1 px-4 py-3 rounded-xl border border-muted-border text-xs sm:text-sm text-navy-900 bg-white placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={sendingChat || !questionInput.trim()}
                className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: EXTRACTED SOURCE TEXT */}
        {activeTab === "rawtext" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                  Extracted Raw Text by Page
                </h3>
                <p className="text-xs text-muted">
                  Verify extracted text against the original document.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-muted-border font-mono text-xs text-navy-800 whitespace-pre-wrap max-h-[600px] overflow-y-auto leading-relaxed shadow-card">
              {document.extracted_text || "No text available."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
