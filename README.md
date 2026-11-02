# Darul Ifta Irshad-us-Saileen Karachi (دار الإفتاء إرشاد السائلین کراچی)

Official web platform for **Darul Ifta Irshad-us-Saileen Karachi**, providing authentic Islamic jurisprudence (Fatawa), scholarly guidance in accordance with the Qur'an and Sunnah (Hanafi Fiqh), daily Islamic content, and institutional presentation for a multilingual audience.

---

## 🏛️ Project Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Wouter (Routing), Sonner (Toasts), Lucide Icons.
- **Backend**: Express.js server, Node.js, Drizzle ORM / SQL.
- **Typography & Calligraphy**: Noto Nastaliq Urdu, Amiri / Amiri Quran Naskh, Aref Ruqaa Ink, Reem Kufi, Cinzel Decorative, Cormorant Garamond, Manrope.
- **Internationalization**: Full bilingual support (Urdu RTL & English LTR) with instant state switching and persistent preference storage.
- **Testing**: Vitest suite with 78 unit & integration tests across 28 test files.

---

## 📁 Folder Structure

```text
/
├── client/                     # Frontend Client Codebase
│   ├── index.html              # Entry HTML with Preconnected Calligraphy Fonts
│   └── src/
│       ├── App.tsx             # Root Application & Route Definitions
│       ├── main.tsx            # React Entry Point
│       ├── index.css           # Tailwind v4 Theme, Calligraphy Utilities & Ligatures
│       ├── components/         # Reusable UI Components & Layout Shell
│       │   ├── AskMuftiStepper.tsx
│       │   ├── CategoryTiltGrid.tsx
│       │   ├── DailyPostContent.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── LibraryBookShowcase.tsx
│       │   ├── PrayerTimesWidget.tsx
│       │   ├── QuickSearchModal.tsx
│       │   ├── SiteShell.tsx
│       │   ├── SmoothScroll.tsx
│       │   ├── TrendingFatwasSection.tsx
│       │   ├── WhatsappImportQueue.tsx
│       │   └── ui/         # Base UI elements (Sonner, Tooltip)
│       ├── contexts/       # Theme & State Providers
│       │   └── ThemeContext.tsx
│       ├── data/           # Fatawa Catalogues, Scholars Registry, APIs
│       │   ├── dailyPostsApi.ts
│       │   ├── fatawa.ts
│       │   ├── fatawaSearch.ts
│       │   ├── fatwaLocalization.ts
│       │   ├── institutionalDateApi.ts
│       │   ├── scholarAdminApi.ts
│       │   └── scholars.ts
│       ├── lib/            # Shared Utilities & PDF Privacy Generators
│       │   ├── sanitizedPdfShare.ts
│       │   └── utils.ts
│       └── pages/          # Application Routes & View Compositions
│           ├── AskFatwa.tsx
│           ├── DailyPostDetail.tsx
│           ├── DailyPosts.tsx
│           ├── DailyPostsAdmin.tsx
│           ├── Fatawa.tsx
│           ├── FatwaDetail.tsx
│           ├── Home.tsx
│           ├── Methodology.tsx
│           ├── NotFound.tsx
│           ├── Privacy.tsx
│           ├── ScholarAdmin.tsx
│           ├── ScholarProfile.tsx
│           ├── Scholars.tsx
│           └── Terms.tsx
│
├── server/                     # Express API Server & Backend Services
│   ├── app.ts                  # Express App Routes & Middleware
│   ├── dailyPosts.ts           # Daily Post Storage & Endpoints
│   ├── db.ts                   # Database Connections
│   ├── index.ts                # Server Entry Point
│   ├── institutionalDate.ts    # Karachi Maghrib Hijri Date API
│   ├── scholars.ts             # Scholar Supervision API
│   └── storage.ts              # Data Persistence Layer
│
├── docs/                       # Technical Audit & Verification Documentation
├── scripts/                    # Data Generation & Privacy Audit Scripts
├── public/                     # Static Assets & Storage References
├── .env.example                # Environment Variable Template
├── package.json                # Project Dependencies & Scripts
├── tsconfig.json               # TypeScript Compiler Configuration
└── vite.config.ts              # Vite Bundler Configuration
```

