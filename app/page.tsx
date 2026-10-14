"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Calendar,
  Languages,
  CheckCircle2,
  Lock,
  ChevronDown,
  HelpCircle,
  FileCheck,
  Search,
  ExternalLink,
  Layers,
  GraduationCap,
  Briefcase,
  Receipt,
  FileBadge,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "dates" | "tasks" | "qa">("summary");
  const [demoLang, setDemoLang] = useState<"en" | "hi">("en");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-surface to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-primary text-xs font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Next-Generation AI Document Intelligence</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-navy-800 tracking-tight leading-[1.12]">
              Understand Documents. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-[#1D4ED8] bg-clip-text text-transparent">
                Know What To Do Next.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto">
              Transform confusing college circulars, scholarship rules, admission notices, and legal bills into clear English & Hindi explanations, confirmed deadlines, and actionable checklists.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-base font-semibold shadow-lifted hover:shadow-lg transition-all"
              >
                <span>Analyze Your Document Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo-preview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-muted-border text-navy-800 text-base font-medium shadow-sm transition-all"
              >
                <span>See Interactive Demo</span>
              </a>
            </div>

            {/* Social proof / Trust badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero Hallucinations Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-primary" />
                Private Storage & RLS
              </span>
              <span className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-purple-600" />
                English & Hindi Support
              </span>
            </div>
          </div>

          {/* INTERACTIVE DOCUMENT ANALYSIS PREVIEW */}
          <div id="demo-preview" className="mt-14 max-w-4xl mx-auto">
            <div className="bg-surface rounded-2xl border border-muted-border shadow-lifted overflow-hidden">
              {/* Document Header Bar */}
              <div className="bg-navy-800 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-navy-700 text-primary">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">
                        National_Merit_Scholarship_2026_Notice.pdf
                      </h3>
                      <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Analyzed
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Ministry of Education & State Higher Education Board • Page 1 of 4
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">Explanation Language:</span>
                  <div className="inline-flex rounded-lg bg-navy-700 p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setDemoLang("en")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        demoLang === "en" ? "bg-primary text-white" : "text-slate-300 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setDemoLang("hi")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        demoLang === "hi" ? "bg-primary text-white" : "text-slate-300 hover:text-white"
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-muted-border bg-slate-50/70 px-4 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "summary"
                      ? "border-primary text-primary"
                      : "border-transparent text-navy-600 hover:text-navy-900"
                  }`}
                >
                  Overview & Plain Explanation
                </button>
                <button
                  onClick={() => setActiveTab("dates")}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "dates"
                      ? "border-primary text-primary"
                      : "border-transparent text-navy-600 hover:text-navy-900"
                  }`}
                >
                  Key Dates & Deadlines (3)
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "tasks"
                      ? "border-primary text-primary"
                      : "border-transparent text-navy-600 hover:text-navy-900"
                  }`}
                >
                  Action Checklist (4)
                </button>
                <button
                  onClick={() => setActiveTab("qa")}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "qa"
                      ? "border-primary text-primary"
                      : "border-transparent text-navy-600 hover:text-navy-900"
                  }`}
                >
                  Grounded Q&A
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {activeTab === "summary" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-navy-800">
                      <div className="flex items-center gap-2 font-bold text-sm text-primary mb-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>{demoLang === "en" ? "Plain Language Breakdown" : "सरल हिंदी स्पष्टीकरण"}</span>
                      </div>
                      {demoLang === "en" ? (
                        <p className="text-sm leading-relaxed text-navy-700">
                          This circular announces the 2026 Merit-cum-Means Scholarship for 1st-year undergraduate students in engineering, arts, and science. Eligible students receive ₹25,000/year toward college tuition. You must have scored at least 65% in Class 12 and have a family income under ₹3.5 Lakhs/year. Applications must be completed online before the hard deadline of October 25, 2026.
                        </p>
                      ) : (
                        <p className="text-sm leading-relaxed text-navy-700">
                          यह परिपत्र इंजीनियरिंग, आर्ट्स और साइंस में प्रथम वर्ष के अंडरग्रेजुएट छात्रों के लिए 2026 मेरिट-कम-मीन्स स्कॉलरशिप की घोषणा करता है। पात्र छात्रों को कॉलेज ट्यूशन के लिए ₹25,000 प्रति वर्ष मिलेंगे। आपके 12वीं में कम से कम 65% अंक होने चाहिए और पारिवारिक वार्षिक आय ₹3.5 लाख से कम होनी चाहिए। अंतिम तिथि 25 अक्टूबर 2026 से पहले ऑनलाइन आवेदन अनिवार्य है।
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-muted-border bg-white shadow-xs">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Scholarship Amount
                        </span>
                        <p className="text-xl font-bold text-navy-800 mt-1">₹25,000 / year</p>
                        <span className="text-xs text-emerald-600 font-medium">Direct Bank Transfer (DBT)</span>
                      </div>
                      <div className="p-4 rounded-xl border border-muted-border bg-white shadow-xs">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Eligibility Threshold
                        </span>
                        <p className="text-xl font-bold text-navy-800 mt-1">Class 12 ≥ 65%</p>
                        <span className="text-xs text-muted">Annual Income &lt; ₹3.5 Lakhs [Page 2]</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "dates" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white">
                            Hard Deadline
                          </span>
                          <h4 className="font-semibold text-sm text-navy-900">
                            Final Date for Online Application Submission
                          </h4>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          The National Scholarship Portal closes at 11:59 PM. Late submissions will not be accepted.
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-rose-700">25 Oct 2026</span>
                        <span className="block text-[11px] text-muted">Page 3, Section 4.1</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-muted-border bg-white flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white">
                            Institutional Deadline
                          </span>
                          <h4 className="font-semibold text-sm text-navy-900">
                            College Principal Verification
                          </h4>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          College administration must verify documents submitted by candidates.
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-navy-800">05 Nov 2026</span>
                        <span className="block text-[11px] text-muted">Page 3, Section 4.3</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "tasks" && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    {[
                      { title: "Get Income Certificate issued by Tehsildar/Revenue Office", due: "20 Oct 2026", page: "Page 2" },
                      { title: "Verify Bank Account is seeded with Aadhaar for DBT", due: "22 Oct 2026", page: "Page 3" },
                      { title: "Fill online form on National Scholarship Portal", due: "25 Oct 2026", page: "Page 1" },
                      { title: "Submit physical printout to College Scholarship Desk", due: "30 Oct 2026", page: "Page 4" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-muted-border bg-white flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={idx === 0}
                            readOnly
                            className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                          />
                          <span className={`text-sm ${idx === 0 ? "line-through text-muted" : "text-navy-800 font-medium"}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="font-medium text-navy-700">{item.due}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px]">{item.page}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "qa" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-muted-border space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-navy-800 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px]">User</span>
                        <span>Can students currently taking a gap year apply for this scholarship?</span>
                      </div>
                      <div className="pl-4 border-l-2 border-primary space-y-1">
                        <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px]">
                          <BrandMark className="w-3.5 h-3.5" />
                          <span>PaperPilot Verified Answer</span>
                        </div>
                        <p className="text-navy-700 text-xs leading-relaxed">
                          No. According to Clause 3.2 on Page 2, only candidates who have cleared Class 12 in the immediate current academic year (2025-2026) are eligible. Gap year students are explicitly excluded.
                        </p>
                        <span className="inline-block mt-1 text-[10px] text-muted font-mono bg-white px-2 py-0.5 rounded border border-muted-border">
                          Source: Page 2, Section 3.2 ("Eligibility & Year of Passing")
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / FEATURES */}
      <section id="features" className="py-20 bg-surface border-t border-muted-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-800 tracking-tight">
              Engineered for absolute accuracy and zero guesswork
            </h3>
            <p className="text-sm text-muted">
              Built specifically to handle Indian college notifications, circulars, and official forms that confuse students and applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-muted-border bg-[#F8F9FC] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-navy-800">
                100% Grounded in Source Text
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Every extracted deadline, amount, or eligibility requirement cites the exact source page number and quote. If a fact isn&apos;t in the document, PaperPilot never invents it.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-muted-border bg-[#F8F9FC] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Languages className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-navy-800">
                Bilingual English & Hindi Explanations
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Toggle seamlessly between plain English and conversational Hindi explanations. Official terms, dates, and bank transfer requirements remain crystal clear.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-muted-border bg-[#F8F9FC] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-navy-800">
                Actionable Tasks & Deadlines
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Instructions turn into an interactive checklist. Track deadlines, edit task names, mark items complete, and never miss an application submission date.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-muted-border bg-[#F8F9FC] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-navy-800">
                Built-in OCR for Scans & Images
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Upload scanned PDF circulars, photocopies, or smartphone camera photos (PNG/JPG). In-browser WASM OCR extracts text from even low-resolution scans.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-muted-border bg-[#F8F9FC] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-navy-800">
                Interactive Document Chat
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Ask specific questions like &quot;Which documents do I need to bring?&quot; or &quot;What is the exam fee for OBC candidates?&quot; and get page-cited answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-muted-border bg-[#F8F9FC] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-navy-800">
                Private & Secure by Default
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Files are stored in private Supabase buckets protected by Row Level Security (RLS). Your documents are never shared or used to train public models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-background border-t border-muted-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              How It Works
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-800 tracking-tight">
              From confusing PDF to clear next steps in 30 seconds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Upload Document",
                desc: "Drop your PDF, PNG, or JPG file. We validate file signature, page count, and structure securely.",
              },
              {
                step: "02",
                title: "Extract & OCR",
                desc: "Digital text is extracted page-by-page. Scanned notices are parsed through high-precision OCR.",
              },
              {
                step: "03",
                title: "AI Analysis",
                desc: "Gemini structures the circular into plain English & Hindi, extracting fees, dates, and eligibility.",
              },
              {
                step: "04",
                title: "Execute Checklist",
                desc: "Follow your generated action items, ask follow-up questions, and track deadlines on your dashboard.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-surface p-6 rounded-2xl border border-muted-border shadow-card relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-3xl font-black text-primary/20">{item.step}</span>
                  <h4 className="text-base font-bold text-navy-800">{item.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORTED DOCUMENT TYPES */}
      <section id="documents" className="py-20 bg-surface border-t border-muted-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Versatile Intelligence
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-800 tracking-tight">
              Designed for everyday high-stakes documents
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { icon: GraduationCap, title: "Scholarship Notices", desc: "Eligibility, income limits, and application deadlines" },
              { icon: FileBadge, title: "Admission Circulars", desc: "Seat allocation, counseling rounds, and reporting dates" },
              { icon: Briefcase, title: "Job & Internship Posts", desc: "Required qualifications, experience, and test dates" },
              { icon: Calendar, title: "Exam Timetables", desc: "Exam schedules, hall ticket rules, and allowed materials" },
              { icon: Receipt, title: "Fee & Utility Bills", desc: "Due dates, late fee penalties, and payment channels" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-muted-border bg-[#F8F9FC] text-center space-y-2 hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 mx-auto rounded-lg bg-white border border-muted-border flex items-center justify-center text-primary shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-navy-800">{item.title}</h4>
                  <p className="text-[11px] text-muted leading-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-background border-t border-muted-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Frequently Asked Questions
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-800 tracking-tight">
              Everything you need to know about PaperPilot
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does PaperPilot prevent AI hallucinations?",
                a: "PaperPilot uses strict grounding rules and prompt engineering. The AI is explicitly constrained to only extract facts asserted in the document text and must cite the source page number. If an item like a fee or deadline is missing from the document, PaperPilot states that it is not specified rather than inventing one.",
              },
              {
                q: "Can PaperPilot read scanned PDFs and smartphone camera photos?",
                a: "Yes. PaperPilot includes integrated OCR (Optical Character Recognition) supporting both English and Hindi. When a scanned PDF or photo (PNG, JPG) is uploaded, OCR extracts the text before passing it to the intelligence engine.",
              },
              {
                q: "Are my uploaded documents private and secure?",
                a: "Yes. Documents are uploaded to private Supabase Object Storage protected by PostgreSQL Row Level Security (RLS). Only your authenticated account can view, analyze, or delete your files.",
              },
              {
                q: "Can I manage and edit the tasks generated by PaperPilot?",
                a: "Absolutely. Any extracted task can be marked complete, edited with a custom due date, or deleted from your workspace or global Tasks dashboard.",
              },
              {
                q: "How do I configure my Gemini API key?",
                a: "PaperPilot connects to Google Gemini via your server environment. Simply add GEMINI_API_KEY to your .env.local file or platform environment settings. If not yet configured, PaperPilot guides you through setup without breaking other features.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-muted-border bg-white overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-navy-800 hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-muted leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-navy-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop guessing what your official documents mean.
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
            Get crystal-clear breakdowns, confirmed dates, and step-by-step checklists in seconds.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-base font-semibold shadow-lifted transition-all"
            >
              <span>Get Started With PaperPilot Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
