# Darul Ifta Irshad-us-Saileen Karachi (دار الإفتاء إرشاد السائلین کراچی)

Official web platform for **Darul Ifta Irshad-us-Saileen Karachi**, providing authentic Islamic jurisprudence (Fatawa), scholarly guidance in accordance with the Qur'an and Sunnah (Hanafi Fiqh), daily posts, mufti supervision directory, online bayan broadcasts, and a digital library.

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

## 📜 License & Ownership

© Darul Ifta Irshad-us-Saileen Karachi. All rights reserved.
