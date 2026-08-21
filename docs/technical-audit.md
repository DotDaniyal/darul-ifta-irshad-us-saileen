# Complete Technical Audit Record

**Project:** Darul Ifta Irshad-us-Saileen Karachi  
**Audit scope:** Public institutional pages, Fatwa discovery, question-intake handoff, the governed scholars API and administration surface, responsive presentation, code quality, runtime diagnostics, dependency health, and production build readiness.  
**Audit approach:** This review was deliberately conservative. Changes were made only where a defect, unsafe dependency resolution, or compiler-confirmed dead code was established. The established bilingual design, content, routes, branding, and public functionality were preserved.

## Executive conclusion

The audited public experience is operational across the reviewed desktop, tablet, and mobile breakpoints. The public scholars directory is backed by the live API rather than the obsolete in-memory registry; its forced database-failure path is now covered by a regression test that returns a controlled `503` JSON response. The production dependency chain is resolved without known production advisories after upgrading Express to **4.22.2** and explicitly resolving the compatible `path-to-regexp` patch release.

No confirmed functional, type-checking, build, or production dependency-audit failure remains. The production build retains a **non-blocking bundle-size advisory** for a JavaScript chunk larger than Vite’s default warning threshold; this was not treated as a functional defect or refactored speculatively during a preservation-focused audit.

## Findings and completed repairs

| Area | Confirmed finding | Completed action | Result |
| --- | --- | --- | --- |
| Scholar content source | The former static scholar registry remained after the database-backed scholars workflow had been introduced, creating a maintenance and data-divergence risk. | Removed static records and registry helpers from `client/src/data/scholars.ts`, retaining only shared type contracts. Updated regression coverage to assert live API usage. | Public directory, profiles, homepage preview, and administration continue to use governed live records. |
| Scholar API resilience | A historical development-console entry reported `res.status is not a function`. It did not reproduce on the live public API, but the failure branch required explicit regression coverage. | Added forced-error API tests for both the production Express application and the actual Vite development-preview middleware. Each asserts a controlled `503` JSON response. | The known error branch is protected in both environments; no new response-object trace was emitted during the final Vite-preview verification. |
| Preview-test isolation | The first Vite integration-test run shared Vite’s default optimizer cache with the managed development preview, after which the preview briefly rendered blank until its service was restarted. | Updated the integration test to use and remove a unique temporary Vite cache directory. | This was a transient test-cache side effect, not a website route defect. Regression testing no longer mutates the managed preview optimizer cache; the isolated test passed, audited desktop/tablet/mobile routes rendered normally afterward, and the homepage React root remounted after the complete validation suite. |
| Code cleanup | Strict unused-symbol compilation found four unused icon imports. | Removed `Check`, `HandHeart`, and `Printer` from `Home.tsx`, and `FilePlus2` from `ScholarAdmin.tsx`. | Strict TypeScript unused-local and unused-parameter validation passes. |
| Dependency security | `express@4.21.2` resolved vulnerable `body-parser`, `qs`, and `path-to-regexp` releases, producing five production advisories. A tested pnpm workspace override was not loaded by the pinned pnpm 10.4.1 configuration. | Removed the ineffective override experiment. Upgraded to `express@4.22.2` and added compatible direct `path-to-regexp@^0.1.13` resolution. | `pnpm audit --prod` reports **No known vulnerabilities found**; a frozen lockfile install succeeds. |
| Responsive presentation | Desktop, tablet, and mobile reviews covered the homepage, archive, scholars, question-intake, and methodology routes. | No layout mutation was warranted because no confirmed overlap, clipping, horizontal overflow, missing content, or unusable navigation was observed. | The existing royal bilingual presentation and responsive navigation are preserved. |

## Scope of review and behavior checks

The audit reviewed the route registry, shared public shell, header and footer navigation, language direction handling, Fatwa archive search handoff, contact actions, question-intake mail-draft handoff, methodology page, public scholars pages, and protected Scholar Admin flow. Visual checks confirmed the intended responsive menu at the mobile breakpoint and readable Urdu-first content across the audited public routes.

