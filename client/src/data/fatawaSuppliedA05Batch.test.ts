import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const suppliedNumbers = ["A0499", "A0503"];

describe("supplied A0499 and A0503 Fatwa batch", () => {
  it("keeps both verified supplied documents searchable with distinct managed public PDFs", () => {
    const records = FATAWA.filter((fatwa) => suppliedNumbers.includes(fatwa.number));

    expect(records).toHaveLength(2);
    expect(new Set(records.map((fatwa) => fatwa.pdfUrl)).size).toBe(2);
    expect(records.every((fatwa) => fatwa.pdfUrl.startsWith("/manus-storage/") && fatwa.pdfUrl.endsWith(".pdf"))).toBe(true);
    expect(records.every((fatwa) => fatwa.date === "PDF Archive")).toBe(true);
  });
});
