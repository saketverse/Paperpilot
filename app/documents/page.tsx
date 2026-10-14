"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DocumentRecord } from "@/lib/types";
import { DocumentStatusBadge } from "@/components/status-badge";
import { formatDate, formatBytes } from "@/lib/utils";
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function DocumentsLibraryPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const supabase = createClient();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setDocuments(data as DocumentRecord[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Are you sure you want to permanently delete this document?")) return;

    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/documents/${id}`, { method: "DELETE" });
    } catch {
      alert("Failed to delete document.");
      loadDocuments();
    }
  };

  // Filter & Sort
  const filteredDocs = documents
    .filter((doc) => {
      const titleMatch =
        doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.analysis_result?.documentTitle || "").toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch =
        selectedType === "all" ||
        (doc.document_type || "").toLowerCase() === selectedType.toLowerCase() ||
        (doc.analysis_result?.documentType || "").toLowerCase() === selectedType.toLowerCase();
      const statusMatch = selectedStatus === "all" || doc.status === selectedStatus;
      return titleMatch && typeMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "name") return a.original_filename.localeCompare(b.original_filename);
      return 0;
    });

  const allTypes = Array.from(
    new Set(
      documents
        .map((d) => d.analysis_result?.documentType || d.document_type || "general")
        .filter(Boolean)
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
            Document Library
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Manage, search, and reopen all your uploaded documents and AI intelligence sheets.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-muted-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name or title..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-muted-border text-xs text-navy-900 bg-white placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          {/* Document Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-muted-border bg-white text-navy-800 font-medium"
          >
            <option value="all">All Document Types</option>
            {allTypes.map((t, idx) => (
              <option key={idx} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-muted-border bg-white text-navy-800 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Ready</option>
            <option value="analyzing">Analyzing</option>
            <option value="extracting">Extracting</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-muted-border bg-white text-navy-800 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Document Grid / List */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted mt-2">Loading documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-dashed border-muted-border text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-navy-800">No documents found</h3>
            <p className="text-xs text-muted leading-relaxed">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                ? "No documents match your current filter criteria."
                : "Your document library is empty. Upload your first circular or notice to begin."}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const title = doc.analysis_result?.documentTitle || doc.original_filename;
            const summary = doc.analysis_result?.summary || doc.analysis_result?.purpose;

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-surface border border-muted-border shadow-xs hover:shadow-card hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <DocumentStatusBadge status={doc.status} />
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-sm font-bold text-navy-800 hover:text-primary transition-colors line-clamp-1 block"
                      title={title}
                    >
                      {title}
                    </Link>
                    <p className="text-[11px] text-muted font-mono truncate">
                      {doc.original_filename}
                    </p>
                  </div>

                  {summary && (
                    <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
                      {summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-muted-border flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(doc.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id, doc.storage_path)}
                      className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-navy-700 font-semibold transition-colors flex items-center gap-1 text-xs"
                    >
                      <span>Open</span>
                      <Eye className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