| Reviewed route or flow | Verified behavior |
| --- | --- |
| `/` | Public homepage, Fatwa archive-search handoff, scholar preview, contact actions, Online Bayan entry point, and footer render without a confirmed visual regression. |
| `/fatawa` | Archive page loads with its searchable public library identity intact. |
| `/scholars` and live scholar API | Public scholar directory displays through the live records endpoint; the API was also inspected directly. |
| `/fatawa/a0001-1` | A verified published Fatwa detail page renders with its reference, title, archive context, and original-document action at desktop, tablet, and mobile sizes. |
| `/scholars/mufti-abdul-mannan` | The live Mufti Abdul Mannan scholar profile renders with its bilingual supervision content and directory return path at desktop, tablet, and mobile sizes. |
| `/ask-fatwa` | Question-intake page loads directly and retains its accurate email-draft handoff rather than claiming an unpersisted submission was received. Native-event validation displayed the email-draft confirmation and scheduled its deferred mail-client handoff without opening an external client. |
| `/methodology` | Public trust, methodology, disclaimer, and institutional guidance content loads correctly; its official email and Ask Fatwa destinations were inspected directly. |
| `/scholars/admin` and `/admin/scholars` | Both protected entry points show the access-key screen without exposing administration data at desktop, tablet, and mobile sizes. Existing lifecycle tests verify access control and create, update, publish/unpublish, and delete operations. |
| `/404` | The intentional not-found state displays a readable recovery action back to the homepage at desktop, tablet, and mobile sizes. |

## Dependency-security rationale

pnpm’s current documentation places root-level overrides in `pnpm-workspace.yaml` and documents scoped selectors such as `parent@version>dependency`. [1] The pinned pnpm 10.4.1 runtime did not load that workspace override block into its effective configuration in this project, so retaining it would have created a false impression of protection. The experiment was removed.

The durable remediation upgrades the direct framework dependency to Express 4.22.2. Its published release and package metadata update the affected `qs` and `body-parser` chains, while the direct, semver-compatible `path-to-regexp@^0.1.13` declaration resolves the patched route matcher. Express’s security guidance documents the affected dependency classes and recommends current maintained releases. [2] [3] The final lockfile resolves the following production versions:

| Package | Resolved version | Audit status |
| --- | ---: | --- |
| Express | 4.22.2 | No known production advisory reported |
| body-parser | 1.20.6 | Patched release |
| qs | 6.15.3 | Patched release |
| path-to-regexp | 0.1.13 | Patched release |

The source rationale and the rejected override experiment are preserved separately in [`docs/pnpm-override-source.md`](./pnpm-override-source.md).

## Code cleanup and organization

The cleanup avoided broad rewrites. It removed only compiler-confirmed unused imports and the already-proven obsolete static scholar data after validating the database-backed replacement. A conservative scan found no remaining obsolete static scholar exports, and no application-level debugging statements were found outside the framework-provided diagnostic collector and the intentional server startup log. No working components, routes, assets, dependencies, or public content were removed merely for stylistic reasons.

No duplicate component, CSS, or API abstraction was consolidated during this audit because no safe, behavior-preserving duplication was confirmed. No dependency was removed without a reference-based reason; the only dependency-manifest change is the security-motivated Express maintenance upgrade and compatible direct route-matcher resolution.

## Performance, accessibility, and responsiveness

No speculative performance refactor was introduced. The current production build emits a single JavaScript chunk above Vite’s default 500 kB advisory threshold, but the application remains buildable and the audited routes render correctly. Splitting that bundle should be considered as a separately scoped optimization so that the previously repaired public-route loading behavior is not destabilized by an unnecessary lazy-loading rewrite.

The existing accessibility-preserving practices remain intact: page links and buttons retain visible controls, the public intake surface retains labels and explanatory states, the responsive navigation collapses to a reachable menu control, and bilingual Urdu/English presentation is preserved. No confirmed accessibility defect required a design or markup change during this audit.

## Verification record

