import { describe, expect, it } from "vitest";
import { categoryInput, policyInput, scholarProfileInput } from "./adminGovernance";

describe("administration governance contracts", () => {
  it("accepts public policy only for the approved trust surfaces", () => {
    expect(policyInput.safeParse({ key: "privacy", titleEn: "Confidentiality", titleUr: "رازداری", bodyEn: "Private question data remains available only to authorised scholarly staff.", bodyUr: "نجی سوالات کی معلومات صرف مجاز علمی عملے کے لیے دستیاب رہتی ہیں۔" }).success).toBe(true);
    expect(policyInput.safeParse({ key: "homepage", titleEn: "Invalid", titleUr: "غلط", bodyEn: "A policy body with enough characters for the invalid case.", bodyUr: "یہ متن غلط پالیسی نام کے باعث مسترد ہونا چاہیے۔" }).success).toBe(false);
  });

  it("requires stable lowercase slugs and a scholarly profile identity", () => {
    expect(categoryInput.safeParse({ slug: "modern-issues", nameEn: "Modern Issues" }).success).toBe(true);
    expect(categoryInput.safeParse({ slug: "Modern Issues", nameEn: "Modern Issues" }).success).toBe(false);
    expect(scholarProfileInput.safeParse({ userId: 3, slug: "mufti-example", displayNameEn: "Mufti Example", qualifications: [], isPublished: false }).success).toBe(true);
  });
});
