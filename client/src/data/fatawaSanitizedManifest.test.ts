import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const sanitizedUrlManifest = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "scripts/fatwa-public-sanitized-url-manifest.json"),
    "utf8",
  ),
) as Record<string, string>;

describe("Fatwa sanitized public URL manifest", () => {
  it("covers every generated public Fatwa exactly once", () => {
    const catalogBySlug = new Map(FATAWA.map((fatwa) => [fatwa.slug, fatwa.pdfUrl]));

    expect(Object.keys(sanitizedUrlManifest)).toHaveLength(FATAWA.length);
    expect(Object.keys(sanitizedUrlManifest).sort()).toEqual(
      [...catalogBySlug.keys()].sort(),
    );

    for (const [slug, publicUrl] of Object.entries(sanitizedUrlManifest)) {
      expect(publicUrl).toMatch(
        /^\/manus-storage\/sanitized-fatwa-a\d{4}-\d+_[a-z0-9]+\.pdf$/,
      );
      expect(catalogBySlug.get(slug)).toBe(publicUrl);
    }
  });
});
