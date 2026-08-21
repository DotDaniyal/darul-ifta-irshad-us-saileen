import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

describe("multilingual calligraphic typography contract", () => {
  it("loads the refined Latin and Arabic display families", () => {
    const document = read("client/index.html");
    expect(document).toContain("Cormorant+Garamond");
    expect(document).toContain("Marhey");
    expect(document).toContain("Noto+Nastaliq+Urdu");
    expect(document).toContain("Aref+Ruqaa+Ink");
  });

  it("preserves distinct readable roles for English, Urdu, and devotional Arabic", () => {
    const styles = read("client/src/index.css");
    const home = read("client/src/pages/Home.tsx");
    expect(styles).toContain('.font-display, .font-latin-display { font-family: "Cormorant Garamond"');
    expect(styles).toContain('.font-urdu, .font-urdu-display { font-family: "Noto Nastaliq Urdu"');
    expect(styles).toContain('.font-calligraphy { font-family: "Aref Ruqaa Ink"');
    expect(styles).toContain('html[dir="rtl"] body');
    expect(styles).toContain('[dir="rtl"] .section-title');
    expect(home).toContain('hero-english-identity font-latin-display');
  });
});
