"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-mark";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-muted-border shadow-lifted space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-navy-800 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-muted">
          Sign in to access your document workspace, extracted checklists, and chat history.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="you@college.edu or name@gmail.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-muted-border text-sm text-navy-900 bg-white placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-navy-700">
              Password
            </label>
            <span className="text-[11px] text-muted hover:text-primary transition-colors cursor-pointer">
              Forgot?
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
            <input
              type={showPassword ? "text" : "password"}
              required
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

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-muted">
        Don&apos;t have an account?{" "}
        <Link href={`/signup?redirect=${encodeURIComponent(redirectPath)}`} className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
