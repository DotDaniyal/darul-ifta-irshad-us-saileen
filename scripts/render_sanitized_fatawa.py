#!/usr/bin/env python3
"""Render audited scanned Fatwa PDFs into sanitized public-only derivatives."""

import json
import shutil
import sys
from pathlib import Path

import fitz
from PIL import Image, ImageDraw

if len(sys.argv) != 3:
    raise SystemExit("Usage: render_sanitized_fatawa.py <redaction-manifest.json> <output-directory>")

manifest_path = Path(sys.argv[1])
output_dir = Path(sys.argv[2])
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

if manifest.get("sourceCount") != len(manifest.get("documents", [])):
    raise SystemExit("Redaction manifest count is inconsistent.")

if output_dir.exists():
    shutil.rmtree(output_dir)
output_dir.mkdir(parents=True)

scale = 160 / 72

for index, document in enumerate(manifest["documents"], start=1):
    source_pdf = Path(document["sourcePdf"])
    if not source_pdf.is_file():
        raise SystemExit(f"Missing source PDF: {source_pdf}")

    source = fitz.open(source_pdf)
    images = []
    pages_by_number = {page["page"]: page for page in document["pages"]}
    if len(pages_by_number) != len(source):
        raise SystemExit(f"Page-count mismatch for {document['slug']}")
    public_pages = set(document.get("publicPages", pages_by_number.keys()))

    for page_number, page in enumerate(source, start=1):
        if page_number not in public_pages:
            continue
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csRGB, alpha=False)
        image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        drawer = ImageDraw.Draw(image)
        for region in pages_by_number[page_number]["regions"]:
            left = max(0, int((region["leftPercent"] - 0.5) * image.width / 100))
            top = max(0, int((region["topPercent"] - 0.5) * image.height / 100))
            right = min(image.width, int((region["leftPercent"] + region["widthPercent"] + 0.5) * image.width / 100))
            bottom = min(image.height, int((region["topPercent"] + region["heightPercent"] + 0.5) * image.height / 100))
            drawer.rectangle((left, top, right, bottom), fill=(255, 255, 255))
        images.append(image)

    if not images:
        raise SystemExit(f"No public pages selected for {document['slug']}")
    target = output_dir / document["sanitizedFileName"]
    images[0].save(target, "PDF", save_all=True, append_images=images[1:], resolution=160, quality=90)
    source.close()
    for image in images:
        image.close()
    print(f"Rendered {index}/{manifest['sourceCount']}: {target.name}")

print(f"Completed sanitized public derivatives: {manifest['sourceCount']} PDFs.")
