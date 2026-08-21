import { describe, expect, it } from "vitest";
import { FATAWA } from "../client/src/data/fatawa";

const newBatchNumbers = [
  "A0201", "A0202", "A0203", "A0204", "A0208", "A0211", "A0212", "A0213",
  "A0221", "A0223", "A0225", "A0227", "A0230", "A0231", "A0233", "A0234",
  "A0235", "A0237", "A0252", "A0254", "A0268", "A0272", "A0281", "A0283",
  "A0285", "A0286", "A0288", "A0289", "A0290", "A0291", "A0296", "A0300",
];

describe("new A02 Fatwa archive batch", () => {
  it("contains all 32 user-supplied, redacted records in the expanded catalogue", () => {
    expect(FATAWA).toHaveLength(106);
    const records = FATAWA.filter((record) => newBatchNumbers.includes(record.number));
    expect(records).toHaveLength(32);
    expect(records.map((record) => record.number).sort()).toEqual([...newBatchNumbers].sort());
  });

  it("links every new record to a dedicated public redacted PDF", () => {
    const records = FATAWA.filter((record) => newBatchNumbers.includes(record.number));
    for (const record of records) {
      expect(record.pdfUrl).toMatch(/^\/manus-storage\/a0\d{3}_[a-f0-9]{8}\.pdf$/);
      expect(record.reference).toContain("non-approved phone numbers redacted");
    }
  });
});
