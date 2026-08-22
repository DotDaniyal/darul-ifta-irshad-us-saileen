# Fatwa Archive Search Investigation

## Reproduction Finding

Direct loading of `/fatawa?q=A0367` correctly rendered one matching, privacy-safe archive record and its managed PDF action. The archive’s matching predicate therefore remains intact.

## Confirmed Reliability Gap

The page derived `q` from `window.location.search` but memoized it against Wouter’s pathname location value. Search-only navigation on the already-mounted `/fatawa` route could therefore leave the input state out of sync with the URL because the pathname does not change. The archive view also offered no submit action to intentionally synchronize an in-page search term with a shareable `?q=` URL.

## Repair Direction

Use Wouter’s query-aware search hook as the source of truth for direct and same-route query changes, and make the archive input a submit-capable form that updates the query URL. Preserve the existing local filtering, category controls, catalog records, and managed PDF links.

## Completed Verification

The repaired archive rendered one A0367 result for `/fatawa?q=A0367`, including its existing privacy-safe managed PDF action. A direct no-match query rendered the existing clear no-results state with a zero result count. The archive field now retains the active URL query and exposes a dedicated submit control for synchronizing future in-page searches with a shareable archive URL.
