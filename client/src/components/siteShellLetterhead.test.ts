import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("formal institutional letterhead", () => {
  it("keeps the bilingual institutional identity and clickable official seal in the SiteShell masthead", () => {
    expect(siteShell).toContain("function InstitutionalLetterhead()");
    expect(siteShell).toContain("Irshad-us-Saileen");
    expect(siteShell).toContain("دارالافتاء ارشاد السائلین");
    expect(siteShell).toContain('className="letterhead-seal"');
    expect(siteShell).toContain("<InstitutionalLetterhead />");
  });

  it("keeps the reference-inspired English-left, central-seal, Urdu-right layout responsive", () => {
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.45fr)");
    expect(styles).toContain("direction: ltr;");
    expect(styles).toContain(".letterhead-urdu");
    expect(styles).toContain("@media (max-width: 720px)");
  });
});
