import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("accessible text-based institutional letterhead", () => {
  it("uses a separate official logo with selectable English and Urdu institutional text", () => {
    expect(siteShell).toContain("function InstitutionalLetterhead()");
    expect(siteShell).toContain('className="letterhead-grid"');
    expect(siteShell).toContain('className="letterhead-logo-link"');
    expect(siteShell).toContain('src={officialLogo}');
    expect(siteShell).toContain('Darul Ifta <span>Irshad-us-Saileen</span>');
    expect(siteShell).toContain('دارالافتاء ارشاد السائلین کراچی');
    expect(siteShell).toContain('Al-Mujeeb Garden A-31, Model Colony, Karachi');
    expect(siteShell).toContain("<InstitutionalLetterhead />");
    expect(siteShell).not.toContain("officialLetterhead");
    expect(siteShell).not.toContain("letterhead-reference-image");
  });

  it("keeps the three-part header compact, responsive, and free from combined text imagery", () => {
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) 126px minmax(0, 1fr);");
    expect(styles).toContain(".letterhead-english-name");
    expect(styles).toContain(".letterhead-urdu-name");
    expect(styles).toContain(".letterhead-logo-frame");
    expect(styles).toContain(".letterhead-baseline");
    expect(styles).toContain(".institutional-letterhead");
    expect(styles).toContain("@media (max-width: 720px)");
    expect(styles).not.toContain(".letterhead-reference-image");
  });

  it("retains the previously approved English heading font without changing the selectable text structure", () => {
    expect(styles).toMatch(/\.letterhead-english-name \{[^}]*font-family: "Cormorant Garamond", Georgia, serif;/);
  });

  it("uses the requested Arabic Bold stack only for the selectable Urdu masthead heading", () => {
    expect(styles).toMatch(/\.letterhead-urdu-name \{[^}]*font-family: "Tarde Arabic Bold", "Noto Naskh Arabic", "Katibeh", serif;/);
    expect(styles).toMatch(/\.letterhead-urdu-name \{[^}]*font-weight: 700;/);
    expect(styles).toMatch(/\.letterhead-urdu-name \{[^}]*font-size: clamp\(1rem, 2\.27vw, 29px\);/);
    expect(siteShell).not.toContain('style={{fontSize:');
    expect(siteShell).not.toContain('style={{fontFamily:');
  });

  it("retains an accessible home link on the independent logo asset", () => {
    expect(siteShell).toContain('aria-label="Darul Ifta Irshad-us-Saileen home"');
    expect(siteShell).toContain('alt="Darul Ifta Irshad-us-Saileen official logo"');
    expect(siteShell).toContain('lang="ur" dir="rtl"');
  });
});
