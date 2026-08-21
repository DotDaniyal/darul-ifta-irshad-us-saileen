import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const siteShell = readFileSync(new URL("./SiteShell.tsx", import.meta.url), "utf8");

describe("public content reveal resilience", () => {
  it("keeps content visible unless a supported observer has explicitly armed a temporary reveal state", () => {
    expect(styles).toContain(".motion-section.is-reveal-pending { opacity: 0; transform: translateY(22px); }");
    expect(styles).not.toContain(".motion-section { opacity: 0; transform: translateY(22px); }");
    expect(siteShell).toContain('if (!("IntersectionObserver" in window)) return;');
    expect(siteShell).toContain('section.classList.add("motion-section", "is-reveal-pending")');
  });

  it("reveals above-the-fold content immediately and releases every pending section through a bounded failsafe", () => {
    expect(siteShell).toContain("if (top < window.innerHeight && bottom > 0) reveal(section);");
    expect(siteShell).toContain("window.setTimeout(() => sections.forEach(reveal), 1000)");
    expect(siteShell).toContain('section.classList.remove("is-reveal-pending")');
  });
});
