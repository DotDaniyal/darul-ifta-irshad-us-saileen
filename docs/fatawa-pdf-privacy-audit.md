# Public Fatwa PDF Privacy Audit

## Audit purpose and preservation rule

This audit tracks the conversion of public Fatwa documents into privacy-protected derivatives. The public version must retain the substantive question, Fatwa answer, Islamic references, issued-record details, and verified Darul Ifta institutional contact information, while removing names and phone/mobile numbers that identify question submitters or other private individuals.

The supplied rule names `0332617671` as the approved official number. Existing site policy and the currently printed institutional footer use the equivalent established Darul Ifta contact formats `03332617671` and `+92 333 2617671`; these official forms will be retained as institutional contact information rather than treated as customer numbers.

## Visual sample findings

| Sample | Page inspected | Verified private-information exposure | Verified institutional content |
| --- | ---: | --- | --- |
| A0001 | 1 | A question-submitter name in the top form and a non-official phone number beside the submitted question | Institutional header, Darul Ifta address, and footer contact block |
| A0503 | 1 | A non-official phone number immediately above the signatory area | Institutional header, Fatwa reference A0503, answer text, references, and footer contact block |
| A0001 | 2 | No question-submitter field or phone number found on the inspected continuation page | Inheritance-recipient names and figures form part of the substantive question and must remain intact |
| A0201 | 1 | A handwritten question-submitter name in the top form and a non-official mobile number immediately before the separator | Institutional header, Fatwa reference A0201, substantive handwritten question, answer, and footer contact block |

The four visual samples demonstrate that the PDFs are image scans rather than reliably text-searchable files. The applied workflow must therefore redact the rendered page image and rebuild the public PDF; removing text-layer strings alone would not protect visitors from visible identifiers.

They also establish the redaction boundary: only the identity/contact fields belonging to the question submitter are removed. Names, figures, and other identifiers that are necessary to state the legal question or answer are preserved unless they are themselves a direct customer contact field.

## Bounded manual exception review

Three otherwise complete page audits returned malformed structured responses and were manually reviewed at readable rendering scale rather than treated as clean pages. The public derivative for A0056 page 2 will redact the personal-name and customer-record fields in the attached supporting letter while retaining the substantive question and Fatwa text below it. The manual review confirmed that the Urdu question repeats only the case description and personal-record reference rather than a new contact field; the personal record reference will therefore be masked alongside the supporting-letter identity block. The public derivative for A0163 pages 7 and 16 will redact the court-caption identity blocks, including private party names and addresses, while retaining the legal narrative below each caption. These three manual regions are included in the redaction manifest and will receive the same post-render verification as every model-detected region.

The initially missing A0367 audit record is a twelve-page supporting court-document packet rather than a standard Darul Ifta form. Manual inspection of pages 1–6 confirms that private party identity, address, signature, and contact fields occur across the court captions and service forms, not just in a single submitter line. This document must therefore receive conservative page-specific court-form masks before it can enter the public derivative set; it must not be treated as having no redaction regions merely because the automated response failed.

Review of pages 7–12 confirms that pages 1–8 are privacy-dense supporting legal attachments, whereas pages 9–12 comprise the Darul Ifta record and Fatwa pages. The public derivative will exclude the non-Fatwa supporting attachment pages rather than attempting to publish partially masked court forms. It will preserve the Fatwa pages with only the question-submitter identity field masked where applicable, leaving the published question, answer, cited references, institutional seals, and the approved Darul Ifta contact information intact.

## Post-render visual validation

All 204 audit records have a fail-closed redaction-manifest entry, and all 204 generated catalog records resolve exclusively to a unique managed `sanitized-fatwa-…` asset. Raster-rebuilt public derivatives passed PDF readability checks. The visual review set covered a legacy sample, a recent sample, and the A0367 manual exception; its public derivative has four retained Fatwa pages, excludes the eight privacy-dense supporting-attachment pages, and now fully masks the submitter field on its first retained page. The adjacent substantive Fatwa text, citations, institutional seals, and approved institutional footer contact remain readable.

The A0367 correction was uploaded to a fresh managed storage path and the generated catalog was rebuilt from the 204-entry sanitized URL manifest. Local public-route checks confirmed readable PDF responses for representative legacy, manual-exception, and recent records; the delivered A0367 asset checksum matches the reviewed derivative. The application does not catalog-link previous raw paths. Historic raw URLs known outside the application may nevertheless remain subject to storage or edge-cache lifetime; this release does not claim their external revocation.

Desktop and mobile checks of the A0367 archive search and detail page confirm that the record remains searchable and that the public document action is still available within the existing bilingual archive experience. Those actions resolve through the generated sanitized catalog path rather than through a raw source path.

## Future controlled publication gate

Future Fatwa documents follow the controlled pre-publication procedure in [the privacy publication workflow](./fatwa-publication-privacy-workflow.md). A raw source document cannot be added directly to the generated catalog: the generator requires a complete sanitized URL manifest, and automated regression verifies that the manifest and all public catalog links agree exactly.