| Validation | Result |
| --- | --- |
| `pnpm test` | **7 test files passed; 16 tests passed.** Includes public route/contact/search coverage, Scholar Admin lifecycle coverage, content-visibility coverage, and forced scholar API error handling for both the Express application and Vite preview middleware. |
| `pnpm exec tsc --noEmit` | Passed with no TypeScript errors. |
| `pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters` | Passed after removing the four confirmed unused imports. |
| `pnpm build` | Passed. Production client and server bundles were generated successfully. |
| `pnpm audit --prod` | **No known vulnerabilities found.** |
| `pnpm install --frozen-lockfile` | Passed; the deployment-style lockfile installation is reproducible. |
| Direct scholar API inspection | Public scholars endpoint returned successfully; the failure-path regression also verifies controlled `503` JSON behavior. |
| Visual verification | Homepage, Fatwa archive, scholars, question intake, and methodology routes reviewed at desktop, tablet, and mobile sizes with no confirmed layout break. |
| Current diagnostics review | No current application runtime failure was found. The earlier `res.status` console trace is historical; the actual Vite-preview failure-path regression returned controlled JSON `503`, and no new matching log entry was emitted afterward. |
| Final interaction evidence | Homepage archive-search handoff, the live scholar directory/profile, protected Scholar Admin entry screen, Ask Fatwa confirmation and email-draft scheduling, methodology actions, and official public contact destinations behaved as designed. Details are retained in [`docs/final-interaction-validation.md`](./final-interaction-validation.md). |

## Files changed during this audit

| File | Purpose of change |
| --- | --- |
| `client/src/data/scholars.ts` | Retained shared scholar type contracts while removing obsolete static registry data. |
| `client/src/pages/publicTrustAndIntake.test.ts` | Updated regression coverage for the live scholar data source. |
| `client/src/pages/scholarApiErrorHandling.test.ts` | Added forced error-path coverage for the scholar API’s controlled JSON response. |
| `client/src/pages/scholarVitePreviewErrorHandling.test.ts` | Added an integration regression that runs the active Vite scholar API middleware and verifies its controlled `503` response, with an isolated temporary optimizer cache. |
| `vite.config.ts` | Exported the active scholar API Vite plugin for direct integration-level regression coverage; runtime behavior is otherwise unchanged. |
| `client/src/pages/Home.tsx` | Removed three compiler-confirmed unused icon imports. |
| `client/src/pages/ScholarAdmin.tsx` | Removed one compiler-confirmed unused icon import. |
| `package.json` | Upgraded Express and added compatible direct `path-to-regexp` resolution for production dependency security. |
| `pnpm-lock.yaml` | Recorded the audited, reproducible patched dependency graph. |
| `pnpm-workspace.yaml` | Retained the root workspace declaration and Wouter patch configuration without a nonfunctional override block. |
| `docs/pnpm-override-source.md` | Recorded the package-manager configuration investigation and durable remediation rationale. |
| `docs/technical-audit.md` | Recorded this final audit, changes, validations, and remaining-risk disclosure. |
| `docs/final-interaction-validation.md` | Retained direct evidence for the final public interaction checks without submitting data or launching an external mail client. |
| `todo.md` | Marked completed audit work in the project checklist. |

## Remaining issues and follow-up

There are **no confirmed unresolved functional, security-audit, TypeScript, test-suite, build, or responsive-layout issues** within the audited scope. The blank preview seen during the first Vite integration test was resolved as an isolated optimizer-cache interaction and does not persist after the temporary-cache mitigation. The build’s JavaScript-chunk size message remains a non-blocking optimization opportunity rather than a verified defect. The developer-tool peer warning for `@builder.io/vite-plugin-jsx-loc` and Vite 7 is also non-production tooling metadata; it does not block the test suite, type check, build, or deployed application behavior. These items should be reconsidered only in a separately scoped dependency or performance upgrade, with full route regression testing afterward.

## References

[1]: <https://pnpm.io/10.x/settings#overrides> "pnpm 10 settings: overrides"
[2]: <https://github.com/expressjs/express/releases/tag/4.22.2> "Express 4.22.2 release"
[3]: <https://expressjs.com/en/advanced/security-updates/> "Express security updates"
