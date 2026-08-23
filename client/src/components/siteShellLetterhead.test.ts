import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("accessible institutional letterhead with supplied Urdu calligraphy", () => {
  it("uses a separate official logo, approved English text, and a managed visual calligraphy asset with an accessible Urdu equivalent", () => {
    expect(siteShell).toContain("function InstitutionalLetterhead()");
    expect(siteShell).toContain('className="letterhead-grid"');
    expect(siteShell).toContain('className="letterhead-logo-link"');
    expect(siteShell).toContain('src={officialLogo}');
    expect(siteShell).toContain('Darul Ifta <span>Irshad-us-Saileen</span>');
    expect(siteShell).toContain('دارالافتاء ارشاد السائلین کراچی');
    expect(siteShell).toContain('className="letterhead-urdu-accessible-text"');
    expect(siteShell).toContain('/manus-storage/masthead-urdu-calligraphy-reference_da060155.png');
    expect(siteShell).toContain('className="letterhead-urdu-calligraphy-image"');
    expect(siteShell).toContain('alt=""');
    expect(siteShell).toContain('aria-hidden="true"');
    expect(siteShell).toContain('Al-Mujeeb Garden A-31, Model Colony, Karachi');
    expect(siteShell).toContain("<InstitutionalLetterhead />");
    expect(siteShell).not.toContain("officialLetterhead");
  });

  it("keeps the three-part header compact and ensures the supplied calligraphy image is responsive rather than distorted", () => {
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) 126px minmax(0, 1fr);");
    expect(styles).toContain(".letterhead-english-name");
    expect(styles).toContain(".letterhead-urdu-name");
    expect(styles).toContain(".letterhead-logo-frame");
    expect(styles).toContain(".letterhead-baseline");
    expect(styles).toContain(".institutional-letterhead");
    expect(styles).toMatch(/\.letterhead-urdu-calligraphy-image \{[^}]*width: min\(100%, 280px\);[^}]*height: auto;/);
    expect(styles).toMatch(/\.letterhead-urdu-accessible-text \{[^}]*clip: rect\(0, 0, 0, 0\);/);
    expect(styles).toContain("@media (max-width: 720px)");
  });

  it("retains the previously approved English heading font without changing the selectable text structure", () => {
    expect(styles).toMatch(/\.letterhead-english-name \{[^}]*font-family: "Cormorant Garamond", Georgia, serif;/);
  });

  it("uses the supplied calligraphy only for the visual Urdu heading and keeps the exact institutional wording in the document", () => {
    expect(siteShell).toMatch(/letterhead-urdu-name[\s\S]*letterhead-urdu-accessible-text[\s\S]*letterhead-urdu-calligraphy-image/);
    expect(siteShell).toContain('دارالافتاء ارشاد السائلین کراچی');
    expect(siteShell).not.toContain('style={{fontSize:');
    expect(siteShell).not.toContain('style={{fontFamily:');
  });

  it("retains an accessible home link on the independent logo asset", () => {
    expect(siteShell).toContain('aria-label="Darul Ifta Irshad-us-Saileen home"');
    expect(siteShell).toContain('alt="Darul Ifta Irshad-us-Saileen official logo"');
    expect(siteShell).toContain('lang="ur" dir="rtl"');
  });
});
