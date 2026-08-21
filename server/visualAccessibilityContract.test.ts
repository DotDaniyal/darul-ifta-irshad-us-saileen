import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const readClientFile = (path: string) => readFileSync(resolve(projectRoot, "client", "src", path), "utf8");

describe("professional visual accessibility contract", () => {
  it("keeps a high-contrast focus-visible treatment for public interactive controls", () => {
    const styles = readClientFile("index.css");
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("outline: 3px solid #075A9B");
    expect(styles).toContain(".royal-nav a[href]:focus-visible");
  });

  it("preserves semantic active navigation and a structured confidential-intake process", () => {
    const shell = readClientFile("components/SiteShell.tsx");
    const intake = readClientFile("pages/AskFatwa.tsx");
    expect(shell).toContain("aria-current={location === \"/\" ? \"page\" : undefined}");
    expect(intake).toContain('"THE PROCESS"');
    expect(intake).toContain("lg:sticky lg:top-[13rem]");
  });
});
