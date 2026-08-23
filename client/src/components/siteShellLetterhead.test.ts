import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("accessible real-text Urdu institutional letterhead", () => {
  it("uses a separate official logo and the approved Urdu institutional wording as directly selectable HTML text", () => {
    expect(siteShell).toContain("function InstitutionalLetterhead()");
    expect(siteShell).toContain('className="letterhead-grid"');
    expect(siteShell).toContain('className="letterhead-logo-link"');
    expect(siteShell).toContain('src={officialLogo}');
    expect(siteShell).toContain('Darul Ifta <span>Irshad-us-Saileen</span>');
    expect(siteShell).toContain('<p className="letterhead-urdu-name">دارالافتاء ارشاد السائلین کراچی</p>');
    expect(siteShell).not.toContain('masthead-urdu-calligraphy-reference');
    expect(siteShell).not.toContain('letterhead-urdu-calligraphy-image');
    expect(siteShell).not.toContain('letterhead-urdu-accessible-text');
    expect(siteShell).toContain('Al-Mujeeb Garden A-31, Model Colony, Karachi');
    expect(siteShell).toContain("<InstitutionalLetterhead />");
    expect(siteShell).not.toContain("officialLetterhead");
  });

  it("keeps the three-part header compact and provides a responsive real-text Urdu heading with space for natural diacritics", () => {
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) 126px minmax(0, 1fr);");
    expect(styles).toContain(".letterhead-english-name");
    expect(styles).toContain(".letterhead-urdu-name");
    expect(styles).toContain(".letterhead-logo-frame");
    expect(styles).toContain(".letterhead-baseline");
    expect(styles).toContain(".institutional-letterhead");
    expect(styles).toMatch(/\.letterhead-urdu-name \{[^}]*font-family: "Noto Naskh Arabic", "Noto Nastaliq Urdu", serif;/);
    expect(styles).toMatch(/\.letterhead-urdu-name \{[^}]*padding-block: \.12em \.16em;[^}]*overflow: visible;[^}]*line-height: 1\.45;/);
    expect(styles).toContain("@media (max-width: 720px)");
  });

  it("retains the previously approved English heading font without changing the selectable text structure", () => {
    expect(styles).toMatch(/\.letterhead-english-name \{[^}]*font-family: "Cormorant Garamond", Georgia, serif;/);
  });

  it("keeps the exact Urdu wording as text and does not replace it with a visual asset", () => {
    expect(siteShell).toMatch(/letterhead-urdu-name">دارالافتاء ارشاد السائلین کراچی<\/p>/);
    expect(siteShell).not.toMatch(/letterhead-urdu-name[\s\S]*<img/);
    expect(siteShell).not.toContain('masthead-urdu-calligraphy-reference');
    expect(siteShell).not.toContain('style={{fontSize:');
    expect(siteShell).not.toContain('style={{fontFamily:');
  });

  it("retains an accessible home link on the independent logo asset", () => {
    expect(siteShell).toContain('aria-label="Darul Ifta Irshad-us-Saileen home"');
    expect(siteShell).toContain('alt="Darul Ifta Irshad-us-Saileen official logo"');
    expect(siteShell).toContain('lang="ur" dir="rtl"');
  });
});
