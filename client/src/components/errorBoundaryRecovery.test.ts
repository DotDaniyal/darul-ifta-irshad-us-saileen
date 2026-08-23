import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const boundary = readFileSync(new URL("./ErrorBoundary.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("public recovery state", () => {
  it("offers a bilingual retry path without exposing a technical stack trace", () => {
    expect(boundary).toContain("This page is temporarily unavailable");
    expect(boundary).toContain("یہ صفحہ فی الحال دستیاب نہیں ہے");
    expect(boundary).toContain("window.location.reload()");
    expect(boundary).not.toContain("error?.stack");
    expect(boundary).toContain('role="alert"');
  });

  it("uses the shared scholarly recovery styling", () => {
    expect(styles).toContain(".platform-error-screen");
    expect(styles).toContain(".platform-error-card");
    expect(styles).toContain(".platform-error-action");
  });
});
