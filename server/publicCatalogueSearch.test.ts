import { describe, expect, it } from "vitest";
import { getPublicCatalogueTaxonomy, searchPublishedFatwas } from "./platformQueries";

const describeWithDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeWithDatabase("governed public catalogue search", () => {
  it("finds a published record by its Fatwa reference number", async () => {
    const records = await searchPublishedFatwas({ query: "A0001" });

    expect(records.some(record => record.referenceNumber === "A0001")).toBe(true);
  });

  it("finds a published record by title and by governed tag", async () => {
    const titleResults = await searchPublishedFatwas({ query: "Fatwa Archive · A0001" });
    const tagResults = await searchPublishedFatwas({ tag: "A0001" });

    expect(titleResults.some(record => record.referenceNumber === "A0001")).toBe(true);
    expect(tagResults.some(record => record.referenceNumber === "A0001")).toBe(true);
  });

  it("returns only matching records for an active category", async () => {
    const records = await searchPublishedFatwas({ category: "worship" });

    expect(records.length).toBeGreaterThan(0);
    expect(records.every(record => record.categorySlug === "worship")).toBe(true);
  });

  it("returns published records under the configured scholarly-review label", async () => {
    const taxonomy = await getPublicCatalogueTaxonomy();
    const records = await searchPublishedFatwas({ methodology: "authorised-scholarly-review" });

    expect(taxonomy.methodologies.some(methodology => methodology.slug === "authorised-scholarly-review")).toBe(true);
    expect(records.length).toBeGreaterThan(0);
    expect(records.every(record => record.methodologySlug === "authorised-scholarly-review")).toBe(true);
  });
});
