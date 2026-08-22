#!/usr/bin/env python3
"""Render a scanned PDF into readable three-page review strips for manual privacy checks."""

import shutil
import sys
from pathlib import Path

import fitz
from PIL import Image, ImageDraw

if len(sys.argv) != 3:
    raise SystemExit("Usage: render-fatwa-review-sheet.py <input.pdf> <output-dir>")

source_pdf = Path(sys.argv[1])
output_dir = Path(sys.argv[2])
if output_dir.exists():
    shutil.rmtree(output_dir)
output_dir.mkdir(parents=True)

document = fitz.open(source_pdf)
page_count = len(document)
thumbnail_width = 420
thumbnail_height = 594
padding = 20
for start in range(0, len(document), 3):
    sheet = Image.new("RGB", (thumbnail_width * 3 + padding * 4, thumbnail_height + padding * 2 + 28), "white")
    draw = ImageDraw.Draw(sheet)
    for offset, page in enumerate(document[start : start + 3]):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), colorspace=fitz.csRGB, alpha=False)
        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        image.thumbnail((thumbnail_width, thumbnail_height))
        x = padding + offset * (thumbnail_width + padding) + (thumbnail_width - image.width) // 2
        y = padding + 28 + (thumbnail_height - image.height) // 2
        sheet.paste(image, (x, y))
        draw.text((padding + offset * (thumbnail_width + padding), padding), f"Page {start + offset + 1}", fill="black")
        image.close()
    sheet.save(output_dir / f"strip-{start // 3 + 1:02d}.png")
document.close()
print(f"Rendered {page_count} pages into {((page_count - 1) // 3) + 1} review strips.")
