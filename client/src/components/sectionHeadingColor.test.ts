import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("shared section heading colour", () => {
  it("uses the approved deep-navy token for the reusable section title", () => {
    expect(siteShell).toContain('className="section-title font-display text-4xl leading-[1.05] text-[#0B2A4A] sm:text-5xl"');
    expect(siteShell).not.toContain('className="section-title font-display text-4xl leading-[1.05] text-[#10223A] sm:text-5xl"');
  });
});
