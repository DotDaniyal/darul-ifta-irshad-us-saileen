import { describe, expect, it } from "vitest";
import { getOfficialEmailCopy, OFFICIAL_ENQUIRY_EMAIL } from "../client/src/components/officialEmailCopy";

describe("official enquiry email copy", () => {
  it("keeps the exact mailto target for Urdu and English public contact surfaces", () => {
    expect(getOfficialEmailCopy("en").mailtoHref).toBe(`mailto:${OFFICIAL_ENQUIRY_EMAIL}`);
    expect(getOfficialEmailCopy("ur").mailtoHref).toBe(`mailto:${OFFICIAL_ENQUIRY_EMAIL}`);
  });

  it("returns distinct complete Urdu and English labels for shared and contextual contact links", () => {
    const english = getOfficialEmailCopy("en");
    const urdu = getOfficialEmailCopy("ur");
    expect(english.sharedLabel).toBe("Written enquiries by email");
    expect(english.cardTitle).toBe("Written enquiries");
    expect(urdu.sharedLabel).toContain("ای میل");
    expect(urdu.cardTitle).toContain("رابطہ");
    expect(urdu.sharedLabel).not.toBe(english.sharedLabel);
  });
});
