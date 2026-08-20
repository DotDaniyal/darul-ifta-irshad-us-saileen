"""Replace published Fatwa PDF URLs using the redacted-upload manifest."""

from __future__ import annotations

import re
from pathlib import Path


PROJECT = Path("/home/ubuntu/darul-ifta-irshad-us-saileen")
DATA_FILE = PROJECT / "client/src/data/fatawa.ts"
MANIFEST = Path("/home/ubuntu/webdev-static-assets/fatawa/redacted_upload_manifest.txt")


def main() -> None:
    manifest = MANIFEST.read_text(encoding="utf-8")
    replacements = {
        int(number): url
        for number, url in re.findall(r"\[SUCCESS\] fatwa-(\d{3})\.pdf -> (/manus-storage/fatwa-\d{3}_[a-f0-9]+\.pdf)", manifest)
    }
    content = DATA_FILE.read_text(encoding="utf-8")
    updated = 0
    for number, url in replacements.items():
        pattern = re.compile(rf'("pdfUrl": ")/manus-storage/fatwa-{number:03d}_[a-f0-9]+\.pdf(")')
        content, count = pattern.subn(rf"\g<1>{url}\g<2>", content, count=1)
        if count != 1:
            raise RuntimeError(f"Expected one URL for fatwa-{number:03d}; found {count}.")
        updated += count
    DATA_FILE.write_text(content, encoding="utf-8")
    print(f"Updated {updated} Fatwa PDF URLs to redacted copies.")


if __name__ == "__main__":
    main()
