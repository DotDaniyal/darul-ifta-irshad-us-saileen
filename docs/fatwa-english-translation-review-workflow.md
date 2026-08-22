# English Fatwa Translation Review Workflow

## Purpose and Source Priority

Urdu remains the authoritative archive language for every Fatwa record. English material is stored separately and never replaces, modifies, or removes the Urdu metadata, privacy-sanitized PDF, question, answer, references, or record number.

| Translation status | Public behavior | Required evidence |
| --- | --- | --- |
| `source-original` | Urdu mode displays the original Urdu record. | Existing verified Urdu catalog and privacy-sanitized PDF. |
| `draft-pending-review` | English mode may display an explicitly labelled title draft but does not display a purported full translated question or answer. | Draft metadata plus qualified-review queue. |
| `approved` | English mode may display the full English title, question, answer, scholar, reference, category, date, and topics. | Named qualified reviewer, review date, source record, and approved translation fields. |

## Required Review Procedure

The reviewer must compare the proposed English text against the privacy-sanitized Urdu source. Qur'an verses, Hadith, dua, Arabic technical terms, legal terms such as *talaq*, *khula*, *zakat*, and terms with no safe English equivalent should remain in Arabic or established transliteration where that protects meaning. The reviewer must preserve paragraph order, references, qualification language, and any necessary uncertainty rather than supplying a new legal ruling.

No full English Fatwa is marked `approved` until the reviewer confirms that the translation preserves the Urdu record’s intended meaning and religious context. A reviewer’s approval must be recorded per Fatwa slug; a blanket approval is not sufficient.

## Publication and Privacy Controls

Translation review changes text metadata only. They do not alter the source PDF or bypass the archive-wide public-PDF privacy workflow. English pages retain the same privacy-sanitized managed PDF URL as Urdu pages, and unreviewed material must not introduce question-submitter names, private phone numbers, addresses, signatures, or case attachments.

## Current Foundation

The current release contains 204 English **title drafts** explicitly marked `draft-pending-review`. The complete English question-and-answer translations are intentionally withheld pending qualified review because no approved full English translation corpus was supplied with the archive.
