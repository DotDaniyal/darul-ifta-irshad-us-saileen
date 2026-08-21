import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const suppliedNumbers = [
  "A0001", "A0002", "A0003", "A0004", "A0005", "A0006", "A0007", "A0011", "A0012", "A0013",
  "A0015", "A0017", "A0022", "A0028", "A0031", "A0037", "A0039", "A0042", "A0044", "A0045",
  "A0046", "A0047", "A0048", "A0051", "A0053", "A0054", "A0055", "A0056", "A0057", "A0058",
  "A0060", "A0062", "A0063", "A0064", "A0065", "A0067", "A0068", "A0069", "A0075", "A0076",
  "A0078", "A0085", "A0086", "A0088", "A0091", "A0092", "A0093", "A0099", "A0100",
];

describe("supplied A0001–A0100 Fatwa batch", () => {
  it("keeps every distinct supplied record available with a public PDF link", () => {
    const records = FATAWA.filter((fatwa) => suppliedNumbers.includes(fatwa.number));

    expect(records).toHaveLength(suppliedNumbers.length);
    expect(new Set(records.map((fatwa) => fatwa.number)).size).toBe(suppliedNumbers.length);
    expect(records.every((fatwa) => fatwa.pdfUrl.startsWith("/manus-storage/") && fatwa.pdfUrl.endsWith(".pdf"))).toBe(true);
  });
});
