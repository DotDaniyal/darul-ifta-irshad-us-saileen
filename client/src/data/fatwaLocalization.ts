import type { Fatwa, FatwaCategory } from "./fatawa";
import { FATWA_TRANSLATION_DRAFTS } from "./fatwaTranslationDrafts";

export type FatwaLanguage = "ur" | "en";
export type TranslationReviewStatus = "source-original" | "draft-pending-review" | "approved";

export type LocalizedFatwaText = {
  en: string;
  ur: string;
};

export type FatwaTranslationDraft = {
  titleEn?: string;
  questionEn?: string;
  answerEn?: string;
  scholarEn?: string;
  referenceEn?: string;
  topicsEn?: string[];
  reviewStatus: Exclude<TranslationReviewStatus, "source-original">;
};

export type LocalizedFatwa = {
  slug: string;
  number: string;
  language: FatwaLanguage;
  title: string;
  question: string;
  answer: string;
  scholar: string;
  reference: string;
  category: string;
  date: string;
  topics: string[];
  reviewStatus: TranslationReviewStatus;
  hasApprovedFullTranslation: boolean;
  pdfUrl: string;
};

export const FATWA_CATEGORY_LABELS: Record<FatwaCategory, LocalizedFatwaText> = {
  "Worship": { en: "Worship", ur: "عبادات" },
  "Transactions": { en: "Transactions", ur: "معاملات" },
  "Marriage & Divorce": { en: "Marriage & Divorce", ur: "نکاح و طلاق" },
  "Inheritance & Wills": { en: "Inheritance & Wills", ur: "وراثت و وصیت" },
  "Belief & Conduct": { en: "Belief & Conduct", ur: "عقائد و معاشرت" },
};

const englishReviewNotice =
  "An English translation of this Fatwa is awaiting qualified scholarly review. The privacy-sanitized original Urdu PDF remains the source record.";

const englishReferenceNotice =
  "Original Darul Ifta Urdu PDF document; English review-required translation status is shown above.";

export function localizeFatwa(fatwa: Fatwa, language: FatwaLanguage): LocalizedFatwa {
  if (language === "ur") {
    return {
      slug: fatwa.slug,
      number: fatwa.number,
      language,
      title: fatwa.titleUr,
      question: fatwa.questionUr,
      answer: fatwa.answerUr,
      scholar: fatwa.scholar,
      reference: fatwa.reference,
      category: FATWA_CATEGORY_LABELS[fatwa.category].ur,
      date: fatwa.date === "PDF Archive" ? "پی ڈی ایف آرکائیو" : fatwa.date,
      topics: [FATWA_CATEGORY_LABELS[fatwa.category].ur, fatwa.number],
      reviewStatus: "source-original",
      hasApprovedFullTranslation: false,
      pdfUrl: fatwa.pdfUrl,
    };
  }

  const draft = FATWA_TRANSLATION_DRAFTS[fatwa.slug];
  const hasApprovedFullTranslation =
    draft?.reviewStatus === "approved" && Boolean(draft.questionEn && draft.answerEn);

  return {
    slug: fatwa.slug,
    number: fatwa.number,
    language,
    title: draft?.titleEn ?? fatwa.titleEn,
    question: hasApprovedFullTranslation ? draft.questionEn! : englishReviewNotice,
    answer: hasApprovedFullTranslation ? draft.answerEn! : englishReviewNotice,
    scholar: draft?.scholarEn ?? "Darul Ifta Irshad-us-Saileen",
    reference: hasApprovedFullTranslation ? draft.referenceEn ?? englishReferenceNotice : englishReferenceNotice,
    category: FATWA_CATEGORY_LABELS[fatwa.category].en,
    date: fatwa.date,
    topics: draft?.topicsEn ?? [FATWA_CATEGORY_LABELS[fatwa.category].en, fatwa.number],
    reviewStatus: draft?.reviewStatus ?? "draft-pending-review",
    hasApprovedFullTranslation,
    pdfUrl: fatwa.pdfUrl,
  };
}

export function getTranslationStatusLabel(status: TranslationReviewStatus, language: FatwaLanguage): string {
  if (language === "ur") return "اصل اردو ماخذ";
  if (status === "approved") return "Scholar-reviewed English translation";
  return "English draft pending qualified review";
}
