# Fatwa Privacy Reverification Notes

## Confirmed Parallel Audit Input List

The archive-wide privacy audit input list is the generated `documents[]` array emitted by `scripts/build-fatwa-privacy-manifest.mjs`. Each item has the shape `{ slug, number, rawPdfUrl, sourcePdf, sourceSha256 }`, and the regenerated current manifest contains **204 unique published records**, from `a0001-1` through `a0503-204`.

## Rendered Public-Derivative Checks Saved After Two PDF Views

### `sanitized-fatwa-a0001-1.pdf`

The rendered public derivative shows the questioner-identifying table cells masked in the header area while retaining the substantive Fatwa text. The institutional footer contact information remains visible, including the approved official contact number.

### `sanitized-fatwa-a0367-155.pdf`

The rendered public derivative currently consists of **four public pages**, matching the documented manual exception. The visible pages preserve the substantive ruling content while omitting the excluded source pages and keeping the institutional footer contact information.

### `sanitized-fatwa-a0503-204.pdf`

The rendered recent-archive derivative shows its header identity fields masked while retaining the published Fatwa number, substantive question, answer, references, seals, and institutional footer. No customer telephone number was visible in the inspected first two pages.

## Future-Publication Control

The documented workflow remains fail closed: raw PDFs are never catalog-linked, an audit and complete redaction manifest are required before rendering, visual review is required before upload, and the public catalog generator accepts only the 204-entry sanitized URL manifest. The site has no open staff self-upload route, so future publication remains reviewer controlled.

## Current Reverification Results

| Verification | Result |
| --- | --- |
| Current catalog-to-audit input manifest | 204 unique records, from `a0001-1` through `a0503-204`. |
| Catalog URL boundary | Every public record and every sanitized-manifest entry uses a unique `/manus-storage/sanitized-fatwa-…pdf` path. |
| Local derivative text scan | `pdftotext` succeeded for all 204 local sanitized derivatives and found no non-official Pakistani mobile-number pattern. |
| Representative live public routes | A0001, A0367, and A0503 each resolved successfully; their public page counts matched the corresponding audited local derivative: 4, 4, and 3 pages respectively. |
| Representative live extracted text | The three downloaded public PDFs exposed no phone-number pattern through text extraction. |

No unremediated public catalog privacy gap was found in this reverification. As documented in the controlled-publication workflow, a raw direct URL that was shared historically can have an independent cache lifetime; it remains absent from the public catalog and must not be described as externally revoked without verified storage-platform invalidation.
