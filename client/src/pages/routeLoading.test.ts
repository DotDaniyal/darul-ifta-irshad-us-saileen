import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("route loading performance boundary", () => {
  it("loads non-home routes lazily behind an accessible bilingual fallback", () => {
    const app = read("../App.tsx");

    expect(app).toContain('const Fatawa = lazy(() => import("./pages/Fatawa"));');
    expect(app).toContain('const AskFatwa = lazy(() => import("./pages/AskFatwa"));');
    expect(app).toContain('const Methodology = lazy(() => import("./pages/Methodology"));');
    expect(app).toContain('<Suspense fallback={<RouteLoadingFallback />}>');
    expect(app).toContain('role="status" aria-live="polite"');
    expect(app).toContain("صفحہ لوڈ ہو رہا ہے");
  });
});
