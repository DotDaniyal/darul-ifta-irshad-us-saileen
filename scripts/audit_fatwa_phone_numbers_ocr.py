"""Locate phone numbers rendered as images in staged Fatwa PDFs using OCR.

Only Pakistani mobile-style values are reported.  The approved institutional
contact, +92 333 2617671, is excluded from the final findings.
"""

from __future__ import annotations

import csv
import io
import json
import re
import subprocess
import argparse
from pathlib import Path

import pymupdf


ARCHIVE_DIR = Path("/home/ubuntu/webdev-static-assets/fatawa")
OUTPUT_PATH = ARCHIVE_DIR / "phone_audit_ocr.json"
APPROVED_DIGITS = "923332617671"
SCALE = 300 / 72


def normalize(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    return "92" + digits[1:] if digits.startswith("0") else digits


def looks_like_pakistani_mobile(value: str) -> bool:
    digits = re.sub(r"\D", "", value)
    normalized = normalize(value)
    return (digits.startswith("03") and len(digits) == 11) or (normalized.startswith("923") and len(normalized) == 12)


def ocr_words(png: bytes) -> list[dict[str, str]]:
    process = subprocess.run(
        ["tesseract", "stdin", "stdout", "--psm", "6", "-l", "eng", "tsv"],
        input=png,
        capture_output=True,
        check=False,
    )
    reader = csv.DictReader(io.StringIO(process.stdout.decode("utf-8", "ignore")), delimiter="\t")
    return [row for row in reader if row.get("text", "").strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--directory", type=Path, default=ARCHIVE_DIR)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    arguments = parser.parse_args()
    archive_dir = arguments.directory
    findings: list[dict[str, object]] = []
    scanned_pages = 0
    pdf_paths = sorted(archive_dir.glob("fatwa-[0-9][0-9][0-9].pdf"))
    for pdf_path in pdf_paths:
        with pymupdf.open(pdf_path) as document:
            for page_index, page in enumerate(document, start=1):
                scanned_pages += 1
                pixmap = page.get_pixmap(matrix=pymupdf.Matrix(SCALE, SCALE), colorspace=pymupdf.csGRAY, alpha=False)
                for word in ocr_words(pixmap.tobytes("png")):
                    value = word["text"]
                    if not looks_like_pakistani_mobile(value):
                        continue
                    normalized = normalize(value)
                    if normalized == APPROVED_DIGITS:
                        continue
                    x = float(word["left"]) / SCALE
                    y = float(word["top"]) / SCALE
                    width = float(word["width"]) / SCALE
                    height = float(word["height"]) / SCALE
                    findings.append(
                        {
                            "pdf": pdf_path.name,
                            "page": page_index,
                            "value": value,
                            "normalized": normalized,
                            "rect": [round(x, 2), round(y, 2), round(x + width, 2), round(y + height, 2)],
                            "confidence": word.get("conf", ""),
                        }
                    )

    payload = {
        "pdfs_scanned": len(pdf_paths),
        "pages_scanned": scanned_pages,
        "approved_contact_retained": "+92 333 2617671",
        "non_approved_phone_findings": findings,
    }
    arguments.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
