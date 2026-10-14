# PaperPilot — Complete AI Document Intelligence Web Application

> **Understand Documents. Know What To Do Next.**

PaperPilot is an AI-powered document intelligence web application specifically designed for college circulars, scholarship announcements, admission instructions, internship notifications, application forms, bills, and scanned documents.

---

## 🌟 Key Features

1. **Grounded Document Intelligence**:
   - Every extracted deadline, eligibility condition, or fee cites its exact source page number (`[Page X]`) and verbatim excerpt.
   - Zero hallucination policy: if an item is not in the document, PaperPilot states that it is absent.

2. **Bilingual English & Hindi Explanations**:
   - Instant toggle between simple, friendly plain English and conversational Hindi explanations.
   - Preserves critical official terminology, dates, amounts, and conditions.

3. **Digital PDF Text Extraction & WASM OCR**:
   - Digital multi-page PDF text extraction preserving page boundaries.
   - Pure client/server WASM OCR using `tesseract.js` for images (PNG, JPG, WEBP) and scanned forms with English & Hindi support.

4. **Actionable Checklist & Task Management**:
   - Instructions automatically transform into interactive checklist items with suggested due dates and priority tags.
   - Inline task editing, due date updates, status toggles (Pending/Completed), and deletion.

5. **Document-Grounded Conversational Chat**:
   - Interactive Q&A strictly grounded in the uploaded document.
   - Clickable source citations referencing specific pages and quotes.

6. **Privacy & Security**:
   - Private Supabase Object Storage with owner-restricted access policies.
   - PostgreSQL Row Level Security (RLS) on all user tables.
   - Server-enforced role-based access for administration telemetry.
   - One-click privacy data wipe ("Wipe All My Data").

---

## 🏗️ Architecture & Tech Stack

```
PaperPilot (Next.js 15 App Router + React 19)
├── Frontend: Tailwind CSS, Lucide Icons, Responsive Multi-Tab Workspace
├── Backend: Next.js Server Route Handlers, Supabase SSR Auth Cookies
├── Database: Supabase PostgreSQL with strict Row Level Security (RLS)
├── Storage: Supabase Private S3-compatible Object Storage Bucket ('documents')
├── Document Processing:
│   ├── PDF.js / pdf-parse for multi-page digital text extraction
│   └── Tesseract.js (WASM) for multilingual OCR of scans & photos
└── AI Engine: Google Gemini API (gemini-1.5-flash / gemini-2.5-flash) with structured Zod schemas
```

---

## 🔒 Security & Data Privacy

- **Row Level Security (RLS)**: Enforced on `profiles`, `documents`, `tasks`, and `chat_messages`. Users cannot read, modify, or delete another user's documents.
- **Private Storage**: All uploaded files are stored in private bucket partitions (`documents/{user_id}/...`) and cannot be accessed via public URLs.
- **Anti-Prompt-Injection**: The AI system prompt strictly sandboxes document text as passive untrusted data, preventing documents from overriding system instructions.
- **Server-Side API Secrets**: The `GEMINI_API_KEY` is strictly confined to server-side route handlers and is never exposed in client bundles.

---

## 📄 License
MIT License. Built with ❤️ for students, applicants, and everyday document readers.
