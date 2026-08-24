import { describe, expect, it } from "vitest";
import { parseScholarInput } from "../../../server/scholars";
describe("scholar input validation", () => {
  it("rejects malformed partial updates instead of silently persisting an empty update", () => {
    expect(
      parseScholarInput({ titleEn: { invalid: true } }, true)
    ).toBeUndefined();
    expect(
      parseScholarInput({ responsibilities: "not-a-list" }, true)
    ).toBeUndefined();
    expect(parseScholarInput({ isPublished: "yes" }, true)).toBeUndefined();
  });
  it("retains intentionally cleared optional fields and well-formed localized updates", () => {
    expect(
      parseScholarInput(
        {
          contactEmail: "",
          responsibilities: [{ en: "Research", ur: "تحقیق" }],
        },
        true
      )
    ).toEqual({
      contactEmail: null,
      responsibilities: [{ en: "Research", ur: "تحقیق" }],
    });
  });
});
