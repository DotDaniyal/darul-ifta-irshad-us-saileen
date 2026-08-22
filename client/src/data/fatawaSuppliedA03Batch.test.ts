import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const suppliedNumbers = [
  "A0303", "A0305", "A0306", "A0307", "A0308", "A0309", "A0313", "A0315", "A0316", "A0317",
  "A0318", "A0320", "A0321", "A0322", "A0323", "A0324", "A0325", "A0326", "A0327", "A0328",
  "A0330", "A0331", "A0332", "A0337", "A0339", "A0340", "A0341", "A0342", "A0343", "A0344",
  "A0345", "A0347", "A0348", "A0349", "A0350", "A0351", "A0352", "A0353", "A0354", "A0355",
  "A0356", "A0357", "A0360", "A0361", "A0363", "A0365", "A0366", "A0367", "A0369", "A0370",
  "A0373", "A0375", "A0376", "A0378", "A0379", "A0380", "A0390", "A0392",
];

describe("supplied A03-series Fatwa batch", () => {
  it("keeps all 59 verified supplied documents searchable with distinct managed public PDFs", () => {
    const records = FATAWA.filter((fatwa) => suppliedNumbers.includes(fatwa.number));

    expect(records).toHaveLength(59);
    expect(records.filter((fatwa) => fatwa.number === "A0361")).toHaveLength(2);
    expect(new Set(records.map((fatwa) => fatwa.pdfUrl)).size).toBe(59);
    expect(records.every((fatwa) => fatwa.pdfUrl.startsWith("/manus-storage/") && fatwa.pdfUrl.endsWith(".pdf"))).toBe(true);
    expect(records.every((fatwa) => fatwa.date === "PDF Archive")).toBe(true);
  });
});
