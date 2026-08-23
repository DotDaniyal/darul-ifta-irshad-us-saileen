import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("premium shared-shell experience", () => {
  it("keeps a non-blocking reading progress signal and an accessible return-to-top action", () => {
    expect(siteShell).toContain('className="site-reading-progress"');
    expect(siteShell).toContain("scrollProgress");
    expect(siteShell).toContain("setShowBackToTop(window.scrollY > 520)");
    expect(siteShell).toContain("window.scrollTo({ top: 0, behavior: \"smooth\" })");
    expect(siteShell).toContain('className="back-to-top"');
    expect(styles).toContain(".site-reading-progress");
    expect(styles).toContain(".back-to-top");
  });

  it("provides an operable mobile navigation panel without background scrolling", () => {
    expect(siteShell).toContain('aria-controls="mobile-primary-navigation"');
    expect(siteShell).toContain('id="mobile-primary-navigation"');
    expect(siteShell).toContain('document.body.style.overflow = "hidden"');
    expect(siteShell).toContain('if (event.key === "Escape") setOpen(false)');
    expect(styles).toContain(".mobile-nav-overlay");
    expect(styles).toContain(".mobile-nav-panel");
  });

  it("keeps motion optional for reduced-motion users", () => {
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(siteShell).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
  });
});
