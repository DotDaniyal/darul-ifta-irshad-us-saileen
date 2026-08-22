import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("official blue institutional letterhead", () => {
  it("uses the supplied official artwork as a clickable, accessible SiteShell masthead", () => {
    expect(siteShell).toContain("function InstitutionalLetterhead()");
    expect(siteShell).toContain('const officialLetterhead = "/manus-storage/official-blue-letterhead_9619ccc2.png"');
    expect(siteShell).toContain('className="letterhead-reference-link"');
    expect(siteShell).toContain('className="letterhead-reference-image"');
    expect(siteShell).toContain('alt="Darul Ifta Irshad-us-Saileen Karachi official letterhead"');
    expect(siteShell).toContain("<InstitutionalLetterhead />");
  });

  it("keeps the official image proportional, centred, and responsive without a recreated-text layout", () => {
    expect(styles).toContain("width: min(100%, 900px);");
    expect(styles).toContain(".letterhead-reference-image");
    expect(styles).toContain("width: 100%; height: auto;");
    expect(styles).toContain(".institutional-letterhead");
    expect(styles).toContain("@media (max-width: 720px)");
  });

  it("does not apply the earlier charcoal, reconstructed-seal, or decorative baseline treatment", () => {
    expect(styles).toContain(".royal-masthead::before, .royal-masthead::after { display: none; }");
    expect(styles).not.toContain(".letterhead-seal::before");
    expect(styles).not.toContain("grid-template-columns: minmax(0, 1fr) 152px minmax(0, 1fr)");
  });
});
