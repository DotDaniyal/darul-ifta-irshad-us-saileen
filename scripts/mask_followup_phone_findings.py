"""Apply a second high-resolution pixel mask pass to redacted Fatwa PDFs."""

from __future__ import annotations

import argparse
import io
import json
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw
import pymupdf


RASTER_SCALE = 2.5
APPROVED = "923332617671"


def digit_distance(first: str, second: str) -> int:
    return sum(left != right for left, right in zip(first, second)) + abs(len(first) - len(second))


def is_approved_footer_misread(finding: dict[str, object]) -> bool:
    _, y0, _, _ = [float(value) for value in finding["rect"]]
    return y0 >= 700 and digit_distance(str(finding["normalized"]), APPROVED) <= 4


def page_to_image(page: pymupdf.Page) -> Image.Image:
    pix = page.get_pixmap(matrix=pymupdf.Matrix(RASTER_SCALE, RASTER_SCALE), colorspace=pymupdf.csRGB, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def png_bytes(image: Image.Image) -> bytes:
    output = io.BytesIO()
    image.save(output, format="PNG", optimize=True)
    return output.getvalue()


def mask_box(rect: list[float]) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = [float(value) * RASTER_SCALE for value in rect]
    padding = 8
    return int(x0 - padding), int(y0 - padding), int(x1 + padding), int(y1 + padding)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--audit", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    arguments = parser.parse_args()

    findings = json.loads(arguments.audit.read_text(encoding="utf-8"))["non_approved_phone_findings"]
    masks: dict[str, dict[int, list[list[float]]]] = defaultdict(lambda: defaultdict(list))
    for finding in findings:
        if not is_approved_footer_misread(finding):
            masks[str(finding["pdf"])][int(finding["page"])].append(finding["rect"])

    arguments.output_dir.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, object]] = []
    for filename, pages in masks.items():
        source_path = arguments.input_dir / filename
        destination_path = arguments.output_dir / filename
        with pymupdf.open(source_path) as source, pymupdf.open() as output:
            for page_number, source_page in enumerate(source, start=1):
                image = page_to_image(source_page)
                if page_number in pages:
                    draw = ImageDraw.Draw(image)
                    for rect in pages[page_number]:
                        draw.rectangle(mask_box(rect), fill="white")
                output_page = output.new_page(width=source_page.rect.width, height=source_page.rect.height)
                output_page.insert_image(output_page.rect, stream=png_bytes(image), keep_proportion=False)
            output.save(destination_path, garbage=4, deflate=True)
        results.append({"pdf": filename, "masked_pages": sorted(pages)})

    print(json.dumps({"updated_documents": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
