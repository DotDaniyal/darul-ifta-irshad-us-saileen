"""Audit and permanently redact non-approved Pakistani mobile numbers in a new Fatwa PDF batch.

The approved institutional number 03332617671 / +92 333 2617671 is never masked.
The script combines vector-text and page-image OCR scans, then rasterizes only documents
with non-approved findings so masks are baked into the public PDF output.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw


APPROVED_DIGITS = "923332617671"
OCR_SCALE = 300 / 72
RENDER_SCALE = 2.5


def ascii_digits(value: str) -> str:
    return value.translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789"))


def normalize(value: str) -> str:
    digits = re.sub(r"\D", "", ascii_digits(value))
    return "92" + digits[1:] if digits.startswith("0") else digits


def is_pakistani_mobile(value: str) -> bool:
    digits = re.sub(r"\D", "", ascii_digits(value))
    normalized = normalize(value)
    return (digits.startswith("03") and len(digits) == 11) or (normalized.startswith("923") and len(normalized) == 12)


def digit_distance(first: str, second: str) -> int:
    return sum(left != right for left, right in zip(first, second)) + abs(len(first) - len(second))


def is_misread_approved_footer(finding: dict[str, object]) -> bool:
    rect = finding["rect"]
    return float(rect[1]) >= 700 and digit_distance(str(finding["normalized"]), APPROVED_DIGITS) <= 4


def union_rect(rects: list[list[float]]) -> list[float]:
    return [
        min(rect[0] for rect in rects),
        min(rect[1] for rect in rects),
        max(rect[2] for rect in rects),
        max(rect[3] for rect in rects),
    ]


def find_line_candidates(words: list[dict[str, object]]) -> list[dict[str, object]]:
    findings: list[dict[str, object]] = []
    for start in range(len(words)):
        for end in range(start + 1, min(len(words), start + 5) + 1):
            chunk = words[start:end]
            value = " ".join(str(word["text"]) for word in chunk)
            if not is_pakistani_mobile(value):
                continue
            rect = union_rect([word["rect"] for word in chunk])
            findings.append({"value": value, "normalized": normalize(value), "rect": [round(item, 2) for item in rect]})
    unique: list[dict[str, object]] = []
    for finding in findings:
        rect = finding["rect"]
        if any(existing["normalized"] == finding["normalized"] and existing["rect"] == rect for existing in unique):
            continue
        unique.append(finding)
    return unique


def vector_page_findings(page: pymupdf.Page) -> list[dict[str, object]]:
    groups: dict[tuple[int, int], list[dict[str, object]]] = defaultdict(list)
    for x0, y0, x1, y1, text, block, line, _word in page.get_text("words"):
        groups[(block, line)].append({"text": text, "rect": [x0, y0, x1, y1]})
    findings: list[dict[str, object]] = []
    for words in groups.values():
        findings.extend(find_line_candidates(words))
    return findings


def ocr_page_findings(page: pymupdf.Page) -> list[dict[str, object]]:
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(OCR_SCALE, OCR_SCALE), colorspace=pymupdf.csGRAY, alpha=False)
    process = subprocess.run(
        ["tesseract", "stdin", "stdout", "--psm", "6", "-l", "eng", "tsv"],
        input=pixmap.tobytes("png"),
        capture_output=True,
        check=False,
    )
    reader = csv.DictReader(io.StringIO(process.stdout.decode("utf-8", "ignore")), delimiter="\t")
    groups: dict[tuple[str, str, str, str], list[dict[str, object]]] = defaultdict(list)
    for row in reader:
        text = row.get("text", "").strip()
        if not text:
            continue
        try:
            left = float(row["left"]) / OCR_SCALE
            top = float(row["top"]) / OCR_SCALE
            width = float(row["width"]) / OCR_SCALE
            height = float(row["height"]) / OCR_SCALE
        except (KeyError, TypeError, ValueError):
            continue
        key = (row.get("page_num", ""), row.get("block_num", ""), row.get("par_num", ""), row.get("line_num", ""))
        groups[key].append({"text": text, "rect": [left, top, left + width, top + height]})
    findings: list[dict[str, object]] = []
    for words in groups.values():
        findings.extend(find_line_candidates(words))
    return findings


def scan_document(pdf_path: Path) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    non_approved: list[dict[str, object]] = []
    approved: list[dict[str, object]] = []
    with pymupdf.open(pdf_path) as document:
        for page_number, page in enumerate(document, start=1):
            candidates = vector_page_findings(page) + ocr_page_findings(page)
            seen: set[tuple[str, tuple[float, float, float, float]]] = set()
            for candidate in candidates:
                rect_key = tuple(candidate["rect"])
                key = (str(candidate["normalized"]), rect_key)
                if key in seen:
                    continue
                seen.add(key)
                finding = {"pdf": pdf_path.name, "page": page_number, **candidate}
                if candidate["normalized"] == APPROVED_DIGITS or is_misread_approved_footer(finding):
                    approved.append(finding)
                else:
                    non_approved.append(finding)
    return non_approved, approved


def expanded_rect(rect: list[float]) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = [item * RENDER_SCALE for item in rect]
    padding = 10
    return (int(x0 - padding), int(y0 - padding), int(x1 + padding), int(y1 + padding))


def rasterize_with_masks(source: Path, destination: Path, findings: list[dict[str, object]]) -> None:
    masks_by_page: dict[int, list[list[float]]] = defaultdict(list)
    for finding in findings:
        masks_by_page[int(finding["page"])].append(finding["rect"])
    with pymupdf.open(source) as document, pymupdf.open() as output:
        for page_number, page in enumerate(document, start=1):
            pixmap = page.get_pixmap(matrix=pymupdf.Matrix(RENDER_SCALE, RENDER_SCALE), colorspace=pymupdf.csRGB, alpha=False)
            image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
            if page_number in masks_by_page:
                draw = ImageDraw.Draw(image)
                for rect in masks_by_page[page_number]:
                    draw.rectangle(expanded_rect(rect), fill="white")
            buffer = io.BytesIO()
            image.save(buffer, format="PNG", optimize=True)
            new_page = output.new_page(width=page.rect.width, height=page.rect.height)
            new_page.insert_image(new_page.rect, stream=buffer.getvalue(), keep_proportion=False)
        output.save(destination, garbage=4, deflate=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    input_paths = sorted(args.input_dir.glob("A*.pdf"))
    args.output_dir.mkdir(parents=True, exist_ok=True)
    document_reports: list[dict[str, object]] = []
    total_approved = 0
    total_redacted = 0
    for source in input_paths:
        non_approved, approved = scan_document(source)
        destination = args.output_dir / source.name
        if non_approved:
            rasterize_with_masks(source, destination, non_approved)
        else:
            shutil.copy2(source, destination)
        remaining, retained = scan_document(destination)
        if remaining:
            raise RuntimeError(f"Non-approved phone values remain after redaction in {source.name}: {remaining}")
        total_approved += len(retained)
        total_redacted += len(non_approved)
        document_reports.append(
            {
                "source": source.name,
                "output": destination.name,
                "non_approved_found": non_approved,
                "approved_occurrences_after": retained,
                "redacted": bool(non_approved),
            }
        )

    payload = {
        "input_count": len(input_paths),
        "approved_numbers_preserved": ["03332617671", "+92 333 2617671"],
        "non_approved_occurrences_redacted": total_redacted,
        "approved_occurrences_detected_after": total_approved,
        "documents": document_reports,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
