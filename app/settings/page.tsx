"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SupportedLanguage } from "@/lib/types";
import {
  User,
  Mail,
  Languages,
  Shield,
  Trash2,
  LogOut,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Key,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) return;
      setUser(currentUser);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (prof) {
        setProfile(prof);
        setDisplayName(prof.display_name || "");
        setLanguage(prof.preferred_language || "en");
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          preferred_language: language,
        })
        .eq("id", user.id);

      localStorage.setItem("paperpilot_lang", language);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleWipeData = async () => {
    const confirmation = prompt(
      "WARNING: This will permanently delete ALL your uploaded documents, extracted intelligence sheets, checklists, and chat history. To proceed, type 'DELETE' below:"
    );

    if (confirmation !== "DELETE") return;

    setWiping(true);
    try {
      const res = await fetch("/api/user/data", { method: "DELETE" });
      if (res.ok) {
        setWipeSuccess(true);
        setTimeout(() => setWipeSuccess(false), 4000);
      } else {
        alert("Failed to wipe data.");
      }
    } catch (err: any) {
      alert("Error wiping data: " + err.message);
    } finally {
      setWiping(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-muted mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 tracking-tight">
          Account Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Manage your personal profile, preferred language, and data privacy controls.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {wipeSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All documents and derived data wiped successfully.</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 rounded-2xl bg-surface border border-muted-border shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-muted-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy-800">User Profile</h2>
            <p className="text-xs text-muted">Your identity and language settings</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-navy-700">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted-border text-sm text-navy-900 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-navy-700">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-3.5 py-2.5 rounded-xl border border-muted-border text-sm text-muted bg-slate-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-navy-700">
              Default Explanation Language
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  language === "en"
                    ? "border-primary bg-primary/5 text-primary shadow-xs"
                    : "border-muted-border bg-white text-navy-700 hover:bg-slate-50"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  language === "hi"
                    ? "border-primary bg-primary/5 text-primary shadow-xs"
                    : "border-muted-border bg-white text-navy-700 hover:bg-slate-50"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* AI Engine Status */}
      <div className="p-6 rounded-2xl bg-surface border border-muted-border shadow-card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-muted-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-800">
                Google Gemini AI Integration
              </h2>
              <p className="text-xs text-muted">Document analysis & grounded reasoning</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Configured on Server
          </span>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          PaperPilot connects directly to the Gemini API server-side using zero-temperature grounded schemas. Your documents are never logged or used for external model training.
        </p>
      </div>

      {/* Privacy & Data Deletion Controls */}
      <div className="p-6 rounded-2xl bg-surface border border-rose-200/80 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-rose-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-rose-800">
              Privacy & Data Deletion
            </h2>
            <p className="text-xs text-muted">Complete control over your personal data</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted leading-relaxed">
          <p>
            Under PaperPilot&apos;s privacy guarantees, you have the unilateral right to delete all your uploaded circulars, extracted text, checklist items, and conversational logs at any time.
          </p>
          <p className="text-rose-600 font-medium">
            This action is irreversible and wipes all storage bucket files and database records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleWipeData}
          disabled={wiping}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold transition-all disabled:opacity-60"
        >
          {wiping ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
          <span>Wipe All My Documents & Data</span>
        </button>
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-muted-border bg-white text-navy-800 hover:bg-slate-100 text-xs font-semibold shadow-xs"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Sign Out of PaperPilot</span>
        </button>
      </div>
    </div>
  );
}
