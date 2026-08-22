import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const suppliedNumbers = [
  "A0201", "A0202", "A0203", "A0204", "A0208", "A0211", "A0212", "A0213",
  "A0221", "A0223", "A0225", "A0227", "A0230", "A0231", "A0233", "A0234",
  "A0235", "A0237", "A0252", "A0254", "A0268", "A0272", "A0281", "A0283",
  "A0285", "A0286", "A0288", "A0289", "A0290", "A0291", "A0296", "A0300",
];

describe("supplied A02-series Fatwa batch", () => {
  it("keeps every verified supplied record searchable with one managed public PDF link", () => {
    const records = FATAWA.filter((fatwa) => suppliedNumbers.includes(fatwa.number));

    expect(records).toHaveLength(suppliedNumbers.length);
    expect(new Set(records.map((fatwa) => fatwa.number)).size).toBe(suppliedNumbers.length);
    expect(records.every((fatwa) => fatwa.pdfUrl.startsWith("/manus-storage/") && fatwa.pdfUrl.endsWith(".pdf"))).toBe(true);
    expect(records.every((fatwa) => fatwa.date === "PDF Archive")).toBe(true);
  });
});
