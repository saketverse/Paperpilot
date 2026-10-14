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

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx                     # Root layout with PaperPilot Navbar & Footer
│   ├── page.tsx                       # High-converting public Landing Page with interactive demo
│   ├── login/page.tsx                 # Supabase Email & Password Sign In
│   ├── signup/page.tsx                # Account creation with language preference
│   ├── auth/callback/route.ts         # Supabase auth code exchange callback
│   ├── dashboard/page.tsx             # User hub with metrics, recent docs, and task checklist
│   ├── upload/page.tsx                # Drag-and-drop file upload with animated pipeline steps
│   ├── documents/[id]/page.tsx        # Multi-tab Document Workspace & Grounded Chat
│   ├── documents/page.tsx             # Document Library with search, filtering, and sorting
│   ├── tasks/page.tsx                 # Full Task Management Kanban / list with inline edit
│   ├── settings/page.tsx              # User profile, language preference, and data wipe controls
│   ├── admin/page.tsx                 # Operational telemetry and error breakdown (admin-only)
│   └── api/
│       ├── upload/route.ts            # Multipart file handler, private storage, extraction & OCR
│       ├── documents/[id]/
│       │   ├── route.ts               # GET details and DELETE document
│       │   ├── analyze/route.ts       # Trigger or re-run Gemini AI intelligence analysis
│       │   └── chat/route.ts          # Grounded document conversational assistant
│       ├── tasks/
│       │   ├── route.ts               # List and create tasks
│       │   └── [id]/route.ts          # Update title, status, due date or delete task
│       └── user/data/route.ts         # Unilateral data wipe for privacy guarantees
├── components/
│   ├── brand-mark.tsx                 # SVG logo mark: document folded with guidance compass
│   ├── navbar.tsx                     # Responsive navigation with auth state & mobile drawer
│   ├── footer.tsx                     # Brand footer with privacy guarantees
│   ├── language-switch.tsx            # English / Hindi preference toggle
│   └── status-badge.tsx               # Status badges for documents and task priorities
├── lib/
│   ├── ai/
│   │   ├── gemini.ts                  # Google Generative AI integration with Zod schema validation
│   │   ├── chat.ts                    # Grounded conversational Q&A engine
│   │   └── schemas.ts                 # Strict Zod schemas for structured analysis output
│   ├── processing/
│   │   ├── pipeline.ts                # Orchestrator with file validation and quality checks
│   │   ├── pdf.ts                     # PDF text extractor with page boundary preservation
│   │   └── ocr.ts                     # Tesseract.js WASM OCR engine
│   ├── supabase/
│   │   ├── client.ts                  # Browser-side Supabase client
│   │   ├── server.ts                  # Server-side Supabase client using cookie store
│   │   └── middleware.ts              # Route protection and session token refresh
│   ├── types.ts                       # TypeScript interfaces
│   └── utils.ts                       # Date, byte, and class-merging helper functions
├── middleware.ts                      # Route protection middleware
├── supabase/
│   └── migrations/
│       └── 20261014_init_paperpilot.sql # SQL migration for all tables, RLS, and storage
├── .env.example                       # Environment variables template
├── .env.local                         # Local environment configuration
└── package.json                       # Project dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or newer (Tested on Node.js 25.x).
- npm or pnpm.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jgmriocozuxtnibexnuj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Google Gemini API Key (Server-side)
# Get a free API key at https://aistudio.google.com
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
```

### 4. Database Setup & Migrations
The database schema has already been applied to the Supabase instance (`jgmriocozuxtnibexnuj`). If setting up on a new instance, run the migration file:
```sql
-- Execute supabase/migrations/20261014_init_paperpilot.sql in the Supabase SQL Editor
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Data Privacy

- **Row Level Security (RLS)**: Enforced on `profiles`, `documents`, `tasks`, and `chat_messages`. Users cannot read, modify, or delete another user's documents.
- **Private Storage**: All uploaded files are stored in private bucket partitions (`documents/{user_id}/...`) and cannot be accessed via public URLs.
- **Anti-Prompt-Injection**: The AI system prompt strictly sandboxes document text as passive untrusted data, preventing documents from overriding system instructions.
- **Server-Side API Secrets**: The `GEMINI_API_KEY` is strictly confined to server-side route handlers and is never exposed in client bundles.

---

## 📄 License
MIT License. Built with ❤️ for students, applicants, and everyday document readers.
