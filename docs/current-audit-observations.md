# Current Audit Observations

**Review date:** 2026-08-22  
**Scope:** Current restored project state after checkpoint `c9a7c1d7`.

## Public-route visual review

The desktop review covered `/`, `/fatawa`, `/fatawa?q=A0367`, `/ask-fatwa`, `/methodology`, `/scholars`, and an intentional non-canonical detail path. The mobile review covered `/`, `/fatawa?q=A0367`, `/fatawa/a0367-155`, `/ask-fatwa`, `/methodology`, and `/scholars` at 375px width.

The canonical archive detail route `/fatawa/a0367-155` rendered normally at mobile width. The shorter `/fatawa/a0367` path displayed the designed not-found recovery state because the public catalog’s canonical slug is `a0367-155`; this is not a broken internal link, because archive cards generate URLs from the stored `slug` field.

No confirmed visual overlap, clipping, missing public content, or unusable mobile navigation was observed across the reviewed routes. The checked public pages retained their bilingual content, responsive masthead, search result layout, question form labels, and footer contact surfaces.

## Baseline technical results

`pnpm test` passed 15 test files and 35 tests. `pnpm check`, `pnpm build`, and `pnpm audit --prod` passed. The build retains only the existing non-blocking managed-background runtime-resolution notice and default JavaScript chunk-size advisory.

The current strict unused-symbol scan identified one confirmed cleanup item: an unused `useEffect` import in `client/src/pages/Home.tsx`. The formatting scan reports pre-existing formatting differences across many project files; formatting is not being mass-rewritten because that would create broad, unrelated churn in a preservation-focused audit.

## Confirmed repairs and cleanup

| Area | Confirmed finding | Completed repair | Protection |
| --- | --- | --- | --- |
| Homepage imports | Strict TypeScript unused-symbol validation reported an unused `useEffect` import. | Removed only the unused import from `client/src/pages/Home.tsx`. | `tsc --noUnusedLocals --noUnusedParameters` now passes. |
| Donation contact copy control | The copy action previously treated `navigator.clipboard.writeText()` as fire-and-forget and could create an unhandled rejection for denied access. It also had no accurate fallback for browsers without the clipboard API. | Made the action asynchronous, checks for clipboard availability, waits for a successful copy before showing success, and shows an error toast for unavailable or rejected access. | The focused public-flow test asserts the availability guard, awaited operation, and error feedback. |

No duplicate component, stylesheet, dependency, or public asset was removed because the audit did not establish a safe, behavior-preserving removal. No catalog record, managed public PDF URL, privacy manifest, archive route, question content, navigation item, institutional branding, or server/authentication infrastructure was modified.

## Final verification

| Check | Result |
| --- | --- |
| Focused public-flow regression | Passed: 1 file, 6 tests. |
| Full automated suite | Passed: 15 files, 36 tests. The expected institutional-date fallback and discrepancy test diagnostics remain intentional test coverage. |
| Standard type check | Passed: `pnpm check`. |
| Strict unused-symbol type check | Passed: `pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters`. |
| Production build | Passed. The existing managed background-image runtime-resolution notice and Vite default chunk-size advisory remain non-blocking. |
| Production dependency audit | Passed: no known vulnerabilities. |
| Diff integrity | Passed: `git diff --check` reported no whitespace errors. |
| Responsive visual review | Homepage, filtered archive, canonical `A0367` detail, question form, methodology, and scholars pages rendered at 375px, 768px, and desktop widths without observed clipping, overlap, or unusable navigation. |
| Current runtime diagnostics | The reviewed request stream returned successful public route and institutional-date responses. Historical dev-server entries, including a prior Vite integration-test error trace, were not treated as current production defects. |

## Remaining non-blocking observations

The production client bundle remains above Vite’s default 500 kB warning threshold. This is an optimization opportunity, not a verified functional defect; a code-splitting refactor was deliberately deferred to avoid adding route-loading risk during a preservation-focused repair. The restored project also retains broad pre-existing formatting differences, which were not mass-formatted because unrelated churn would obscure the targeted changes.
