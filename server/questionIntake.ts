import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auditEvents, fatwaCategories, fiqhMethodologies, questionAttachments, questionSubmissions } from "../drizzle/schema";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";

const supportedAttachmentTypes = ["application/pdf", "image/jpeg", "image/png"] as const;
const maxAttachmentBytes = 2 * 1024 * 1024;

const attachmentInput = z.object({
  fileName: z.string().trim().min(1).max(120),
  mimeType: z.enum(supportedAttachmentTypes),
  base64: z.string().min(8).max(Math.ceil(maxAttachmentBytes * 1.4)).regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

export const publicQuestionSubmissionInput = z.object({
  isAnonymous: z.boolean().default(false),
  requesterName: z.string().trim().min(2).max(180).optional(),
  requesterEmail: z.string().trim().email().max(320).optional(),
  requesterPhone: z.string().trim().min(6).max(48).optional(),
  preferredLanguage: z.enum(["en", "ur", "ar"]),
  categorySlug: z.string().trim().max(96).optional(),
  methodologySlug: z.string().trim().max(96).optional(),
  subject: z.string().trim().min(5).max(240),
  questionBody: z.string().trim().min(20).max(10000),
  attachments: z.array(attachmentInput).max(2).default([]),
}).superRefine((value, ctx) => {
  if (!value.isAnonymous && !value.requesterEmail && !value.requesterPhone) {
    ctx.addIssue({ code: "custom", path: ["requesterEmail"], message: "Provide an email or phone number, or submit anonymously." });
  }
});

export const questionTrackingInput = z.object({
  referenceCode: z.string().trim().min(8).max(32),
  trackingSecret: z.string().trim().min(20).max(96),
});

export function createTrackingSecret() {
  return randomBytes(24).toString("base64url");
}

export function hashTrackingSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

function safeEqualHash(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "attachment";
}

export function matchesDeclaredAttachmentType(bytes: Buffer, mimeType: (typeof supportedAttachmentTypes)[number]) {
  if (mimeType === "application/pdf") return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return bytes.length >= 8
    && bytes[0] === 0x89
    && bytes.subarray(1, 4).toString("ascii") === "PNG"
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a;
}

export function buildQuestionSubmissionNotification(referenceCode: string) {
  return {
    title: "New confidential Darul Ifta question",
    content: `Reference ${referenceCode} was submitted. Sign in to the scholarly workspace to review it.`,
  };
}

export async function submitPublicQuestion(input: z.infer<typeof publicQuestionSubmissionInput>) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The secure intake service is temporarily unavailable." });

  const [category, methodology] = await Promise.all([
    input.categorySlug ? db.select({ id: fatwaCategories.id }).from(fatwaCategories).where(and(eq(fatwaCategories.slug, input.categorySlug), eq(fatwaCategories.isActive, true))).limit(1) : Promise.resolve([]),
    input.methodologySlug ? db.select({ id: fiqhMethodologies.id }).from(fiqhMethodologies).where(and(eq(fiqhMethodologies.slug, input.methodologySlug), eq(fiqhMethodologies.isActive, true))).limit(1) : Promise.resolve([]),
  ]);
  if (input.categorySlug && !category[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Please choose an available category." });
  if (input.methodologySlug && !methodology[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Please choose an available methodology." });

  const referenceCode = `DI-${new Date().getUTCFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
  const trackingSecret = createTrackingSecret();
  const trackingSecretHash = hashTrackingSecret(trackingSecret);
  const uploaded = await Promise.all(input.attachments.map(async attachment => {
    const bytes = Buffer.from(attachment.base64, "base64");
    if (!bytes.length || bytes.length > maxAttachmentBytes) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Attachments must be a PDF, JPEG, or PNG up to 2 MB." });
    }
    if (!matchesDeclaredAttachmentType(bytes, attachment.mimeType)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "The attachment content does not match its declared file type." });
    }
    const stored = await storagePut(
      `private/questions/${referenceCode}/${randomUUID()}-${safeFileName(attachment.fileName)}`,
      bytes,
      attachment.mimeType,
    );
    return { ...stored, fileName: safeFileName(attachment.fileName), mimeType: attachment.mimeType, byteSize: bytes.length };
  }));

  const inserted = await db.insert(questionSubmissions).values({
    referenceCode,
    trackingSecretHash,
    isAnonymous: input.isAnonymous,
    requesterName: input.isAnonymous ? null : input.requesterName ?? null,
    requesterEmail: input.isAnonymous ? null : input.requesterEmail ?? null,
    requesterPhone: input.isAnonymous ? null : input.requesterPhone ?? null,
    preferredLanguage: input.preferredLanguage,
    categoryId: category[0]?.id ?? null,
    methodologyId: methodology[0]?.id ?? null,
    subject: input.subject,
    questionBody: input.questionBody,
    sensitivity: input.isAnonymous ? "private" : "restricted",
  });
  const questionId = Number(inserted[0].insertId);

  if (uploaded.length) {
    await db.insert(questionAttachments).values(uploaded.map(file => ({
      questionId,
      storageKey: file.key,
      fileName: file.fileName,
      mimeType: file.mimeType,
      byteSize: file.byteSize,
    })));
  }
  await db.insert(auditEvents).values({
    entityType: "question_submission",
    entityId: String(questionId),
    action: "submitted_publicly",
    metadata: { isAnonymous: input.isAnonymous, preferredLanguage: input.preferredLanguage, attachmentCount: uploaded.length },
  });
  void notifyOwner(buildQuestionSubmissionNotification(referenceCode));
  return { referenceCode, trackingSecret, submittedAt: new Date() };
}

export async function trackPublicQuestion(input: z.infer<typeof questionTrackingInput>) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The secure tracking service is temporarily unavailable." });
  const record = await db.select({
    referenceCode: questionSubmissions.referenceCode,
    status: questionSubmissions.status,
    preferredLanguage: questionSubmissions.preferredLanguage,
    submittedAt: questionSubmissions.submittedAt,
    updatedAt: questionSubmissions.updatedAt,
    trackingSecretHash: questionSubmissions.trackingSecretHash,
  }).from(questionSubmissions).where(eq(questionSubmissions.referenceCode, input.referenceCode.toUpperCase())).limit(1);
  const result = record[0];
  if (!result || !safeEqualHash(result.trackingSecretHash, hashTrackingSecret(input.trackingSecret))) {
    throw new TRPCError({ code: "NOT_FOUND", message: "The reference code or tracking secret is not recognised." });
  }
  return {
    referenceCode: result.referenceCode,
    status: result.status,
    preferredLanguage: result.preferredLanguage,
    submittedAt: result.submittedAt,
    updatedAt: result.updatedAt,
  };
}
