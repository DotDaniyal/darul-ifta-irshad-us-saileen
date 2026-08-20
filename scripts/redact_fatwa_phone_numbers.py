"""Create redacted Fatwa PDF copies while retaining +92 333 2617671.

The OCR audit can misread the fixed institutional footer slightly.  Footer-like
findings close to the approved number are excluded; substantive mobile-number
findings elsewhere in the document are redacted with a small white mask.
"""

from __future__ import annotations

import json
import io
from pathlib import Path

import pymupdf
from PIL import Image


ARCHIVE_DIR = Path("/home/ubuntu/webdev-static-assets/fatawa")
AUDIT_PATH = ARCHIVE_DIR / "phone_audit_ocr.json"
OUTPUT_DIR = ARCHIVE_DIR / "redacted"
REPORT_PATH = ARCHIVE_DIR / "redaction_report.json"
APPROVED = "923332617671"


def digit_distance(first: str, second: str) -> int:
    return sum(left != right for left, right in zip(first, second)) + abs(len(first) - len(second))


def is_misread_approved_footer(finding: dict[str, object]) -> bool:
    rect = finding["rect"]
    assert isinstance(rect, list)
    y_top = float(rect[1])
    normalized = str(finding["normalized"])
    return y_top >= 700 and digit_distance(normalized, APPROVED) <= 4


def expanded_rect(rect_values: list[float]) -> pymupdf.Rect:
    rect = pymupdf.Rect(*[float(value) for value in rect_values])
    return pymupdf.Rect(rect.x0 - 2.2, rect.y0 - 2.2, rect.x1 + 2.2, rect.y1 + 2.2)


def white_mask_bytes() -> bytes:
    image = Image.new("RGB", (12, 12), "white")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def main() -> None:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    grouped: dict[str, list[dict[str, object]]] = {}
    skipped: list[dict[str, object]] = []
    for finding in audit["non_approved_phone_findings"]:
        if is_misread_approved_footer(finding):
            skipped.append(finding)
            continue
        grouped.setdefault(str(finding["pdf"]), []).append(finding)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    mask_bytes = white_mask_bytes()
    redacted_documents: list[dict[str, object]] = []
    for filename, findings in grouped.items():
        source = ARCHIVE_DIR / filename
        destination = OUTPUT_DIR / filename
        with pymupdf.open(source) as document:
            for finding in findings:
                page = document[int(finding["page"]) - 1]
                # The supplied pages are raster scans. Insert an opaque white
                # image above the precise OCR region to mask the phone number
                # without affecting the retained institutional footer number.
                page.insert_image(expanded_rect(finding["rect"]), stream=mask_bytes, overlay=True, keep_proportion=False)
            document.save(destination, garbage=4, deflate=True)
        redacted_documents.append(
            {
                "source": filename,
                "redacted": destination.name,
                "redacted_numbers": [str(finding["value"]) for finding in findings],
                "count": len(findings),
            }
        )

    report = {
        "approved_contact_retained": "+92 333 2617671",
        "documents_redacted": redacted_documents,
        "non_redacted_footer_ocr_misreads": skipped,
        "redacted_document_count": len(redacted_documents),
        "redacted_phone_count": sum(record["count"] for record in redacted_documents),
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
