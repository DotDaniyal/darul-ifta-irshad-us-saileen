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

## Official enquiry-email validation

The official contact address `ask.darulifa.irshadussaaileen@gmail.com` is delivered through a shared, accessible `mailto:` callout on every public route and is also placed in the homepage contact-card group, the Ask Fatwa guidance sidebar, and the Methodology trust-principles section. Both shared and contextual links expose language-aware accessible labels: **“Written enquiries by email” / “تحریری رہنمائی کے لیے ای میل”** and **“Written enquiries” / “تحریری رابطہ”**, respectively, followed by the full email address.

Desktop and 375 px mobile previews confirmed that the shared callout remains fully legible and does not cause horizontal overflow on the homepage, Ask Fatwa, and Methodology routes. The production build passed after the final context placement; source verification confirms each direct email action uses `mailto:ask.darulifa.irshadussaaileen@gmail.com`.

The automated official-email contract now checks both language variants directly: Urdu and English return the identical official `mailto:` destination while providing distinct complete shared and contextual accessible-label copy. A rendered component test additionally verifies the actual shared callout and contextual card markup in both languages, asserting their `href` and language-specific `aria-label` values. The same rendered test now includes the complete shared layout, confirming that the header, footer icon, and footer contact link also use the language-aware official-email labels and approved `mailto:` target. The project suite passes **14 test files / 43 tests**, including these bilingual contact checks.

### Official enquiry email — route-by-route evidence

| Public route | Direct email surfaces | Urdu and English verification | Responsive verification |
| --- | --- | --- | --- |
| Homepage | Shared contact bar and the dedicated `#contact` card group | Rendered route test confirms the approved `mailto:` target plus both Urdu and English shared/contextual accessible labels. | Desktop and mobile captures confirm the contact-card treatment remains legible without wrapping the address into an unusable line. |
| Ask Fatwa | Shared contact bar and the guidance-sidebar email card | Rendered route test confirms the same approved `mailto:` target plus both Urdu and English labels. | Desktop capture preserves the card in the guidance column; mobile capture confirms it stacks before the form without obscuring intake controls. |
| Methodology | Shared contact bar and the substantive trust-principles email card | Rendered route test confirms the same approved `mailto:` target plus both Urdu and English labels. | Desktop and mobile captures confirm the card stays inside the trust-content sequence and remains fully readable. |

The route-rendering coverage now exercises **Home**, **Ask Fatwa**, and **Methodology** in both language states with isolated public-query mocks. It asserts at least five approved direct mail links per route (shared header, footer icon, footer contact, shared callout, and contextual card), alongside language-specific accessible labels. The final suite passes **14 test files / 46 tests**.

## Professional visual refinement accessibility audit

On 21 August 2026, a live Chromium keyboard-only audit advanced focus through the homepage navigation, Fatwa archive search field, confidential-intake anonymity control, and Methodology guidance action. Each target matched `:focus-visible` and retained a visible **3 px solid outline** after the interface transition settled. The shared public shell uses a white outline with a gold halo on navy institutional surfaces; manuscript and form surfaces use the royal-blue outline with a gold halo.

An explicit WCAG AA contrast audit confirmed the focus-outline pairings: royal blue `#075A9B` against white is **7.13:1**, royal blue against intake parchment `#FFFCF3` is **6.95:1**, white against royal navigation `#06152E` is **18.19:1**, and white against the navy page header `#143A5E` is **11.69:1**. All four exceed the **4.5:1** AA minimum used for this validation.

## Contextual email-presentation update

Following the public visual edit on 21 August 2026, the redundant standalone email strip was removed from the Home, Ask Fatwa, and Methodology routes. The official address remains in the shared header and footer and is retained at each route’s substantive contextual contact point. The contextual card now follows the surrounding institutional contact treatment with a gold start rule, restrained blue surface, and a readable email action.

The subsequent contextual-card simplification now renders only the language-aware label **“Email” / “ای میل”** and `ask.darulifa.irshadussaaileen@gmail.com`; the former title and descriptive sentence are absent. Its `mailto:` target and accessible label use the same concise language-aware copy.

On 21 August 2026, full-page captures of Home, Ask Fatwa, and Methodology at 1280 px and 375 px confirmed that the email-only card is legible, correctly placed, and free of horizontal overflow. The Ask Fatwa card remains in the guidance sequence before the form on mobile, and the Methodology card remains after the trust disclaimer. The updated rendered-email tests and production build passed with **15 test files / 48 tests**.

For the subsequent visual-editor request, source review confirmed that the email-only card uses a blue-grey fill with a gold start rule, while the requested alignment is to the existing warm ivory, gold-ruled institutional contact-card treatment.

The homepage reference surfaces use an ivory `#FFFCF4` panel, a gold start rule, restrained navy text, and a light shadow. The shared contextual card will adopt this warm manuscript treatment while retaining the concise email-only content and accessible mail action.

The homepage places the shared email card alongside WhatsApp, telephone, and social channels through the common `contact-card` presentation. The email component should therefore use that shared class as its baseline on every route rather than carrying a distinct blue-grey utility treatment.

Verification on 21 August 2026 confirmed the shared `contact-card` baseline is active for the email-only action across Home, Ask Fatwa, and Methodology. Full-page captures at 1280 px and 375 px showed the same warm ivory, gold-ruled, manuscript-card hierarchy as the other contact channels, with no visible overflow. The automated suite passed **15 files / 48 tests**, including the rendered contract that asserts the shared `contact-card` class, and the production build completed successfully.

Full-page desktop (1280 px) and mobile (375 px) captures were reviewed for both `/ask-fatwa` and `/methodology`. On Ask Fatwa, the contextual card remains legible in the guidance sequence and stacks before the intake form on mobile without covering a control. On Methodology, the card remains legible after the trust disclaimer and before the footer at both breakpoints. The homepage Fatwa-library text is also visibly separated from the navy archive panel by its new parchment background panel and gold start rule. The updated rendered email contract, full automated suite (**15 test files / 48 tests**), and production build all passed.
