"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./brand-mark";
import { LanguageSwitch } from "./language-switch";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  LayoutDashboard,
  CheckSquare,
  UploadCloud,
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  User,
} from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("user");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();
        if (profile) setRole(profile.role);
      }
    }
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) {
    return (
      <header className="w-full border-b border-muted-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <BrandLogo />
          </Link>
          <LanguageSwitch />
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b border-muted-border bg-surface/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={user ? "/dashboard" : "/"} className="focus:outline-none">
          <BrandLogo />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/dashboard"
                    ? "text-primary font-semibold"
                    : "text-navy-600 hover:text-navy-900"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/upload"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/upload"
                    ? "text-primary font-semibold"
                    : "text-navy-600 hover:text-navy-900"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                Upload
              </Link>
              <Link
                href="/documents"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/documents")
                    ? "text-primary font-semibold"
                    : "text-navy-600 hover:text-navy-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                Documents
              </Link>
              <Link
                href="/tasks"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/tasks"
                    ? "text-primary font-semibold"
                    : "text-navy-600 hover:text-navy-900"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Tasks
              </Link>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 transition-colors ${
                    pathname === "/admin"
                      ? "text-primary font-semibold"
                      : "text-navy-600 hover:text-navy-900"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <a
                href="#features"
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#documents"
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                Supported Documents
              </a>
              <a
                href="#faq"
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                FAQ
              </a>
            </>
          )}
        </nav>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitch />

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                title="Settings"
                className={`p-2 rounded-lg text-navy-600 hover:text-navy-900 hover:bg-slate-100 transition-colors ${
                  pathname === "/settings" ? "bg-slate-100 text-primary font-semibold" : ""
                }`}
              >
                <Settings className="w-4 h-4" />
              </Link>
              <div className="h-4 w-px bg-muted-border" />
              <div className="flex items-center gap-2 text-xs text-navy-700">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user.email ? user.email.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="font-medium truncate max-w-[120px]">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-navy-700 hover:text-primary transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageSwitch />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-navy-700 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-muted-border bg-surface px-4 pt-3 pb-6 space-y-3">
          {user ? (
            <>
              <div className="px-2 py-2 text-xs font-semibold text-muted uppercase tracking-wider">
                Menu
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-800 hover:bg-slate-100 font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                Dashboard
              </Link>
              <Link
                href="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-800 hover:bg-slate-100 font-medium"
              >
                <UploadCloud className="w-4 h-4 text-primary" />
                Upload Document
              </Link>
              <Link
                href="/documents"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-800 hover:bg-slate-100 font-medium"
              >
                <FileText className="w-4 h-4 text-primary" />
                Documents
              </Link>
              <Link
                href="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-800 hover:bg-slate-100 font-medium"
              >
                <CheckSquare className="w-4 h-4 text-primary" />
                Tasks
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-800 hover:bg-slate-100 font-medium"
              >
                <Settings className="w-4 h-4 text-navy-600" />
                Settings
              </Link>
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 font-medium"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-muted-border">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 px-4 rounded-lg border border-muted-border text-sm font-semibold text-navy-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 px-4 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
