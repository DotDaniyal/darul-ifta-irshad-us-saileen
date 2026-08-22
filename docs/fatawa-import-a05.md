# A0499 and A0503 Fatwa PDF Import

## Supplied-document inventory

| Reference | Pages | SHA-256 | Urdu archive title | Category |
| --- | ---: | --- | --- | --- |
| A0499 | 4 | `bfd817e6a7d3ce887c7f19a6e1d8007797e5b7cca74c654936a0328b531c6f03` | زوجین کی مشترکہ رقم سے خریدے گئے مکان کی ملکیت کا شرعی حکم | Transactions |
| A0503 | 3 | `a93b5be97772aded2d02ebbf2eae65d630823efc8aa8273991626ab8df90e032` | شرط پر معلق تین طلاقوں کے وقوع کا حکم | Marriage & Divorce |

Both supplied PDFs were readable through `pdfinfo`. Neither reference was present in the prior 202-record archive, and the two supplied documents have distinct reference numbers and checksums.

## Managed storage and archive record policy

The original Urdu filenames remain in the local import record. The public archive uses ASCII-safe staged source filenames and the managed public document paths returned after upload:

| Reference | Managed public PDF path |
| --- | --- |
| A0499 | `/manus-storage/A0499_232324ea.pdf` |
| A0503 | `/manus-storage/A0503_c28212a6.pdf` |

Each record retains `date: "PDF Archive"`, uses conservative `Fatwa Archive · Axxxx` English labeling, and directs readers to the original PDF for the complete source text. No existing archive record, historical date field, or previous PDF URL was modified.

## Interim public checks

Both new managed document paths returned a final HTTP `200` response after following storage redirects through the local public server. The `/fatawa?q=A0503` query resolved to exactly one A0503 record on desktop and mobile, with its Urdu title and original-PDF action visible and readable.

## Catalog and release validation

The repeatable catalog generator now includes both records and produced a 204-record public archive. The A0499/A0503 regression test asserts the two references are present, retain distinct `/manus-storage/*.pdf` URLs, and preserve `PDF Archive` dates.

| Check | Result |
| --- | --- |
| Focused A0499/A0503 archive regression | Passed |
| Full Vitest suite | 12 test files, 27 tests passed |
| TypeScript check | Passed |
| Production build | Passed; existing JavaScript chunk-size advisory only |
| Production dependency audit | No known vulnerabilities |
| Direct managed PDF access | A0499 and A0503 both returned final HTTP 200 |
| Responsive archive discovery | A0503 filter verified on desktop and mobile |

The new records are additive. Existing Fatwa references, stored historical labels, direct-document actions, public routes, and the established bilingual archive design were preserved.
