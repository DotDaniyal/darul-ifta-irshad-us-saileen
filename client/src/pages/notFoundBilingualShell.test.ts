import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const notFound = readFileSync(
  new URL("./NotFound.tsx", import.meta.url),
  "utf8"
);

describe("not-found public route", () => {
  it("uses the shared shell and active language state instead of an English-only standalone page", () => {
    expect(notFound).toContain(
      'import SiteShell, { useLanguage } from "@/components/SiteShell";'
    );
    expect(notFound).toContain("const { language } = useLanguage()");
    expect(notFound).toContain("صفحہ موجود نہیں");
    expect(notFound).toContain("<SiteShell>");
  });
});
