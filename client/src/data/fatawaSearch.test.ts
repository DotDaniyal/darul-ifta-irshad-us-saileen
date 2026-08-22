import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";
import { filterFatawa, readArchiveSearchQuery } from "./fatawaSearch";

describe("Fatwa archive search", () => {
  it("reads a trimmed direct archive query from the URL search string", () => {
    expect(readArchiveSearchQuery("?q=%20A0367%20")).toBe("A0367");
    expect(readArchiveSearchQuery("")).toBe("");
  });

  it("finds a known sanitized archive record by its reference without altering catalog data", () => {
    const matches = filterFatawa(FATAWA, "A0367", "All");
    expect(matches).toHaveLength(1);
    expect(matches[0]?.number).toBe("A0367");
    expect(matches[0]?.pdfUrl).toContain("/manus-storage/");
  });

  it("combines category and query constraints while retaining an empty-query category view", () => {
    const marriageRecord = FATAWA.find((item) => item.number === "A0367");
    expect(marriageRecord).toBeDefined();
    expect(filterFatawa(FATAWA, "", marriageRecord!.category)).toContainEqual(marriageRecord);
    expect(filterFatawa(FATAWA, "A0367", "Worship")).toHaveLength(0);
  });
});
