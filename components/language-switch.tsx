"use client";

import React, { useEffect, useState } from "react";
import { SupportedLanguage } from "@/lib/types";
import { Languages } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LanguageSwitch() {
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("paperpilot_lang") as SupportedLanguage;
    if (saved === "en" || saved === "hi") {
      setLang(saved);
    }
  }, []);

  const handleToggle = async (newLang: SupportedLanguage) => {
    setLang(newLang);
    localStorage.setItem("paperpilot_lang", newLang);
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLang }));

    // Update profile in Supabase if logged in
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ preferred_language: newLang })
          .eq("id", user.id);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-muted-border bg-white p-0.5 text-xs font-medium shadow-sm">
      <button
        type="button"
        onClick={() => handleToggle("en")}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          lang === "en"
            ? "bg-primary text-white shadow-xs font-semibold"
            : "text-navy-600 hover:text-navy-900 hover:bg-slate-50"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => handleToggle("hi")}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          lang === "hi"
            ? "bg-primary text-white shadow-xs font-semibold"
            : "text-navy-600 hover:text-navy-900 hover:bg-slate-50"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
