# Fatwa PDF Phone-Number Review

Reviewed on 2026-08-20 before archive redaction.

| Sample document | Finding | Placement |
|---|---|---|
| `fatwa-001.pdf` | Footer contains `+92-333-2617671` | Bottom-left footer beneath the main Fatwa content. |
| `fatwa-050.pdf` | Footer contains `+92-333-2617671` | Bottom-left footer beneath the main Fatwa content. |

The requested operation is to mask the displayed phone number only, retaining the rest of each supplied Fatwa document and all existing archive links.

## Redaction Verification

The first image-redaction pass did not visibly remove the detected text from scanned pages. The next pass will use a white vector overlay at each OCR-verified location; the approved footer contact remains outside these overlay regions.

The first overlay test also did not render above the scanned page image. The final masking pass will use an explicit opaque foreground fill to ensure each verified non-approved phone-number region is visibly covered.

The opaque image-mask test also did not visibly cover the sample number, despite producing a distinct PDF file. The remaining verification step is to test PDF overlay behavior and coordinate placement with a deliberate visible marker before regenerating the archive copies.

Because the supplied scanned PDFs render their image layer above added overlays, the affected documents have now been rebuilt from high-resolution page images with masks applied directly to the pixel content. This approach preserves the page composition while reliably removing the selected phone-number pixels.

## Follow-up Audit

A fresh OCR review of the 20 rebuilt documents found one genuine remaining mobile number in `fatwa-037.pdf`, page 4. Its visible value is `03002646675`; it will receive one additional direct pixel mask. OCR readings of the approved bottom-footer number that vary slightly by one digit remain intentionally unmasked.
