# Centralized Project History & Technical Log
**Institution**: Darul Ifta Irshad-us-Saileen Karachi (دار الإفتاء إرشاد السائلین کراچی)  
**Document Purpose**: Single centralized historical record of engineering, design, privacy audit, bug resolutions, and technical decisions.

---

## 1. Project Overview & Chronological Timeline

- **Institution**: Darul Ifta Irshad-us-Saileen Karachi, Pakistan.
- **Primary Domain**: Official Islamic Jurisprudence (Fatawa), scholarly guidance, daily posts, mufti supervision registry, online bayan broadcasts, and digital library.
- **Foundational Architecture**: React 19, Vite, Express.js backend, TypeScript, Tailwind CSS v4, Framer Motion, Wouter router, Drizzle ORM.

### Chronological Milestones

#### August 2026 — Initial Development & Core Features
- **Human & AI Collaborative Setup**: Provisioned Vite React SPA with Express backend integration. Established authentic UI using traditional Islamic motifs (Mihrab arches, parchment surfaces, royal blue `#075A9B`, deep navy `#061A34`, antique gold `#C89C46`, and warm ivory background `#FBF9F3`).
- **Calligraphy & Typography Engine**: Integrated Noto Nastaliq Urdu for Urdu titles and body text, Amiri & Amiri Quran for Arabic Hadith and Quranic text, Aref Ruqaa Ink for calligraphic accents, and Cinzel Decorative / Manrope for English text. Configured OpenType ligatures (`kern`, `liga`, `calt`) and line-height safeguards (`line-height: 2.2` - `2.3`) to prevent vertical letter clipping.
- **Karachi Maghrib Institutional Hijri Date**: Implemented dynamic Karachi prayer time integration with automatic Hijri day transition at Maghrib sunset, supported by offline server fallback and validation safeguards.

#### September 2026 — Fatawa Digitization & Inquirer Confidentiality Pipeline
- **PDF Archive Ingestion**: Digitized, catalogued, and published multiple batches of official Fatwa PDFs (Batches A00, A02, A03, A04, A05).
- **Redaction & Privacy Audit Pipeline**: Designed automated and manual audit scripts (`scripts/verify-public-fatwa-privacy.mjs`, `scripts/build-fatwa-public-redaction-manifest.mjs`) to scrub submitter phone numbers, personal addresses, and sensitive inquirer metadata. Only institutional numbers (`+92 333 2617671`) remain in public records.
- **PDF Privacy Generator**: Created `client/src/lib/sanitizedPdfShare.ts` to dynamically generate privacy-sanitized PDF versions for instant client sharing.

#### October 2026 — Quality Control & Accessibility Enhancements
- **Multi-Step Question Intake**: Built `AskMuftiStepper.tsx` allowing step-by-step fatwa submission with anonymous options, topic categorizations, and instant confirmation toasts.
- **Scholar Directory & Profile System**: Built `Scholars.tsx`, `ScholarProfile.tsx`, and `ScholarAdmin.tsx` detailing muftis, academic credentials, and supervision authority.
- **Daily Posts & Audio Bayan Integration**: Integrated daily Islamic guidance posts (`DailyPosts.tsx`) and live Mixlr online bayan broadcast links (`https://faisal-hayat.mixlr.com/events/5246475`).
- **Unit & Integration Test Suite**: Expanded Vitest test suite to 78 tests across 28 test files covering date transitions, search indexing, privacy redaction, accessibility, and route fallbacks.

#### November 2026 — Comprehensive Codebase Refactoring & Legal Compliance
- **Legal Compliance Pages**: Created `client/src/pages/Privacy.tsx` (Privacy Policy) and `client/src/pages/Terms.tsx` (Terms & Conditions of Service) with full bilingual (Urdu RTL & English LTR) support.
- **Repository Architecture Reorganization**: Consolidated documentation files into `/docs/`, removed temporary notes (`ideas.md`, `todo.md`), and updated `README.md`.
- **Final QA**: Verified 0 TypeScript errors (`tsc --noEmit`), 100% build success (`npm run build`), 78/78 passing Vitest tests, and HTTP 200 server responses.

---

## 2. Developer & AI Contribution Breakdown

### Work Performed with AI Assistance
- Initial layout prototyping and responsive CSS styling.
- Batch processing scripts for PDF privacy verification and URL manifest generation.
- Automated test generation for Vitest (covering date fallbacks, search indexing, and component error boundaries).
- Bilingual text translation structuring for fatwa titles and navigation labels.

### Work Performed by Human Developers / Institution
- Directing fatwa domain requirements, Hanafi fiqh methodology standards, and institutional wording.
- Supplying official logo artwork, calligraphic masthead images, and official contact credentials.
- Validating Karachi prayer time calculation sources against local Darul Ifta calendars.
- Reviewing sensitive fatwa redactions to guarantee inquirer confidentiality.

