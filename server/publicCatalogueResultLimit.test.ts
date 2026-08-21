import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const queries = readFileSync(resolve(import.meta.dirname, "platformQueries.ts"), "utf8");

describe("public catalogue result capacity", () => {
  it("returns enough published records to keep the expanded Fatwa archive visible", () => {
    expect(queries).toContain(".limit(250);");
    expect(queries).not.toContain("desc(fatwaRecords.id)).limit(100);");
  });
});
