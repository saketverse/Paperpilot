"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "hi">("en");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            preferred_language: preferredLanguage,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setSuccess("Account created successfully! If email confirmation is required, please check your inbox.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-muted-border shadow-lifted space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-navy-800 tracking-tight">
          Create your account
        </h1>
        <p className="text-xs text-muted">
          Start converting confusing circulars into clear facts and checklists in seconds.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-navy-700">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-muted absolute left-3 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aarav Sharma"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-muted-border text-sm text-navy-900 bg-white placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-navy-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-muted-border text-sm text-navy-900 bg-white placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-navy-700">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-muted-border text-sm text-navy-900 bg-white placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted hover:text-navy-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-navy-700">
            Preferred Explanation Language
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPreferredLanguage("en")}
              className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                preferredLanguage === "en"
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                  : "border-muted-border bg-white text-navy-700 hover:bg-slate-50"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setPreferredLanguage("hi")}
              className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                preferredLanguage === "hi"
                  ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                  : "border-muted-border bg-white text-navy-700 hover:bg-slate-50"
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Sign Up Free</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