---

## 3. Features Implemented & Verification Matrix

| Feature | Status | Verification Method |
| :--- | :---: | :--- |
| **Bilingual Language Switcher (Urdu/English)** | ✅ Operational | State persistence in LocalStorage, dynamic `dir` and `lang` attribute switching. |
| **Searchable Fatwa Archive** | ✅ Operational | Client-side search index (`fatawaSearch.ts`) with category filtering and pagination. |
| **Karachi Maghrib Hijri Date Widget** | ✅ Operational | Tested via `institutionalDate.test.ts` (8 tests passing). |
| **Online Bayan Live Integration** | ✅ Operational | External link verification in header, footer, and homepage guidance hero. |
| **Multi-step Ask Fatwa Form** | ✅ Operational | Inquirer confidentiality, validation checks, and submission handling. |
| **Sanitized PDF Sharing** | ✅ Operational | Tested via `sanitizedPdfShare.test.ts` (3 tests passing). |
| **Scholar Supervision Registry** | ✅ Operational | Tested via `scholarAdminAccess.test.ts` & `scholarApiErrorHandling.test.ts`. |
| **Daily Posts & Admin Portal** | ✅ Operational | Tested via `dailyPostsPages.test.ts` & `server/dailyPosts.test.ts`. |
| **Privacy Policy Page (`/privacy`)** | ✅ Operational | Verified HTTP 200 route & bilingual render. |
| **Terms & Conditions Page (`/terms`)** | ✅ Operational | Verified HTTP 200 route & bilingual render. |

---

## 4. Key Bugs Discovered & Solutions

### 1. Nastaliq Vertical Letter Clipping
- **Symptom**: Urdu tall letters (Alif, Kaf) and deep swashes (Jim, Noon Ghunna) were clipped at the top and bottom in inline badge containers.
- **Root Cause**: Default line-height (`1.2`–`1.5`) in standard CSS frameworks is insufficient for calligraphic Nastaliq ascenders/descenders.
- **Solution**: Set `line-height: 2.2`–`2.3` on `.font-nastaliq` and `.font-urdu`, and added `.nastaliq-safe-pad` with `padding: 0.5rem 0` on clipped containers.

### 2. Missing Record Visibility in Fatwa Library Filter
- **Symptom**: Certain batch records (A02/A04) did not appear when switching categories.
- **Root Cause**: Category normalization string comparison mismatch (Urdu script diacritics vs un-diacriticized category keys).
- **Solution**: Implemented normalized unicode script matching in `fatawaSearch.ts` and added unit test coverage in `fatwaLibraryVisibility.test.ts`.

### 3. Prayer Time API Outage Fallback
- **Symptom**: External API failure caused Hijri date widget to freeze or crash.
- **Root Cause**: Unhandled promise rejection on remote HTTP outage.
- **Solution**: Built resilient server fallback in `server/institutionalDate.ts` using calculated local astronomical algorithms when source is unreachable.

---

## 5. Security, Performance & Inquirer Privacy Work

- **Inquirer Privacy & Redaction**: Strict policy prohibiting publication of submitter phone numbers, home addresses, or personal names. All published fatwa records scrubbed.
- **No Secret Exposure**: Server credentials kept in `.env.example` placeholder format. No client-side API secrets.
- **Performance**: Preconnected calligraphic fonts via Google Fonts with `font-display: swap`. Lazy-loaded routes in `App.tsx` for optimal bundle size.

---

## 6. Files Removed or Consolidated

- `ideas.md` — Consolidated into `PROJECT_HISTORY.md` and deleted to prevent documentation fragmentation.
- `todo.md` — Consolidated into `PROJECT_HISTORY.md` and deleted to maintain single source of truth.
- `cleanup_validation.md`, `external_sources.md`, `fatwa_library_visibility_investigation.md`, `supplied_a00_batch_verification.md`, `technical_audit_notes.md` — Moved from root into `/docs/` for clean repository architecture.

---

## 7. Current Project Status & Launch Readiness Checklist

- [x] Custom domain connected / ready.
- [x] Professional favicon installed (`/manus-storage/darul-ifta-favicon_4779f1a9.png`).
- [x] All "Made with AI" tags and synthetic marketing copy removed.
- [x] Privacy Policy page created and published (`/privacy`).
- [x] Terms & Conditions page created and published (`/terms`).
- [x] All navigation links, buttons, and forms tested.
- [x] Mobile responsiveness verified across device viewports.
- [x] SEO metadata verified in `index.html`.
- [x] Performance optimized with lazy loading and font swap.
- [x] Security checks completed.
- [x] No broken images or links.
- [x] 0 Browser console or terminal lint errors.
- [x] `PROJECT_HISTORY.md` created and updated.

**Conclusion**: The codebase is 100% clean, professional, fully audited, tested, and ready for production launch.
