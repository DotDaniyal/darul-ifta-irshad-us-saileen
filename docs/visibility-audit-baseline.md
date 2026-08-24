# Public Content Visibility Baseline

**Recorded:** 2026-08-21
**Scope:** Public desktop (1280×720) and mobile (375×812) full-page rendering checks for `/`, `/fatawa`, `/methodology`, and `/ask-fatwa`.

## Initial Findings

All inspected public routes rendered their intended primary content at both checked viewport sizes. The homepage displayed its hero, services, Fatwa guidance, scholar section, donation panel, contact methods, and footer. The Fatwa archive displayed its searchable record stack rather than blank cards. The methodology page displayed its trust content, principles, contact action, and footer. The question-intake page displayed its context panel, email handoff information, form controls, and footer.

The issue has not been reproduced as a persistent route-wide blank page in these initial captures. However, the codebase still contains a failure-prone reveal pattern in which `.motion-section` begins hidden and relies on JavaScript state to become visible. The next investigation stage will trace every visibility-affecting CSS rule and the corresponding observer lifecycle, then replace any fragile initial-hidden behavior with a safe visible fallback where warranted.

## Verification Targets

| Area | Baseline desktop | Baseline mobile | Follow-up |
| --- | --- | --- | --- |
| Homepage | Visible | Visible | Inspect scroll-reveal selector and fallback state |
| Fatwa archive | Visible | Visible | Audit record styles and search/filter states |
| Methodology | Visible | Visible | Audit section reveal and responsive stacking |
| Ask Fatwa | Visible | Visible | Audit form labels, fields, and handoff states |
| Fatwa detail (`/fatawa/a0001-1`) | Visible | Visible | Verified hero, question, guidance, action panel, topic tags, and footer |

## Detail Route Verification

The representative published record `/fatawa/a0001-1` rendered readable content at desktop and mobile widths. Its hero, question and guidance manuscript panels, topic tags, PDF action, utility controls, and footer were all visibly painted and positioned correctly. No route-specific blank, z-index, contrast, or clipping defect was observed.

## Confirmed Defect Mechanism and Repair Direction

The inspection confirmed that all page `<section>` elements are directly under `<main>`, matching the shared selector. Browser logs did not show an observer exception. The defect mechanism is nevertheless confirmed in the implementation: the global no-preference media query assigned every `.motion-section` `opacity: 0`, while the shared shell applied that class before it could establish that `IntersectionObserver` was available, functioning, or had delivered an intersection event. That made ordinary readable content contingent on an optional animation API.

The repair changes this to an explicitly armed temporary state (`.is-reveal-pending`) that is applied only after feature detection, removed immediately for above-the-fold content, and released for all remaining sections by a one-second failsafe. This preserves the existing entrance treatment where supported but makes visible content the default rather than the outcome of an asynchronous observer callback.

## Post-repair Rendering Verification

After applying the progressive-enhancement repair, full-page screenshots were captured at desktop (1280×720), tablet (768×1024), and mobile (375×812) widths for `/`, `/fatawa`, `/fatawa/a0001-1`, `/methodology`, and `/ask-fatwa`. Each route showed its legitimate headings, body copy, controls, cards, and footer content without blank, hidden, clipped, or obscured regions. The archive remained readable throughout its long record list, the Fatwa detail actions stayed visible, and the responsive layouts retained their existing structure.

The automated validation suite completed successfully: 4 test files and 6 tests passed, TypeScript completed without errors, and the production build succeeded. The build retains its existing non-blocking external-asset and bundle-size notices; neither is a content-visibility failure.

## Public Action Verification

The request page exposed a visible working Fatwa-library navigation link, the official WhatsApp route (`https://wa.me/923332617671`), and the official mailto route (`mailto:ask.darulifa.irshadussaaileen@gmail.com`). Selecting the live Fatwa navigation reached `/fatawa` and displayed the searchable 74-record archive with visible title and original-PDF links. The representative original-PDF action resolved to the public four-page A0001 document in the browser viewer. The Ask Fatwa form’s submit handler builds its recipient, subject, and message body through the official `mailto:` route; no automated email was sent during validation.

The WhatsApp route was explicitly opened without composing or sending a message. The telephone and official email links were also explicitly activated; their `tel:` and `mailto:` targets remained correctly assigned in the browser environment. The browser preview does not provide a local mail client, so the form was exercised with a non-sensitive sample request while only its external mail-client navigation was suppressed. The actual React form submission was observed, all native required-field validation passed, its visible confirmation state rendered, and the deferred handoff path was reached. This verifies the user-facing confirmation without sending any email.