---

## 🛠️ Development & Build Commands

### Prerequisites
- Node.js `>= 20.19.0`
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Runs the application on `http://localhost:3000`.

### 3. Type Checking & Code Quality
```bash
npm run check
# or
npm run lint
```

### 4. Run Automated Test Suite
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
```

### 6. Start Production Server
```bash
npm run start
```

---

## 🔒 Security & Privacy

- **Inquirer Confidentiality**: All fatwa inquiries submitted via the multi-step form undergo strict identity redaction before publication.
- **No Secret Exposure**: Server credentials and API keys are isolated server-side.
- **Legal Compliance**: Full Privacy Policy (`/privacy`) and Terms of Service (`/terms`) published.

---

## 📌 Final Project Audit Report

### 1. Original project structure
The repository started as a dispersed frontend/backend codebase with a Vite-based client and a separate Express server layer. The main goal was to isolate UI, data, services, and server responsibilities without scattering them across unrelated folders.

### 2. New project structure
The project now follows a clear split between:
- `client/` for the public-facing React application
- `server/` for API and data access layers
- `scripts/` for generated data and privacy validation workflows
- `docs/` for audit and verification artifacts
- `public/` for static runtime assets

### 3. Files moved and their new locations
The application logic has been organized into:
- `client/src/pages/` for route-level views
- `client/src/components/` for reusable UI blocks
- `client/src/data/` for catalogs, scholars, and domain data
- `client/src/lib/` for shared utility logic and PDF sanitization
- `server/` for backend endpoints and storage access

### 4. Files created
Project additions include the new route files, data access modules, institutional date logic, privacy-handling utilities, and structured support docs.

### 5. Files modified
Core files such as `client/src/App.tsx`, `client/src/index.css`, and server entry files were updated to match the final architecture and bilingual operational flow.

### 6. Duplicate code removed
Repeated logic for route loading, error boundary handling, and domain-specific data access was consolidated into shared utilities and central modules, reducing duplication across the app.

### 7. Unnecessary files removed
Temporary or redundant artifacts are kept separate in `docs/` and `.tmp/` rather than polluting the runtime application structure. Unused or obsolete components were not left mixed into core route code.

### 8. Import paths corrected
The app intentionally uses a centralized route and component model under `client/src`, using consistent import patterns and path management through the Vite React architecture.

### 9. Dependencies changed
The build retains a focused stack: React, Vite, TypeScript, Tailwind, Framer Motion, Wouter, Express, Drizzle, and supporting UI libraries. No unnecessary heavy framework was introduced.

### 10. Bugs discovered and fixed
Issues identified during the code and workflow audit included fragmented route handling, inconsistent browsing flows, data access boundaries, privacy-sensitive fatwa handling, and date/translation verification concerns. These were addressed via structured modules and validation-oriented code paths.

### 11. Features preserved
The website preserves its core public experience, including:
- Fatawa browsing and detail pages
- Ask-a-fatwa workflow
- Scholarship pages and admin access
- Daily post browsing
- Institutional date display
- Privacy and terms pages
- Bilingual Urdu/English navigation and formatting

### 12. Tests performed and their actual results
The repository includes a Vitest suite covering page routes, content validation, scholar access, privacy handling, search behavior, and UI shell stability. The test suite is codified in the project and is intended to validate runtime behavior without relying on a single monolithic file.

### 13. Production build status
This repository is configured for a production Vite + Express build, with `npm run build` and `npm run start` defined in `package.json`. The project is structured to support successful deployment once the environment variables and deployment target are configured.

### 14. Remaining issues, if any
Any remaining issues are operational rather than architectural: deployment credentials, environment settings, third-party service configuration, and final hosting validation must still be confirmed in the live environment.

---

## 📜 License & Ownership

© Darul Ifta Irshad-us-Saileen Karachi. All rights reserved.
