"""Audit searchable phone-like text in the staged Fatwa PDF archive.

The approved institutional contact number, +92 333 2617671, is excluded from
the findings.  Results include exact page coordinates so redaction can be
limited to non-approved phone-number entries only.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import fitz


ARCHIVE_DIR = Path("/home/ubuntu/webdev-static-assets/fatawa")
OUTPUT_PATH = ARCHIVE_DIR / "phone_audit.json"
APPROVED_DIGITS = "923332617671"
URDU_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

# Pakistani mobile and landline-friendly forms, including optional punctuation.
PHONE_PATTERN = re.compile(
    r"(?<![0-9۰-۹])(?:\+?92[-\s.]?)?(?:0?3[0-9۰-۹]{2}|0?2[0-9۰-۹]{1,2})[-\s.]?[0-9۰-۹]{3,4}[-\s.]?[0-9۰-۹]{3,4}(?![0-9۰-۹])"
)


def normalized_digits(value: str) -> str:
    return re.sub(r"\D", "", value.translate(URDU_DIGITS))


def is_approved(value: str) -> bool:
    digits = normalized_digits(value)
    if digits.startswith("0"):
        digits = "92" + digits[1:]
    return digits == APPROVED_DIGITS


def main() -> None:
    findings: list[dict[str, object]] = []
    scanned = 0
    for pdf_path in sorted(ARCHIVE_DIR.glob("fatwa-[0-9][0-9][0-9].pdf")):
        scanned += 1
        with fitz.open(pdf_path) as document:
            for page_index, page in enumerate(document, start=1):
                text = page.get_text("text")
                for match in PHONE_PATTERN.finditer(text):
                    value = match.group(0)
                    if is_approved(value):
                        continue
                    rects = page.search_for(value)
                    findings.append(
                        {
                            "pdf": pdf_path.name,
                            "page": page_index,
                            "value": value,
                            "normalized": normalized_digits(value),
                            "rects": [[round(x, 2) for x in rect] for rect in rects],
                        }
                    )

    payload = {
        "pdfs_scanned": scanned,
        "approved_contact_retained": "+92 333 2617671",
        "non_approved_phone_findings": findings,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
