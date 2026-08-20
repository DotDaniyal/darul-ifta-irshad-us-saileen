# Final Platform Verification Notes

## Live public discovery validation

On the development preview at `https://3000-ij20lnue9hm28cz0q3v5x-450f78b6.us4.manus.computer/fatawa`, the governed Fatwa archive resolved successfully after route-level code splitting. Searching for `A0199` returned exactly one public Fatwa record, with its online-record route and approved PDF action present.

The language switcher changed the same filtered archive from Urdu/RTL presentation to English/LTR presentation while preserving the Fatwa-number search result. The visible controls included an explicitly labelled search input, subject filter buttons, methodology and topic selects, and an accessible language-switch button.

## Responsive public flow validation

Mobile full-page previews resolved successfully for the homepage, archive, confidential question form, private tracking form, and methodology page. The submission and tracking forms retained labelled inputs, and the methodology page retained readable bilingual trust cards and guidance disclaimer content.

## Privacy and runtime observations

Source review confirmed that public question tracking uses a hash-verified tracking secret and only returns non-sensitive status fields. The controlled publication workflow redacts obvious email addresses, telephone numbers, and URLs before public release. Recent application logs showed no application exception during validation; the only reported browser issue was an expected development-preview Vite HMR websocket connection warning.

On 20 August 2026, a user-approved, clearly labelled anonymous non-sensitive test request was submitted without an attachment. The submission receipt issued a reference and one-time private tracking secret; neither credential is retained in this verification record. The valid pair returned only the non-sensitive status ("Received") and last-updated date. Replacing the secret with an invalid test value produced the generic "The reference code or tracking secret is not recognised" error, without returning request content, contact data, status, or any other private field.

## Managed bilingual trust-content validation

The methodology route resolved with the managed fiqh methodology, confidentiality, guidance-scope, and publication-standard cards in English/LTR. Its labelled language switcher then rendered the same public trust content in Urdu/RTL, including the guidance disclaimer and private-question call to action.

## Performance observation

The production build completes successfully. Route-level lazy loading moved archive, intake, tracking, methodology, Fatwa detail, and protected workspace experiences into independent chunks. The initial JavaScript bundle reduced from approximately 1.04 MB (257 KB gzip) to approximately 780 KB (211 KB gzip); Vite retains a non-blocking warning that the shared initial bundle is still above its default 500 KB advisory threshold.

## Keyboard-accessibility validation

On 20 August 2026, keyboard focus was checked directly against the public forms and discovery controls. In the question form, focus advanced from the anonymous-request checkbox to the name and telephone inputs in the visible native-control sequence. In the archive, the labelled Fatwa search field advanced to the active subject-filter button, which exposes `aria-pressed`. In private tracking, focus advanced from the required reference field to the required tracking-secret field and then to the status-check button. The remaining shared-bundle size warning is an advisory performance item, not an accessibility or runtime failure.

The confidential submission and private tracking forms now render `role="alert"` with `aria-live="assertive"` when validation or server feedback is present; the successful tracking status renders through a polite status region. The live region is intentionally absent from the initial clean form state and appears only when feedback exists, avoiding unsolicited screen-reader announcements.

In the rendered public submission form, selecting a local unsupported text attachment without submitting the form produced the expected Urdu validation message. DOM inspection confirmed that message is exposed through `role="alert"` and `aria-live="assertive"`; no question content or file was submitted to the server during this check.

## Governed workflow and protected-workspace validation

The role-spanning lifecycle contract now exercises the protected scholarly draft, independent review, controlled publication, and administrator policy-governance procedures together. The complete automated suite passes with **12 test files and 39 tests**, including authorization, immutable revision/audit persistence, confidential intake/tracking, public catalogue discovery, administrator writes, and the governed lifecycle contract.

Opening `/workspace` in a public browser session displayed only the intentional sign-in boundary and no scholarly case, draft, reviewer, or governance content. The scholar, reviewer, and administrator interfaces were additionally audited in source: their controls use native buttons, labelled form fields, associated section headings, and semantic status/error feedback. Error feedback now uses `role="alert"` with an assertive live region; successful operational feedback uses a polite status region.

## Final asset-size rationale

The final production build succeeds. Its route-level chunks keep the archive, intake, tracking, methodology, detail, and protected workspace interfaces off the landing-page route. The shared entry JavaScript is **780.23 KB / 210.52 KB gzip** and global CSS is **179.50 KB / 28.77 KB gzip**; Vite’s 500 KB minified-chunk message remains an advisory for the shared dependency bundle. The generated entry document is **368.55 KB / 105.89 KB gzip** because the managed platform injects runtime and development/analytics support scripts. No runtime error or failed public request was observed during the final checks.
