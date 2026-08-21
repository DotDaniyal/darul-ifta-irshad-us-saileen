import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("public Fatwa library visibility", () => {
  it("uses a dedicated non-composited record layout with explicit readable text colors", () => {
    expect(styles).toContain(".fatwa-library-record { display: flex; flex-direction: column; overflow: visible;");
    expect(styles).toContain(".fatwa-library-record, .fatwa-library-record * { opacity: 1; visibility: visible; }");
    expect(styles).toContain(".fatwa-library-urdu-title { margin: 0; color: #10223A;");
    expect(styles).not.toContain(".fatwa-library-record { @apply");
  });
});
