"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileUp,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

type StepStatus = "idle" | "uploading" | "extracting" | "analyzing" | "completed" | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<StepStatus>("idle");
  const [currentStepText, setCurrentStepText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setErrorMessage(null);

    // Validate size (15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMessage("File size exceeds 15MB. Please choose a smaller file.");
      return;
    }

    // Validate type
    const validExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMessage(
        "Unsupported format. Please upload a PDF, PNG, JPG, or WEBP document."
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleProcessUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setCurrentStepText("Securing upload to private storage...");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Transition to text extraction step
      setTimeout(() => {
        if (status !== "error") {
          setStatus("extracting");
          setCurrentStepText("Extracting digital text & running OCR scan...");
        }
      }, 1500);

      // Transition to AI analysis step
      setTimeout(() => {
        if (status !== "error") {
          setStatus("analyzing");
          setCurrentStepText("Gemini AI analyzing dates, eligibility & tasks...");
        }
      }, 3500);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data.error || "Processing failed. Please check the document and retry."
        );
        return;
      }

      setStatus("completed");
      setCurrentStepText("Intelligence breakdown complete!");
      setCreatedDocId(data.documentId);

      // Automatically navigate to document workspace
      setTimeout(() => {
        router.push(`/documents/${data.documentId}`);
      }, 1200);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(
        err.message || "Network error during upload. Please check your connection."
      );
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setErrorMessage(null);
    setCreatedDocId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-8">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
          Upload Your Document
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Upload any official circular, scholarship notice, admission form, or bill. We&apos;ll extract the text, analyze requirements, and build your action plan.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-xs sm:text-sm text-rose-700 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Upload Notice</span>
            <p className="text-xs leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {status === "idle" || status === "error" ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-4 ${
              dragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-slate-300 hover:border-primary/60 bg-surface shadow-xs hover:shadow-card"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm sm:text-base font-bold text-navy-800">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-muted">
                Supports PDF, PNG, JPG, JPEG, and WEBP (Up to 15MB)
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary pt-2">
              <FileUp className="w-4 h-4" />
              <span>Select File from Computer</span>
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="p-5 rounded-2xl bg-surface border border-muted-border shadow-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-xl bg-blue-50 text-primary shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-navy-800 truncate">
                    {file.name}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {formatBytes(file.size)} • {file.type || "Document"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={resetUpload}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-navy-800 hover:bg-slate-100"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleProcessUpload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all"
                >
                  <span>Start Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Processing Pipeline Active State */
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-surface border border-muted-border shadow-lifted space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            {status === "completed" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-in zoom-in" />
            ) : (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-navy-800">
              {status === "completed" ? "Analysis Ready!" : "Processing Document"}
            </h3>
            <p className="text-xs text-muted">{currentStepText}</p>
          </div>

          {/* Stepper indicator */}
          <div className="space-y-3 pt-2 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  status !== "uploading"
                    ? "bg-emerald-500 text-white"
                    : "bg-primary text-white animate-pulse"
                }`}
              >
                1
              </div>
              <span className="font-medium text-navy-800">Upload to Private Storage</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  status === "analyzing" || status === "completed"
                    ? "bg-emerald-500 text-white"
                    : status === "extracting"
                    ? "bg-primary text-white animate-pulse"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                2
              </div>
              <span className="font-medium text-navy-800">Text Extraction & OCR</span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  status === "completed"
                    ? "bg-emerald-500 text-white"
                    : status === "analyzing"
                    ? "bg-primary text-white animate-pulse"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                3
              </div>
              <span className="font-medium text-navy-800">Gemini AI Grounded Analysis</span>
            </div>
          </div>

          {status === "completed" && createdDocId && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push(`/documents/${createdDocId}`)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm"
              >
                <span>Go to Workspace Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
