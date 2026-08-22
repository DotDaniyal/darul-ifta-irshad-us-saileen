import { describe, expect, it } from "vitest";
import { FATAWA } from "./fatawa";
import { getTranslationStatusLabel, localizeFatwa } from "./fatwaLocalization";
import { FATWA_TRANSLATION_DRAFTS } from "./fatwaTranslationDrafts";

describe("review-safe bilingual Fatwa localization", () => {
  it("preserves every Urdu original and provides one review-required English title draft for every archive record", () => {
    expect(Object.keys(FATWA_TRANSLATION_DRAFTS)).toHaveLength(FATAWA.length);

    for (const fatwa of FATAWA) {
      const urdu = localizeFatwa(fatwa, "ur");
      const english = localizeFatwa(fatwa, "en");
      expect(urdu.title).toBe(fatwa.titleUr);
      expect(english.title).toBe(FATWA_TRANSLATION_DRAFTS[fatwa.slug]?.titleEn);
      expect(english.reviewStatus).toBe("draft-pending-review");
      expect(english.pdfUrl).toBe(fatwa.pdfUrl);
    }
  });

  it("does not present an unreviewed title draft as a complete translated Fatwa", () => {
    const record = localizeFatwa(FATAWA[0]!, "en");
    expect(record.hasApprovedFullTranslation).toBe(false);
    expect(record.question).toContain("awaiting qualified scholarly review");
    expect(getTranslationStatusLabel(record.reviewStatus, "en")).toContain("pending qualified review");
  });
});
