# Comprehensive Audit Route Observations

## Desktop Public-Route Pass

The homepage, Fatwa detail record, Ask Fatwa page, methodology page, and scholar directory rendered with their expected bilingual shell, preserved branding, visible contact actions, and contained layouts at the desktop viewport.

The archive page’s long 204-record full-page capture is visually compressed by the capture output, so the route will be rechecked at standard viewport height and mobile before concluding its layout assessment. The existing dynamic detail record remained readable and retained its privacy-sanitized document action.

The `/404` route is a confirmed consistency defect: it renders a standalone English-only error card without the shared `SiteShell` or the active Urdu/English language state. This is a narrow, safe candidate for correction during the audit because it affects a defined user-facing route without requiring a redesign.

## Mobile Public-Route Pass

At a 375px viewport, the homepage, Fatwa detail record, Ask Fatwa form, methodology page, scholar directory, and repaired 404 page remained readable without visible horizontal clipping. The menu collapsed as expected, the form fields retained practical stacked spacing, and the 404 page now uses the shared header/footer plus active Urdu copy. The archive’s full-page capture remains visually compressed because it contains 204 records; its standard-viewport render and direct-query behavior are covered by the dedicated archive-search regressions.

## Tablet Route and Access Pass

At a 768px viewport, the direct `/fatawa?q=A0367` route rendered its matching archive card, the supervised scholar profile loaded with its full bilingual record, and the scholar-administration screen required an administrator key before exposing management controls. These views stayed contained and retained the shared institutional shell. The public production API check separately confirmed that the date and published-scholar endpoints respond successfully while the unauthenticated administrator session endpoint rejects access with `401`.
