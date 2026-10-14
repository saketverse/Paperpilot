import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ShieldAlert, FileText, CheckCircle2, AlertTriangle, Users, Database, HardDrive, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Server-side Authorization Check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // Ordinary users cannot access administration
    redirect("/dashboard");
  }

  // Fetch safe operational metrics
  const { count: totalDocs } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  const { count: completedDocs } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: failedDocs } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");

  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Fetch recent error records (safe operational log)
  const { data: errorRecords } = await supabase
    .from("documents")
    .select("id, original_filename, status, error_code, created_at")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(10);

  const successRate = totalDocs && totalDocs > 0
    ? Math.round(((completedDocs || 0) / totalDocs) * 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/10 border border-amber-300/60 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Authorized Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
            PaperPilot Operational Telemetry
          </h1>
          <p className="text-xs text-navy-700">
            Real-time pipeline health, document throughput, error rates, and storage metrics.
          </p>
        </div>

        <div className="text-xs text-muted text-right">
          <span className="font-semibold text-navy-800">Admin: {profile.display_name || user.email}</span>
          <span className="block text-[11px]">Strict Server Authorization Enforced</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Documents</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-navy-800">{totalDocs || 0}</p>
          <span className="text-[11px] text-muted">Ingested across all users</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{successRate}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Pipeline completion</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Processing Failures</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{failedDocs || 0}</p>
          <span className="text-[11px] text-rose-600 font-medium">Requiring inspection</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Profiles</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-purple-600">{totalUsers || 0}</p>
          <span className="text-[11px] text-muted">{totalTasks || 0} active tasks generated</span>
        </div>
      </div>

      {/* Failure Log Table */}
      <div className="p-6 rounded-2xl bg-surface border border-muted-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-navy-800">
              Safe Operational Incident Log
            </h2>
          </div>
          <span className="text-xs text-muted">Recent processing anomalies</span>
        </div>

        {errorRecords && errorRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-navy-700 font-bold border-b border-muted-border">
                <tr>
                  <th className="py-2.5 px-3">Document Filename</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Error Classification</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {errorRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-navy-800 truncate max-w-xs">
                      {rec.original_filename}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted">
                      {rec.error_code || "UNKNOWN_ERROR"}
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {formatDate(rec.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-semibold text-navy-800">All systems operating within nominal limits</p>
            <p className="text-[11px] text-muted">No processing failures recorded in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
