# Public Fatwa PDF Privacy Audit

## Audit purpose and preservation rule

This audit tracks the conversion of public Fatwa documents into privacy-protected derivatives. The public version must retain the substantive question, Fatwa answer, Islamic references, issued-record details, and verified Darul Ifta institutional contact information, while removing names and phone/mobile numbers that identify question submitters or other private individuals.

The supplied rule names `0332617671` as the approved official number. Existing site policy and the currently printed institutional footer use the equivalent established Darul Ifta contact formats `03332617671` and `+92 333 2617671`; these official forms will be retained as institutional contact information rather than treated as customer numbers.

## Visual sample findings

| Sample | Page inspected | Verified private-information exposure | Verified institutional content |
| --- | ---: | --- | --- |
| A0001 | 1 | A question-submitter name in the top form and a non-official phone number (`03343137875`) beside the submitted question | Institutional header, Darul Ifta address, and footer contact block |
| A0503 | 1 | A non-official phone number (`031949…`) immediately above the signatory area | Institutional header, Fatwa reference A0503, answer text, references, and footer contact block |
| A0001 | 2 | No question-submitter field or phone number found on the inspected continuation page | Inheritance-recipient names and figures form part of the substantive question and must remain intact |
| A0201 | 1 | A handwritten question-submitter name in the top form and a `+92342…` mobile number immediately before the separator | Institutional header, Fatwa reference A0201, substantive handwritten question, answer, and footer contact block |

The four visual samples demonstrate that the PDFs are image scans rather than reliably text-searchable files. The applied workflow must therefore redact the rendered page image and rebuild the public PDF; removing text-layer strings alone would not protect visitors from visible identifiers.

They also establish the redaction boundary: only the identity/contact fields belonging to the question submitter are removed. Names, figures, and other identifiers that are necessary to state the legal question or answer are preserved unless they are themselves a direct customer contact field.
