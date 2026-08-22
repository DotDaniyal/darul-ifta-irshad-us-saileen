import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";

const suppliedNumbers = [
  "A0405", "A0411", "A0430", "A0439", "A0440", "A0441", "A0442", "A0443", "A0444", "A0445",
  "A0447", "A0448", "A0449", "A0451", "A0454", "A0457", "A0460", "A0461", "A0462", "A0463",
  "A0464", "A0466", "A0467", "A0468", "A0469", "A0470", "A0471", "A0472", "A0473", "A0474",
  "A0481", "A0482", "A0483", "A0484", "A0485", "A0487", "A0489",
];

describe("supplied A04-series Fatwa batch", () => {
  it("keeps all 37 verified supplied documents searchable with distinct managed public PDFs", () => {
    const records = FATAWA.filter((fatwa) => suppliedNumbers.includes(fatwa.number));

    expect(records).toHaveLength(37);
    expect(new Set(records.map((fatwa) => fatwa.pdfUrl)).size).toBe(37);
    expect(records.every((fatwa) => fatwa.pdfUrl.startsWith("/manus-storage/") && fatwa.pdfUrl.endsWith(".pdf"))).toBe(true);
    expect(records.every((fatwa) => fatwa.date === "PDF Archive")).toBe(true);
  });
});
