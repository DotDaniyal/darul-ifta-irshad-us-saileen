import { z } from "zod";

export const scholarEditableFatwaStatuses = ["draft", "research", "review"] as const;
export const publicationTreatments = ["anonymized", "generalized"] as const;

const bilingualTitle = z.string().trim().min(3).max(300).optional();
const bilingualSummary = z.string().trim().min(10).max(4000).optional();
const bilingualBody = z.string().trim().min(20).max(20000).optional();

export const fatwaDraftCreateInput = z.object({
  questionId: z.number().int().positive(),
  categorySlug: z.string().trim().min(1).max(96).optional(),
  methodologySlug: z.string().trim().min(1).max(96).optional(),
  titleEn: bilingualTitle,
  titleUr: bilingualTitle,
  titleAr: bilingualTitle,
  summaryEn: bilingualSummary,
  summaryUr: bilingualSummary,
  summaryAr: bilingualSummary,
  bodyEn: bilingualBody,
  bodyUr: bilingualBody,
  bodyAr: bilingualBody,
  tags: z.array(z.string().trim().min(1).max(64)).max(12).default([]),
  targetStatus: z.enum(scholarEditableFatwaStatuses).default("draft"),
}).superRefine((value, ctx) => {
  if (!value.titleEn && !value.titleUr && !value.titleAr) {
    ctx.addIssue({ code: "custom", path: ["titleUr"], message: "Provide a title in at least one supported language." });
  }
  if (!value.bodyEn && !value.bodyUr && !value.bodyAr) {
    ctx.addIssue({ code: "custom", path: ["bodyUr"], message: "Provide the scholarly answer in at least one supported language." });
  }
});

export const fatwaDraftUpdateInput = z.object({
  fatwaId: z.number().int().positive(),
  categorySlug: z.string().trim().min(1).max(96).optional(),
  methodologySlug: z.string().trim().min(1).max(96).optional(),
  titleEn: bilingualTitle,
  titleUr: bilingualTitle,
  titleAr: bilingualTitle,
  summaryEn: bilingualSummary,
  summaryUr: bilingualSummary,
  summaryAr: bilingualSummary,
  bodyEn: bilingualBody,
  bodyUr: bilingualBody,
  bodyAr: bilingualBody,
  tags: z.array(z.string().trim().min(1).max(64)).max(12).optional(),
  targetStatus: z.enum(scholarEditableFatwaStatuses).optional(),
}).refine(value => Object.keys(value).some(key => key !== "fatwaId"), {
  message: "Provide an editorial change or a workflow status change.",
});

export const fatwaReviewApprovalInput = z.object({ fatwaId: z.number().int().positive() });
export const fatwaReviewReturnInput = z.object({
  fatwaId: z.number().int().positive(),
  feedback: z.string().trim().min(5).max(500),
});
export const fatwaPublishInput = z.object({
  fatwaId: z.number().int().positive(),
  publicationTreatment: z.enum(publicationTreatments),
});

export function canScholarMoveDraft(from: string, to: string) {
  return ["draft", "research"].includes(from) && scholarEditableFatwaStatuses.includes(to as (typeof scholarEditableFatwaStatuses)[number]);
}

export function isIndependentReviewer(authorId: number, reviewerId: number) {
  return authorId !== reviewerId;
}

/**
 * The public record is never allowed to carry obvious contact identifiers from
 * a private case. Generalized wording remains an explicit scholarly/editorial
 * decision; this guard removes common accidental contact leakage at publish.
 */
export function sanitizeForPublication(value: string | null) {
  if (!value) return value;
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted]")
    .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, "[redacted]")
    .replace(/https?:\/\/\S+/gi, "[redacted]");
}

export function applyPublicationTreatment(value: string | null, treatment: "anonymized" | "generalized", language: "en" | "ur" | "ar") {
  const clean = sanitizeForPublication(value);
  if (treatment === "anonymized") return clean;
  const framing = {
    en: "General guidance: private circumstances have been omitted. ",
    ur: "عمومی رہنمائی: ذاتی حالات حذف کر دیے گئے ہیں۔ ",
    ar: "إرشاد عام: حُذفت الظروف الخاصة. ",
  }[language];
  return `${framing}${clean ?? ""}`.trim();
}
