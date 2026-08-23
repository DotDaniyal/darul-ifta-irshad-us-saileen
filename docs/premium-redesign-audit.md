# Premium Platform Redesign Audit

## Preserved functional boundaries

The redesign must retain the 204-record privacy-sanitized Fatwa catalogue, direct managed PDF URLs, the native-share and copy fallback for sanitized PDFs, bilingual Fatwa localization review safeguards, archive URL-query search, the email-draft-based Ask-a-Fatwa handoff, the protected scholar administration flow, the institutional Hijri-date fallback behavior, and the fixed managed calligraphic masthead wordmark.

The audited A0367 archive record is routed through `/fatawa/a0367-155`; `/fatawa/a0367` is not a valid record slug. The valid route confirmed the privacy-safe PDF action panel and translation-review presentation remain available for the redesign.

## Current visual baseline

The desktop homepage has a strong Urdu-led ceremonial hero, an official three-part masthead, quiet ivory manuscript surfaces, arched service cards, and a restrained navy-and-gold palette. The middle and lower page become less cohesive: the Fatwa search chamber has competing dark panels, several downstream sections fall back to generic rectangular modules, and the masthead presents several identity elements with similar visual weight.

At 375px, the core hierarchy remains usable and there is no observed horizontal overflow, but the long stacked journey loses much of the desktop's ceremonial rhythm. Mobile navigation, compact typography, card density, and section transitions should become more deliberate while retaining immediate content access.

The pre-redesign automated baseline passed 19 Vitest files and 47 tests, and the production dependency audit found no known vulnerabilities. Browser diagnostics show an expected development-proxy WebSocket reconnect issue after the managed rollback; no current HTTP request failures were observed. The development server also reports an institutional-date source fallback when its upstream fetch is unavailable, which the existing fallback logic is designed to handle.

## Design decisions

The redesign will unify the site around an editorial manuscript system: warm ivory reading fields alternating with deep-navy scholarly chambers, with blue rules, muted-gold seals, mihrab outlines, and rosette dividers marking transitions. Urdu remains ceremonial and primary; English acts as concise supporting metadata. Motion will stay lightweight, staggered, and optional under `prefers-reduced-motion`.

## Post-redesign validation notes

The refreshed home, archive, detailed Fatwa, Methodology, Ask-a-Fatwa, and scholar-directory routes were checked at 320px, 375px, 1024px, and 1440px. The mobile stack retained readable Urdu lines, usable Fatwa controls, non-clipped actions, and the formal masthead. At tablet and desktop widths, the Methodology page resolves into its editorial reading arrangement while the archive and detail pages retain their document controls and hierarchy. No horizontal overflow was observed in the reviewed routes.
