# A04-Series Fatwa PDF Import Record

## Scope and Preservation

This release adds **37** newly supplied A04-series PDF records to the public Fatwa archive, increasing the catalog from **165** to **202** records. It retains every existing archive entry, historical `PDF Archive` date label, route, category, and direct-document action. The repeatable catalog generator remains the source of truth for the generated public dataset. [1]

> The imported titles are conservative Urdu archive labels derived from the supplied filenames. The public English title remains the established `Fatwa Archive · Axxxx` label, and visitors are directed to the original PDF for complete question, answer, and research detail.

## Inventory and Duplicate Handling

All 37 incoming files opened successfully with `pdfinfo`. Their references were compared with the prior generated catalog, which contained 165 records and no A04-series entry. No duplicate incoming reference or SHA256 checksum was found, so no replacement, overwrite, or variant-record decision was required.

| Check | Result |
|---|---:|
| Supplied PDFs inventoried | 37 |
| Readable PDFs | 37 |
| Existing A04 records before import | 0 |
| Duplicate incoming references | 0 |
| Duplicate incoming SHA256 checksums | 0 |
| Archive records before / after | 165 / 202 |

## Archive Coverage

The published references are `A0405`, `A0411`, `A0430`, `A0439`–`A0445`, `A0447`–`A0449`, `A0451`, `A0454`, `A0457`, `A0460`–`A0464`, `A0466`–`A0474`, `A0481`–`A0485`, `A0487`, and `A0489`. Category assignment remains limited to the archive’s established controlled vocabulary.

| Archive category | Imported records |
|---|---:|
| Worship | 13 |
| Transactions | 9 |
| Marriage & Divorce | 7 |
| Inheritance & Wills | 6 |
| Belief & Conduct | 2 |
| **Total** | **37** |

## Managed Storage and Public Access

The originals were staged outside the application source tree under `/home/ubuntu/webdev-static-assets/fatawa-a04/` using ASCII-safe names such as `A0405.pdf`; their original Urdu filenames remain documented in the staging manifest. The uploader returned 37 distinct `/manus-storage/*.pdf` paths, which were added to the explicit A04 URL map in the generator. [1]

The public-link validation followed managed-storage redirects through the local public server. All 37 new links returned a final HTTP `200` response. The A04-specific Vitest regression asserts that the imported records remain distinct, searchable, managed-storage PDFs and retain the historical `PDF Archive` date. [2]

## Discovery, Presentation, and Release Validation

The direct archive search route `/fatawa?q=A0489` was checked at desktop and mobile breakpoints. It returned one A0489 result with its conservative Urdu label, the archive date, category information, and original-PDF action; no visual regression was observed in the established bilingual archive interface.

| Validation | Outcome |
|---|---|
| A04 direct managed-PDF links | 37 of 37 final HTTP `200` responses |
| Direct query filter | `/fatawa?q=A0489` returns one A0489 record |
| Responsive archive check | Verified at 1280×720 and 375×812 viewports |
| Vitest | 11 files, 26 tests passed |
| TypeScript | `pnpm exec tsc --noEmit` passed |
| Production build | `pnpm build` passed |
| Production dependency audit | `pnpm audit --prod` reported no known vulnerabilities |

The build retains the pre-existing non-blocking advisory about a JavaScript chunk larger than 500 kB; no speculative bundling refactor was made as part of this document-only archive import.

## References

[1]: ../scripts/generate-fatawa-catalog.mjs "Repeatable Fatwa catalog generator"
[2]: ../client/src/data/fatawaSuppliedA04Batch.test.ts "A04-series Fatwa archive regression test"
