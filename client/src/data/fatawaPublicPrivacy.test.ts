import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

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
});
