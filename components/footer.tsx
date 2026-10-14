import React from "react";
import Link from "next/link";
import { BrandLogo } from "./brand-mark";
import { ShieldCheck, Lock, Sparkles, FileCheck2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-muted-border bg-white text-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <BrandLogo />
            <p className="text-sm text-muted leading-relaxed">
              Understand Documents. Know What To Do Next.
            </p>
            <p className="text-xs text-muted leading-relaxed">
              PaperPilot transforms confusing college circulars, scholarship rules, admission notifications, and legal notices into simple English/Hindi explanations, key facts, deadlines, and checklists.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-navy-600">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-primary transition-colors">
                  Upload Document
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-primary transition-colors">
                  Document Library
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-primary transition-colors">
                  Task Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Documents */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
              Supported Documents
            </h4>
            <ul className="space-y-2.5 text-sm text-navy-600">
              <li>College & University Circulars</li>
              <li>Scholarship & Fellowship Schemes</li>
              <li>Admission Rules & Entrance Exams</li>
              <li>Job & Internship Notifications</li>
              <li>Government Orders & Bills</li>
            </ul>
          </div>

          {/* Security & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
              Privacy & Trust
            </h4>
            <div className="space-y-2.5 text-xs text-muted">
              <div className="flex items-center gap-2 text-navy-700">
                <Lock className="w-4 h-4 text-primary" />
                <span>Private Object Storage</span>
              </div>
              <div className="flex items-center gap-2 text-navy-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Postgres Row-Level Security</span>
              </div>
              <div className="flex items-center gap-2 text-navy-700">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Source-Grounded Citations</span>
              </div>
              <div className="flex items-center gap-2 text-navy-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Strict Anti-Hallucination Guardrails</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-muted-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} PaperPilot. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/#privacy" className="hover:text-navy-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#terms" className="hover:text-navy-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/settings" className="hover:text-navy-900 transition-colors">
              Data Controls
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
