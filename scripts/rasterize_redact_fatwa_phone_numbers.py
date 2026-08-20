"""Rasterize and mask non-approved phone-number regions in affected Fatwa PDFs.

The supplied PDFs are scanned pages with layered content that does not reliably
accept vector overlays.  Rebuilding only affected documents from high-resolution
page images guarantees that the requested phone-number masks are visible.
"""

from __future__ import annotations

import io
import json
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw
import pymupdf


ARCHIVE_DIR = Path("/home/ubuntu/webdev-static-assets/fatawa")
REPORT_PATH = ARCHIVE_DIR / "redaction_report.json"
OUTPUT_DIR = ARCHIVE_DIR / "redacted"
RASTER_SCALE = 2.5


def expanded_pixels(rect: list[float]) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = [value * RASTER_SCALE for value in rect]
    padding = 8
    return (int(x0 - padding), int(y0 - padding), int(x1 + padding), int(y1 + padding))


def page_image(page: pymupdf.Page) -> Image.Image:
    pix = page.get_pixmap(matrix=pymupdf.Matrix(RASTER_SCALE, RASTER_SCALE), colorspace=pymupdf.csRGB, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def png_bytes(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def main() -> None:
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    by_document: dict[str, list[dict[str, object]]] = defaultdict(list)
    for document in report["documents_redacted"]:
        source = str(document["source"])
        for number in document["redacted_numbers"]:
            by_document[source].append({"value": number})

    audit = json.loads((ARCHIVE_DIR / "phone_audit_ocr.json").read_text(encoding="utf-8"))
    approved = report["approved_contact_retained"]
    retained_footer_values = {item["value"] for item in report["non_redacted_footer_ocr_misreads"]}
    page_masks: dict[str, dict[int, list[list[float]]]] = defaultdict(lambda: defaultdict(list))
    for finding in audit["non_approved_phone_findings"]:
        if finding["value"] in retained_footer_values:
            continue
        source = str(finding["pdf"])
        if source in by_document:
            page_masks[source][int(finding["page"])] .append(finding["rect"])

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    written: list[dict[str, object]] = []
    for source_name, mask_pages in sorted(page_masks.items()):
        source_path = ARCHIVE_DIR / source_name
        destination_path = OUTPUT_DIR / source_name
        with pymupdf.open(source_path) as source, pymupdf.open() as output:
            for page_number, source_page in enumerate(source, start=1):
                image = page_image(source_page)
                mask_rects = mask_pages.get(page_number, [])
                if mask_rects:
                    draw = ImageDraw.Draw(image)
                    for rect in mask_rects:
                        draw.rectangle(expanded_pixels(rect), fill="white")
                output_page = output.new_page(width=source_page.rect.width, height=source_page.rect.height)
                output_page.insert_image(output_page.rect, stream=png_bytes(image), keep_proportion=False)
            output.save(destination_path, garbage=4, deflate=True)
        written.append({"pdf": source_name, "masked_pages": sorted(mask_pages)})

    verification = {
        "approved_contact_retained": approved,
        "rasterized_documents": written,
        "document_count": len(written),
        "phone_mask_count": sum(len(rects) for pages in page_masks.values() for rects in pages.values()),
    }
    (ARCHIVE_DIR / "raster_redaction_report.json").write_text(json.dumps(verification, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(verification, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
