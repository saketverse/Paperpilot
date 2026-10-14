import React from "react";
import { DocumentStatus, TaskStatus, TaskPriority } from "@/lib/types";
import { Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Ready
        </span>
      );
    case "analyzing":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          Analyzing AI
        </span>
      );
    case "extracting":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
          Extracting Text
        </span>
      );
    case "uploaded":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3 h-3 text-slate-500" />
          Queued
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Failed
        </span>
      );
    default:
      return null;
  }
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case "high":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
          High
        </span>
      );
    case "medium":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
          Medium
        </span>
      );
    case "low":
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
          Low
        </span>
      );
  }
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}
