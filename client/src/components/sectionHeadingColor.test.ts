import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");

describe("shared section heading colour", () => {
  it("uses deep navy by default and a light accessible tone for the dark Fatwa chamber", () => {
    expect(siteShell).toContain('tone === "light" ? "text-[#FFF9E8]" : "text-[#0B2A4A]"');
    expect(siteShell).toContain('tone === "light" ? "text-[#F2E3BC]" : "text-[#075A9B]"');
    expect(home).toContain('<SectionHeading tone="light" eyebrow={urdu ? "فتاویٰ" : "FATWA LIBRARY"}');
  });
});
