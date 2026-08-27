# Comprehensive Code Audit — 27 August 2026

## Scope and Preservation

This audit covered the React/Vite client, Express APIs, MySQL/Drizzle persistence boundaries, static and managed asset delivery, public and protected routes, configuration, dependencies, tests, diagnostics, accessibility fundamentals, and Vercel compatibility. The approved bilingual design, fixed calligraphic masthead artwork, Fatwa records and privacy safeguards, official contact links, Daily Posts workflow, and manual-only WhatsApp-origin import workflow were retained.

## Verified Findings and Remediation

| Area | Verified finding | Targeted correction |
|---|---|---|
| Vercel media persistence | When Vercel Blob is configured, server uploads return a public `*.public.blob.vercel-storage.com` URL. The previous Daily Posts parser accepted only `/manus-storage/` URLs, so it would discard the returned Blob URL when a post was saved. | The parser now accepts only managed `/manus-storage/` URLs or HTTPS public Vercel Blob URLs beneath `daily-posts/`. Untrusted absolute URLs remain rejected. |
| Vercel upload reliability | The former 5 MB image and 8 MB PDF raw-file limits could become base64 JSON requests larger than the 4.5 MB Vercel Function payload maximum. [1] [2] | The existing server-upload contract now permits at most **3,000,000 raw bytes** for images and PDFs and parses at most 4 MB of JSON. The deployment guide documents that larger files require a separately secured direct-client Blob upload flow. |
| Attribution integrity | The original-source validator allowed arbitrary `whatsapp.com` URLs, although the workflow is restricted to the institution’s official Channel. | Source links must now use the exact official Channel path or a post path beneath it. |
| External-build performance | The managed preview/visual-editing runtime was emitted into the generic production HTML used for external deployments, creating a 368 KB HTML file. | The managed runtime remains active for the local managed preview but is excluded when `VERCEL=1`. A Vercel-mode build produces a 1.40 KB HTML document and no managed runtime signature. |
| HTTP hardening | The audited API did not consistently emit basic defensive headers and could expose the Express identifier in API responses. | The API now removes `X-Powered-By` and emits `X-Content-Type-Options`, `Referrer-Policy`, and a restrictive `Permissions-Policy`. Vercel config adds those headers plus HSTS and same-origin frame protection for deployed responses. |
| Accessibility | The viewport declaration prevented browser zoom with `maximum-scale=1`. | The zoom restriction was removed; visitors can use browser and device magnification. |

## Security and Privacy Review

Public Daily Posts expose only `published` items whose publication timestamp has passed. All administration and upload routes require the server-side administrator key and rejected unauthenticated requests with `401` during runtime validation. Daily Post rich text remains rendered as React text nodes rather than raw HTML; link protocols remain limited to HTTPS or managed assets. The public Fatwa catalogue continues to use the existing sanitized-PDF-only boundaries and its regression suite remains green.

No tracked environment file, private key file, source-control credential assignment, production localhost endpoint, or production dependency vulnerability was identified in the source scan. The audit did **not** remove uncertain code, database records, credentials, user-facing behavior, or required dependencies. Direct production dependencies were found to be imported by application or build code; no dependency was demonstrably unused.

## Validation Performed

| Check | Result |
|---|---|
| Frozen dependency install | Passed: `pnpm install --frozen-lockfile` |
| Strict TypeScript | Passed: `tsc --noEmit --noUnusedLocals --noUnusedParameters` |
| Automated regressions | Passed: **28 test files / 78 tests** |
| Production Vercel-mode build | Passed: `VERCEL=1 NODE_ENV=production pnpm build` |
| Production dependency audit | Passed: no known production vulnerabilities |
| Diff integrity | Passed: `git diff --check` |
| Public API runtime | Passed: institutional date, scholars, Daily Posts, and Daily Post categories returned `200` |
| Protected API runtime | Passed: Daily Posts and scholars administration returned `401` without a credential |
| Routing | Passed: public archive, detail deep link, and SPA fallback returned `200` as designed |
| Responsive review | Passed: public routes and protected Daily Posts entry rendered at 1280 × 720 and 375 × 812 |
| Fresh diagnostics | No reproducible application, route, API, network, or browser error found after restart; the retained `baseline-browser-mapping` notice is a development-tooling update notice |

The repository-wide Prettier check reports code-style warnings for 111 pre-existing files. The committed versions of every changed source file except `vercel.json` already had the same warning, and a broad automated rewrite was intentionally avoided to keep the functional audit diff small and reviewable. There is no configured lint command in this project.

## Remaining External Deployment Prerequisites

This audit verifies the source and a Vercel-mode build; it does not claim a live Vercel deployment. To complete one, the user must connect a valid current GitHub repository containing this verified revision and configure Vercel with `DATABASE_URL`, `SCHOLAR_ADMIN_ACCESS_KEY`, and a public Vercel Blob store. Vercel should supply the Blob OIDC configuration when the store is connected; a server-only `BLOB_READ_WRITE_TOKEN` is required if a direct-client upload design is introduced. Existing `/manus-storage/*` public assets remain covered by the existing Vercel rewrite.

The Vercel Function request-body ceiling remains a platform limit. This codebase now fails large server uploads safely before the limit; supporting files above 3 MB requires a future authenticated direct-client upload route and Vercel Blob callback verification, not an increase to the existing endpoint limit. [1] [3]

## References

[1] [Vercel Functions Limits — Request and response payload size](https://vercel.com/docs/functions/limitations)

[2] [Vercel Blob Server Uploads — 4.5 MB function limit](https://vercel.com/docs/vercel-blob/server-upload)

[3] [Vercel Blob Client Uploads — authentication and token-exchange requirements](https://vercel.com/docs/vercel-blob/client-upload)
