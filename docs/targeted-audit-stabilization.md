# Targeted Technical Audit and Stabilization Record

**Scope.** This evidence-based audit reviewed the application structure, routes, public and administrative workflows, direct dependencies, source-risk patterns, validation tooling, runtime diagnostics, built production server, and responsive public views. It intentionally preserved the established premium bilingual design, institutional content, fixed calligraphic wordmark, Fatwa catalogue, sanitized document boundary, and scholar administration model.

| Area | Finding | Action |
| --- | --- | --- |
| Production startup | The server used a hardcoded `3000` fallback even though managed deployments provide `PORT`. | Startup now requires a valid environment-provided port, fails safely when missing, and was smoke-tested on an ephemeral port. |
| Scholar updates | A malformed partial request could be reduced to an empty update and treated as valid. | Scholar input parsing now rejects invalid optional fields and malformed localized-list payloads while retaining intentional field clearing. |
| Dependency hygiene | `path-to-regexp` was declared directly but had no source import and is already supplied transitively by Express. | Removed the direct dependency without removing Express routing support. |
| Code cleanup | The route registry contained inactive template-theme comments. | Removed stale comments only; route declarations retain their established syntax because public-route regression coverage protects it. |
| Initial JavaScript | Production build emitted a 956.62 kB main JavaScript chunk before this audit. | Lazy-loaded non-home route modules with an accessible bilingual loading boundary; the main chunk is now 620.33 kB and route chunks load on demand. |
| Sensitive rendering | No unsafe HTML rendering, dynamic evaluation, plaintext private-key pattern, or AWS key pattern was found in audited source. | No speculative security change was made. |

## Verification

The full suite passed with **23 test files and 55 tests**. Strict TypeScript completed with unused-local and unused-parameter checks enabled. The production bundle compiled successfully; dependency audit reported no known vulnerabilities; formatter checks passed on touched files; `git diff --check` passed; fresh browser and network diagnostics reported no active errors or failed requests. The built server served the public root with a supplied port and failed safely when `PORT` was deliberately removed.

Public responsive route checks were completed for the home page, archive search, A0367 detail page, Ask-a-Fatwa, Methodology, scholars, scholar profile, and not-found route at desktop and 320px widths. The full Fatwa privacy, localization, sanitized-PDF, native-share/copy fallback, institutional-date fallback, request handoff, and scholar authorization coverage remain exercised by the test suite.

## Retained Advisories

The build intentionally leaves managed `/manus-storage/` background resolution to runtime. Vite also retains a non-blocking warning for the 620.33 kB initial JavaScript chunk; this is reduced from the audited baseline, and further splitting the home page itself would add an unnecessary first-view loading boundary. Test stderr for controlled institutional-date source fallback and mismatch scenarios is intentional coverage, not a production failure.
