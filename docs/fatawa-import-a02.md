# Supplied A02-Series Fatwa Import

## Scope

This release imports **32 verified supplied Fatwa PDFs** into the existing governed public archive. The documents retain their original content and are represented by new typed catalog records; no existing archive record, stored Fatwa date, or public-library design was modified.

| Import property | Verified outcome |
|---|---|
| Supplied documents | 32 readable PDFs, from A0201 through A0300 with the supplied non-contiguous references retained |
| Public archive count | 74 existing records plus 32 imported records = **106** published records |
| Duplicate handling | All supplied references were missing from the existing static catalog, so no existing record was overwritten |
| Storage | Each verified PDF was uploaded to managed public storage using an ASCII-safe asset filename; Urdu titles remain in archive metadata |
| Direct document access | All 32 managed links return `200 OK` after the normal managed-storage redirect |
| Search verification | Direct `/fatawa?q=A0300` filtering shows exactly the imported A0300 record and its original-PDF action |

## Imported References

| A0201 | A0202 | A0203 | A0204 | A0208 | A0211 | A0212 | A0213 |
|---|---|---|---|---|---|---|---|
| A0221 | A0223 | A0225 | A0227 | A0230 | A0231 | A0233 | A0234 |
| A0235 | A0237 | A0252 | A0254 | A0268 | A0272 | A0281 | A0283 |
| A0285 | A0286 | A0288 | A0289 | A0290 | A0291 | A0296 | A0300 |

## Validation and Related Repair

The archive catalog was regenerated through the existing repeatable generator rather than manually editing individual records. A dedicated regression test verifies the imported A02-series count, reference set, and managed PDF URLs. During direct-link validation, the archive’s `?q=` query reader was corrected to use the browser search string, restoring direct search-link filtering such as the homepage handoff and `/fatawa?q=A0300`.

Desktop and mobile checks confirmed that the imported A0300 record appears in the established public archive layout and exposes its original document action. All existing archive records and their published dates remain unchanged.

## Final Release Validation

The final release check passed with **9 test files and 24 tests**, including the imported A02-series regression and the restored direct archive-query handoff. Strict TypeScript validation, the production build, and the production dependency audit also completed successfully. The production build retains its existing non-blocking JavaScript bundle-size advisory; it does not affect archive search or document access.
