import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const app = readFileSync(resolve(import.meta.dirname, "../client/src/App.tsx"), "utf8");

describe("public intake route loading contract", () => {
  it("loads the public Fatwa intake page directly instead of leaving it behind a lazy boundary", () => {
    expect(app).toContain('import AskFatwa from "./pages/AskFatwa";');
    expect(app).toContain('<Route path="/ask-fatwa" component={AskFatwa} />');
    expect(app).not.toContain('const AskFatwa = lazy(() => import("./pages/AskFatwa"));');
  });
});
