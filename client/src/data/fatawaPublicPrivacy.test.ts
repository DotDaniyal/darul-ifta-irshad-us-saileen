import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const publicDerivativeVerifier = readFileSync(
  resolve(process.cwd(), "scripts/verify-public-fatwa-privacy.mjs"),
  "utf8",
);

describe("public Fatwa PDF privacy routing", () => {
  it("serves every archive record through a unique sanitized public derivative", () => {
    expect(FATAWA).toHaveLength(204);
    expect(new Set(FATAWA.map((fatwa) => fatwa.pdfUrl)).size).toBe(FATAWA.length);
    expect(
      FATAWA.every((fatwa) =>
        /^\/manus-storage\/sanitized-fatwa-a\d{4}-\d+_[a-z0-9]+\.pdf$/.test(fatwa.pdfUrl),
      ),
    ).toBe(true);
  });

  it("does not expose legacy raw Fatwa storage paths through the searchable catalog", () => {
    expect(FATAWA.some((fatwa) => !fatwa.pdfUrl.includes("/sanitized-fatwa-"))).toBe(false);
  });

  it("keeps a repeatable re-audit that checks every catalog-linked derivative and flags non-official phone patterns", () => {
    expect(publicDerivativeVerifier).toContain("publicCatalogEntries !== 204");
    expect(publicDerivativeVerifier).toContain("non_official_phone_in_extracted_text");
    expect(publicDerivativeVerifier).toContain('"03332617671", "923332617671"');
  });
});
