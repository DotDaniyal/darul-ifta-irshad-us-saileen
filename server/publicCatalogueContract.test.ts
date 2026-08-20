import { describe, expect, it } from "vitest";
import { publicCatalogueSearchInput } from "./publicCatalogueContract";

describe("public catalogue search contract", () => {
  it("accepts a combined title, category, methodology, and tag filter", () => {
    const parsed = publicCatalogueSearchInput.parse({
      query: "Zakat",
      category: "transactions",
      methodology: "authorised-scholarly-review",
      tag: "زکوٰۃ",
    });

    expect(parsed).toEqual({
      query: "Zakat",
      category: "transactions",
      methodology: "authorised-scholarly-review",
      tag: "زکوٰۃ",
    });
  });

  it("rejects filters that exceed the public-input boundary", () => {
    expect(() => publicCatalogueSearchInput.parse({ query: "x".repeat(121) })).toThrow();
    expect(() => publicCatalogueSearchInput.parse({ methodology: "m".repeat(97) })).toThrow();
  });
});
