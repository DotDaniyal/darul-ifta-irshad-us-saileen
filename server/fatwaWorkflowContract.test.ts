import { describe, expect, it } from "vitest";
import { applyPublicationTreatment, canScholarMoveDraft, fatwaDraftCreateInput, fatwaPublishInput, isIndependentReviewer, sanitizeForPublication } from "./fatwaWorkflow";

describe("governed Fatwa workflow contract", () => {
  it("allows scholars to work only from drafting or research, never to self-approve a review decision", () => {
    expect(canScholarMoveDraft("draft", "research")).toBe(true);
    expect(canScholarMoveDraft("research", "review")).toBe(true);
    expect(canScholarMoveDraft("review", "draft")).toBe(false);
    expect(canScholarMoveDraft("approved", "review")).toBe(false);
  });

  it("requires at least one title and scholarly answer before creating a controlled draft", () => {
    expect(fatwaDraftCreateInput.safeParse({ questionId: 1, titleUr: "نماز کے متعلق جواب", bodyUr: "یہ تفصیلی علمی جواب کم از کم مطلوبہ طوالت کے ساتھ موجود ہے۔" }).success).toBe(true);
    expect(fatwaDraftCreateInput.safeParse({ questionId: 1, bodyUr: "یہ تفصیلی علمی جواب کم از کم مطلوبہ طوالت کے ساتھ موجود ہے۔" }).success).toBe(false);
  });

  it("requires an explicit anonymized or generalized publication treatment and an independent reviewer", () => {
    expect(fatwaPublishInput.safeParse({ fatwaId: 1, publicationTreatment: "anonymized" }).success).toBe(true);
    expect(fatwaPublishInput.safeParse({ fatwaId: 1 }).success).toBe(false);
    expect(isIndependentReviewer(12, 13)).toBe(true);
    expect(isIndependentReviewer(12, 12)).toBe(false);
  });

  it("redacts obvious private contact identifiers as a final publication safeguard", () => {
    const clean = sanitizeForPublication("Write to case@example.test or +92 333 2617671. https://private.example.test/case");
    expect(clean).toContain("[redacted]");
    expect(clean).not.toContain("case@example.test");
    expect(clean).not.toContain("2617671");
    expect(clean).not.toContain("private.example.test");
  });

  it("marks generalized guidance differently from an anonymized record", () => {
    expect(applyPublicationTreatment("A case-specific summary", "anonymized", "en")).toBe("A case-specific summary");
    expect(applyPublicationTreatment("A case-specific summary", "generalized", "en")).toContain("General guidance:");
  });
});
