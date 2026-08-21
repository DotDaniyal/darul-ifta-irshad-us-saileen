import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray, isNull, like, or, sql } from "drizzle-orm";
import { auditEvents, fatwaCategories, fatwaRecords, fatwaRevisions, fiqhMethodologies, questionSubmissions, scholarProfiles, siteSettings, users } from "../drizzle/schema";
import { getDb } from "./db";
import { applyPublicationTreatment, canScholarMoveDraft, isIndependentReviewer, sanitizeForPublication, type fatwaDraftCreateInput, type fatwaDraftUpdateInput, type fatwaPublishInput, type fatwaReviewReturnInput } from "./fatwaWorkflow";
import type { z } from "zod";
import type { categoryInput, methodologyInput, policyInput, scholarProfileInput } from "./adminGovernance";

type DraftCreateInput = z.infer<typeof fatwaDraftCreateInput>;
type DraftUpdateInput = z.infer<typeof fatwaDraftUpdateInput>;
type PublishInput = z.infer<typeof fatwaPublishInput>;
type ReturnInput = z.infer<typeof fatwaReviewReturnInput>;
type WorkflowRecord = typeof fatwaRecords.$inferSelect;
type ProfileInput = z.infer<typeof scholarProfileInput>;
type CategoryInput = z.infer<typeof categoryInput>;
type MethodologyInput = z.infer<typeof methodologyInput>;
type PolicyInput = z.infer<typeof policyInput>;

function safeSlug(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 100) || "fatwa";
}

function snapshotOf(record: WorkflowRecord, publicationTreatment?: PublishInput["publicationTreatment"]) {
  return {
    id: record.id,
    slug: record.slug,
    referenceNumber: record.referenceNumber,
    sourceQuestionId: record.sourceQuestionId,
    categoryId: record.categoryId,
    methodologyId: record.methodologyId,
    authorId: record.authorId,
    approverId: record.approverId,
    status: record.status,
    titleEn: record.titleEn,
    titleUr: record.titleUr,
    titleAr: record.titleAr,
    summaryEn: record.summaryEn,
    summaryUr: record.summaryUr,
    summaryAr: record.summaryAr,
    bodyEn: record.bodyEn,
    bodyUr: record.bodyUr,
    bodyAr: record.bodyAr,
    tags: record.tags,
    publicPdfUrl: record.publicPdfUrl,
    publishedAt: record.publishedAt,
    publicationTreatment,
  };
}

async function insertRevision(tx: any, record: WorkflowRecord, editorId: number, changeSummary: string, publicationTreatment?: PublishInput["publicationTreatment"]) {
  const revision = await tx.select({ latest: sql<number>`coalesce(max(${fatwaRevisions.revisionNumber}), 0)` })
    .from(fatwaRevisions).where(eq(fatwaRevisions.fatwaId, record.id));
  await tx.insert(fatwaRevisions).values({
    fatwaId: record.id,
    revisionNumber: Number(revision[0]?.latest ?? 0) + 1,
    editorId,
    changeSummary,
    snapshot: snapshotOf(record, publicationTreatment),
  });
}

async function resolveActiveTaxonomy(db: any, categorySlug?: string, methodologySlug?: string) {
  const [category, methodology] = await Promise.all([
    categorySlug ? db.select({ id: fatwaCategories.id }).from(fatwaCategories).where(and(eq(fatwaCategories.slug, categorySlug), eq(fatwaCategories.isActive, true))).limit(1) : Promise.resolve([]),
    methodologySlug ? db.select({ id: fiqhMethodologies.id }).from(fiqhMethodologies).where(and(eq(fiqhMethodologies.slug, methodologySlug), eq(fiqhMethodologies.isActive, true))).limit(1) : Promise.resolve([]),
  ]);
  if (categorySlug && !category[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Select an available Fatwa category." });
  if (methodologySlug && !methodology[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Select an available fiqh methodology." });
  return { categoryId: category[0]?.id, methodologyId: methodology[0]?.id };
}

export async function getMyQuestionSummaries(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: questionSubmissions.id,
    referenceCode: questionSubmissions.referenceCode,
    subject: questionSubmissions.subject,
    status: questionSubmissions.status,
    submittedAt: questionSubmissions.submittedAt,
    updatedAt: questionSubmissions.updatedAt,
  }).from(questionSubmissions).where(eq(questionSubmissions.submittedById, userId)).orderBy(desc(questionSubmissions.updatedAt)).limit(30);
}

/** Assigned case details are restricted to the assigned scholarly account and exclude identity/contact fields. */
export async function getAssignedQuestionSummaries(scholarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: questionSubmissions.id,
    referenceCode: questionSubmissions.referenceCode,
    preferredLanguage: questionSubmissions.preferredLanguage,
    subject: questionSubmissions.subject,
    questionBody: questionSubmissions.questionBody,
    status: questionSubmissions.status,
    sensitivity: questionSubmissions.sensitivity,
    submittedAt: questionSubmissions.submittedAt,
    updatedAt: questionSubmissions.updatedAt,
    fatwaId: fatwaRecords.id,
    fatwaStatus: fatwaRecords.status,
  }).from(questionSubmissions)
    .leftJoin(fatwaRecords, and(eq(fatwaRecords.sourceQuestionId, questionSubmissions.id), eq(fatwaRecords.authorId, scholarId)))
    .where(eq(questionSubmissions.assignedScholarId, scholarId)).orderBy(desc(questionSubmissions.updatedAt)).limit(30);
}

/** Unassigned cases expose only their minimum triage summary until a scholar explicitly accepts the restricted case. */
export async function getClaimableQuestionSummaries() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: questionSubmissions.id,
    referenceCode: questionSubmissions.referenceCode,
    preferredLanguage: questionSubmissions.preferredLanguage,
    subject: questionSubmissions.subject,
    status: questionSubmissions.status,
    sensitivity: questionSubmissions.sensitivity,
    submittedAt: questionSubmissions.submittedAt,
  }).from(questionSubmissions)
    .where(and(isNull(questionSubmissions.assignedScholarId), inArray(questionSubmissions.status, ["received", "triaged"])))
    .orderBy(desc(questionSubmissions.submittedAt)).limit(20);
}

export async function claimQuestion(questionId: number, scholarId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The scholarly workspace is temporarily unavailable." });
  const result = await db.update(questionSubmissions).set({ assignedScholarId: scholarId, status: "in_review" })
    .where(and(eq(questionSubmissions.id, questionId), isNull(questionSubmissions.assignedScholarId), inArray(questionSubmissions.status, ["received", "triaged"])));
  if (!Number(result[0]?.affectedRows ?? 0)) throw new TRPCError({ code: "CONFLICT", message: "This question has already been assigned or is no longer available." });
  await db.insert(auditEvents).values({ actorId: scholarId, entityType: "question_submission", entityId: String(questionId), action: "claimed_for_scholarly_review", metadata: {} });
  return { questionId, status: "in_review" as const };
}

export async function getMyFatwaDrafts(authorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: fatwaRecords.id,
    sourceQuestionId: fatwaRecords.sourceQuestionId,
    referenceNumber: fatwaRecords.referenceNumber,
    status: fatwaRecords.status,
    categoryId: fatwaRecords.categoryId,
    methodologyId: fatwaRecords.methodologyId,
    titleEn: fatwaRecords.titleEn,
    titleUr: fatwaRecords.titleUr,
    titleAr: fatwaRecords.titleAr,
    summaryEn: fatwaRecords.summaryEn,
    summaryUr: fatwaRecords.summaryUr,
    summaryAr: fatwaRecords.summaryAr,
    bodyEn: fatwaRecords.bodyEn,
    bodyUr: fatwaRecords.bodyUr,
    bodyAr: fatwaRecords.bodyAr,
    tags: fatwaRecords.tags,
    updatedAt: fatwaRecords.updatedAt,
  }).from(fatwaRecords).where(and(eq(fatwaRecords.authorId, authorId), inArray(fatwaRecords.status, ["draft", "research", "review"])))
    .orderBy(desc(fatwaRecords.updatedAt)).limit(30);
}

export async function createFatwaDraft(input: DraftCreateInput, authorId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The scholarly workspace is temporarily unavailable." });
  const question = await db.select({ id: questionSubmissions.id, subject: questionSubmissions.subject, assignedScholarId: questionSubmissions.assignedScholarId })
    .from(questionSubmissions).where(eq(questionSubmissions.id, input.questionId)).limit(1);
  if (!question[0] || question[0].assignedScholarId !== authorId) throw new TRPCError({ code: "FORBIDDEN", message: "Only an assigned scholar may draft a Fatwa for this question." });
  const existing = await db.select({ id: fatwaRecords.id }).from(fatwaRecords)
    .where(and(eq(fatwaRecords.sourceQuestionId, input.questionId), eq(fatwaRecords.authorId, authorId))).limit(1);
  if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "A governed Fatwa draft already exists for this assigned question." });
  const taxonomy = await resolveActiveTaxonomy(db, input.categorySlug, input.methodologySlug);
  const token = randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  const referenceNumber = `DI-F-${new Date().getUTCFullYear()}-${token}`;
  const slug = `${safeSlug(input.titleEn ?? question[0].subject)}-${token.toLowerCase()}`;
  return db.transaction(async tx => {
    const inserted = await tx.insert(fatwaRecords).values({
      slug, referenceNumber, sourceQuestionId: input.questionId, categoryId: taxonomy.categoryId ?? null, methodologyId: taxonomy.methodologyId ?? null, authorId, status: input.targetStatus,
      titleEn: input.titleEn ?? null, titleUr: input.titleUr ?? null, titleAr: input.titleAr ?? null,
      summaryEn: input.summaryEn ?? null, summaryUr: input.summaryUr ?? null, summaryAr: input.summaryAr ?? null,
      bodyEn: input.bodyEn ?? null, bodyUr: input.bodyUr ?? null, bodyAr: input.bodyAr ?? null, tags: input.tags,
    });
    const fatwaId = Number(inserted[0].insertId);
    await tx.update(questionSubmissions).set({ status: "in_review" }).where(eq(questionSubmissions.id, input.questionId));
    const record = (await tx.select().from(fatwaRecords).where(eq(fatwaRecords.id, fatwaId)).limit(1))[0];
    await insertRevision(tx, record, authorId, `Draft created and saved as ${record.status}.`);
    await tx.insert(auditEvents).values({ actorId: authorId, entityType: "fatwa_record", entityId: String(fatwaId), action: "fatwa_draft_created", metadata: { sourceQuestionId: input.questionId, status: record.status } });
    return { fatwaId, referenceNumber, status: record.status };
  });
}

export async function updateFatwaDraft(input: DraftUpdateInput, editorId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The scholarly workspace is temporarily unavailable." });
  const current = (await db.select().from(fatwaRecords).where(eq(fatwaRecords.id, input.fatwaId)).limit(1))[0];
  if (!current || current.authorId !== editorId) throw new TRPCError({ code: "FORBIDDEN", message: "Only the drafting scholar may edit this Fatwa." });
  if (input.targetStatus && !canScholarMoveDraft(current.status, input.targetStatus)) throw new TRPCError({ code: "CONFLICT", message: "This Fatwa cannot be moved to that status by its drafting scholar." });
  const taxonomy = await resolveActiveTaxonomy(db, input.categorySlug, input.methodologySlug);
  return db.transaction(async tx => {
    const updates: any = {};
    const editableFields = ["titleEn", "titleUr", "titleAr", "summaryEn", "summaryUr", "summaryAr", "bodyEn", "bodyUr", "bodyAr", "tags"] as const;
    for (const field of editableFields) if (input[field] !== undefined) updates[field] = input[field];
    if (input.categorySlug !== undefined) updates.categoryId = taxonomy.categoryId ?? null;
    if (input.methodologySlug !== undefined) updates.methodologyId = taxonomy.methodologyId ?? null;
    if (input.targetStatus) updates.status = input.targetStatus;
    await tx.update(fatwaRecords).set(updates).where(eq(fatwaRecords.id, input.fatwaId));
    const record = (await tx.select().from(fatwaRecords).where(eq(fatwaRecords.id, input.fatwaId)).limit(1))[0];
    const changeSummary = input.targetStatus && input.targetStatus !== current.status
      ? `Scholar updated the draft and moved it from ${current.status} to ${input.targetStatus}.`
      : "Scholar updated the controlled Fatwa draft.";
    await insertRevision(tx, record, editorId, changeSummary);
    await tx.insert(auditEvents).values({ actorId: editorId, entityType: "fatwa_record", entityId: String(input.fatwaId), action: "fatwa_draft_updated", metadata: { fromStatus: current.status, toStatus: record.status } });
    return { fatwaId: record.id, status: record.status, updatedAt: record.updatedAt };
  });
}

export async function getFatwaReviewQueue() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: fatwaRecords.id, referenceNumber: fatwaRecords.referenceNumber, slug: fatwaRecords.slug, titleEn: fatwaRecords.titleEn, titleUr: fatwaRecords.titleUr,
    summaryEn: fatwaRecords.summaryEn, summaryUr: fatwaRecords.summaryUr, authorId: fatwaRecords.authorId, status: fatwaRecords.status, createdAt: fatwaRecords.createdAt, updatedAt: fatwaRecords.updatedAt,
  }).from(fatwaRecords).where(eq(fatwaRecords.status, "review")).orderBy(desc(fatwaRecords.updatedAt)).limit(30);
}

export async function approveFatwaDraft(fatwaId: number, reviewerId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The review workspace is temporarily unavailable." });
  const current = (await db.select().from(fatwaRecords).where(eq(fatwaRecords.id, fatwaId)).limit(1))[0];
  if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "The Fatwa draft was not found." });
  if (!isIndependentReviewer(current.authorId, reviewerId)) throw new TRPCError({ code: "FORBIDDEN", message: "A drafting scholar cannot independently approve their own Fatwa." });
  if (current.status !== "review") throw new TRPCError({ code: "CONFLICT", message: "Only review-ready Fatwa drafts may be approved." });
  return db.transaction(async tx => {
    await tx.update(fatwaRecords).set({ status: "approved", approverId: reviewerId }).where(eq(fatwaRecords.id, fatwaId));
    const record = (await tx.select().from(fatwaRecords).where(eq(fatwaRecords.id, fatwaId)).limit(1))[0];
    await insertRevision(tx, record, reviewerId, "Independent reviewer approved the Fatwa for controlled publication.");
    await tx.insert(auditEvents).values({ actorId: reviewerId, entityType: "fatwa_record", entityId: String(fatwaId), action: "fatwa_approved", metadata: { authorId: current.authorId } });
    return { fatwaId, status: record.status };
  });
}

export async function returnFatwaDraft(input: ReturnInput, reviewerId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The review workspace is temporarily unavailable." });
  const current = (await db.select().from(fatwaRecords).where(eq(fatwaRecords.id, input.fatwaId)).limit(1))[0];
  if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "The Fatwa draft was not found." });
  if (!isIndependentReviewer(current.authorId, reviewerId)) throw new TRPCError({ code: "FORBIDDEN", message: "A drafting scholar cannot independently review their own Fatwa." });
  if (current.status !== "review") throw new TRPCError({ code: "CONFLICT", message: "Only review-ready Fatwa drafts may be returned for revision." });
  return db.transaction(async tx => {
    await tx.update(fatwaRecords).set({ status: "research", approverId: null }).where(eq(fatwaRecords.id, input.fatwaId));
    const record = (await tx.select().from(fatwaRecords).where(eq(fatwaRecords.id, input.fatwaId)).limit(1))[0];
    await insertRevision(tx, record, reviewerId, `Reviewer returned the draft for revision: ${input.feedback}`);
    await tx.insert(auditEvents).values({ actorId: reviewerId, entityType: "fatwa_record", entityId: String(input.fatwaId), action: "fatwa_returned_for_revision", metadata: { feedback: input.feedback } });
    return { fatwaId: record.id, status: record.status };
  });
}

export async function getApprovedFatwaPublicationQueue() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: fatwaRecords.id, referenceNumber: fatwaRecords.referenceNumber, titleEn: fatwaRecords.titleEn, titleUr: fatwaRecords.titleUr, approverId: fatwaRecords.approverId, updatedAt: fatwaRecords.updatedAt })
    .from(fatwaRecords).where(eq(fatwaRecords.status, "approved")).orderBy(desc(fatwaRecords.updatedAt)).limit(30);
}

export async function publishApprovedFatwa(input: PublishInput, reviewerId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The publication workspace is temporarily unavailable." });
  const current = (await db.select().from(fatwaRecords).where(eq(fatwaRecords.id, input.fatwaId)).limit(1))[0];
  if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "The approved Fatwa was not found." });
  if (!isIndependentReviewer(current.authorId, reviewerId)) throw new TRPCError({ code: "FORBIDDEN", message: "A drafting scholar cannot publish their own Fatwa." });
  if (current.status !== "approved") throw new TRPCError({ code: "CONFLICT", message: "Only independently approved Fatwas may be published." });
  const publishedAt = new Date();
  const publicFields = {
    titleEn: sanitizeForPublication(current.titleEn),
    titleUr: sanitizeForPublication(current.titleUr),
    titleAr: sanitizeForPublication(current.titleAr),
    summaryEn: applyPublicationTreatment(current.summaryEn, input.publicationTreatment, "en"),
    summaryUr: applyPublicationTreatment(current.summaryUr, input.publicationTreatment, "ur"),
    summaryAr: applyPublicationTreatment(current.summaryAr, input.publicationTreatment, "ar"),
    bodyEn: sanitizeForPublication(current.bodyEn),
    bodyUr: sanitizeForPublication(current.bodyUr),
    bodyAr: sanitizeForPublication(current.bodyAr),
  };
  return db.transaction(async tx => {
    await tx.update(fatwaRecords).set({ status: "published", publishedAt, ...publicFields }).where(eq(fatwaRecords.id, input.fatwaId));
    if (current.sourceQuestionId) await tx.update(questionSubmissions).set({ status: "answered" }).where(eq(questionSubmissions.id, current.sourceQuestionId));
    const record = (await tx.select().from(fatwaRecords).where(eq(fatwaRecords.id, input.fatwaId)).limit(1))[0];
    await insertRevision(tx, record, reviewerId, `Published after ${input.publicationTreatment} editorial treatment.`, input.publicationTreatment);
    await tx.insert(auditEvents).values({ actorId: reviewerId, entityType: "fatwa_record", entityId: String(input.fatwaId), action: "fatwa_published", metadata: { publicationTreatment: input.publicationTreatment, sourceQuestionId: current.sourceQuestionId } });
    return { fatwaId: record.id, status: record.status, publishedAt: record.publishedAt };
  });
}

export async function getPlatformOverview() {
  const db = await getDb();
  if (!db) return { openQuestions: 0, reviewQueue: 0, publishedFatwas: 0, scholars: 0 };
  const [openQuestions, reviewQueue, publishedFatwas, scholars] = await Promise.all([
    db.select({ total: count() }).from(questionSubmissions).where(inArray(questionSubmissions.status, ["received", "triaged", "in_review", "clarification_needed"])),
    db.select({ total: count() }).from(fatwaRecords).where(eq(fatwaRecords.status, "review")),
    db.select({ total: count() }).from(fatwaRecords).where(eq(fatwaRecords.status, "published")),
    db.select({ total: count() }).from(users).where(inArray(users.role, ["scholar", "reviewer", "admin"])),
  ]);
  return { openQuestions: Number(openQuestions[0]?.total ?? 0), reviewQueue: Number(reviewQueue[0]?.total ?? 0), publishedFatwas: Number(publishedFatwas[0]?.total ?? 0), scholars: Number(scholars[0]?.total ?? 0) };
}

export async function updatePlatformUserRole(userId: number, role: "user" | "scholar" | "reviewer" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { userId, role };
}

export async function getAdministrationGovernance() {
  const db = await getDb();
  if (!db) return { profiles: [], categories: [], methodologies: [], policies: [] };
  const [profiles, categories, methodologies, policies] = await Promise.all([
    db.select({ id: scholarProfiles.id, userId: scholarProfiles.userId, slug: scholarProfiles.slug, honorific: scholarProfiles.honorific, displayNameEn: scholarProfiles.displayNameEn, displayNameUr: scholarProfiles.displayNameUr, biographyEn: scholarProfiles.biographyEn, biographyUr: scholarProfiles.biographyUr, qualifications: scholarProfiles.qualifications, scholarlyLineage: scholarProfiles.scholarlyLineage, isPublished: scholarProfiles.isPublished, userName: users.name, userRole: users.role }).from(scholarProfiles).innerJoin(users, eq(scholarProfiles.userId, users.id)).orderBy(desc(scholarProfiles.updatedAt)),
    db.select().from(fatwaCategories).orderBy(fatwaCategories.sortOrder),
    db.select().from(fiqhMethodologies).orderBy(fiqhMethodologies.nameEn),
    db.select().from(siteSettings).where(inArray(siteSettings.settingKey, ["policy.methodology", "policy.privacy", "policy.guidance", "policy.publication"])),
  ]);
  return { profiles, categories, methodologies, policies };
}

export async function upsertScholarProfile(input: ProfileInput, actorId: number) {
  const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Administration is temporarily unavailable." });
  const user = (await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, input.userId)).limit(1))[0];
  if (!user || !["scholar", "reviewer", "admin"].includes(user.role)) throw new TRPCError({ code: "BAD_REQUEST", message: "A public scholar profile requires a scholarly-role account." });
  const existing = (await db.select({ id: scholarProfiles.id, slug: scholarProfiles.slug }).from(scholarProfiles).where(eq(scholarProfiles.userId, input.userId)).limit(1))[0];
  if (existing && existing.slug !== input.slug) throw new TRPCError({ code: "CONFLICT", message: "Profile slugs are immutable after creation." });
  const values = { slug: input.slug, honorific: input.honorific ?? null, displayNameEn: input.displayNameEn ?? null, displayNameUr: input.displayNameUr ?? null, displayNameAr: input.displayNameAr ?? null, biographyEn: input.biographyEn ?? null, biographyUr: input.biographyUr ?? null, biographyAr: input.biographyAr ?? null, qualifications: input.qualifications, scholarlyLineage: input.scholarlyLineage ?? null, isPublished: input.isPublished };
  if (existing) await db.update(scholarProfiles).set(values).where(eq(scholarProfiles.id, existing.id)); else await db.insert(scholarProfiles).values({ userId: input.userId, ...values });
  await db.insert(auditEvents).values({ actorId, entityType: "scholar_profile", entityId: String(existing?.id ?? input.userId), action: existing ? "scholar_profile_updated" : "scholar_profile_created", metadata: { userId: input.userId, isPublished: input.isPublished } });
  return { userId: input.userId, isPublished: input.isPublished };
}

async function ensureImmutableSlug(db: any, table: any, id: number | undefined, slugValue: string) {
  if (!id) return;
  const row = (await db.select({ slug: table.slug }).from(table).where(eq(table.id, id)).limit(1))[0];
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "The governance record was not found." });
  if (row.slug !== slugValue) throw new TRPCError({ code: "CONFLICT", message: "Governance slugs are immutable to preserve historical references." });
}

export async function upsertCategory(input: CategoryInput, actorId: number) {
  const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Administration is temporarily unavailable." });
  await ensureImmutableSlug(db, fatwaCategories, input.id, input.slug);
  const values = { slug: input.slug, nameEn: input.nameEn, nameUr: input.nameUr ?? null, nameAr: input.nameAr ?? null, descriptionEn: input.descriptionEn ?? null, sortOrder: input.sortOrder, isActive: input.isActive };
  if (input.id) await db.update(fatwaCategories).set(values).where(eq(fatwaCategories.id, input.id)); else await db.insert(fatwaCategories).values(values);
  await db.insert(auditEvents).values({ actorId, entityType: "fatwa_category", entityId: String(input.id ?? input.slug), action: input.id ? "category_updated" : "category_created", metadata: { isActive: input.isActive } });
  return { id: input.id ?? null, slug: input.slug };
}

export async function upsertMethodology(input: MethodologyInput, actorId: number) {
  const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Administration is temporarily unavailable." });
  await ensureImmutableSlug(db, fiqhMethodologies, input.id, input.slug);
  const values = { slug: input.slug, nameEn: input.nameEn, nameUr: input.nameUr ?? null, nameAr: input.nameAr ?? null, methodologyStatement: input.methodologyStatement ?? null, isActive: input.isActive };
  if (input.id) await db.update(fiqhMethodologies).set(values).where(eq(fiqhMethodologies.id, input.id)); else await db.insert(fiqhMethodologies).values(values);
  await db.insert(auditEvents).values({ actorId, entityType: "fiqh_methodology", entityId: String(input.id ?? input.slug), action: input.id ? "methodology_updated" : "methodology_created", metadata: { isActive: input.isActive } });
  return { id: input.id ?? null, slug: input.slug };
}

export async function upsertPublicPolicy(input: PolicyInput, actorId: number) {
  const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Administration is temporarily unavailable." });
  const settingKey = `policy.${input.key}`; const value = { titleEn: input.titleEn, titleUr: input.titleUr, bodyEn: input.bodyEn, bodyUr: input.bodyUr };
  const existing = (await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.settingKey, settingKey)).limit(1))[0];
  if (existing) await db.update(siteSettings).set({ value, updatedById: actorId }).where(eq(siteSettings.id, existing.id)); else await db.insert(siteSettings).values({ settingKey, value, updatedById: actorId });
  await db.insert(auditEvents).values({ actorId, entityType: "site_policy", entityId: settingKey, action: "public_policy_updated", metadata: {} });
  return { key: input.key, value };
}

export async function getPublicScholarProfiles() {
  const db = await getDb(); if (!db) return [];
  return db.select({ slug: scholarProfiles.slug, honorific: scholarProfiles.honorific, displayNameEn: scholarProfiles.displayNameEn, displayNameUr: scholarProfiles.displayNameUr, biographyEn: scholarProfiles.biographyEn, biographyUr: scholarProfiles.biographyUr, qualifications: scholarProfiles.qualifications, scholarlyLineage: scholarProfiles.scholarlyLineage }).from(scholarProfiles).where(eq(scholarProfiles.isPublished, true)).orderBy(scholarProfiles.displayNameEn);
}

export async function getPublicPolicies() {
  const db = await getDb(); if (!db) return [];
  return db.select({ settingKey: siteSettings.settingKey, value: siteSettings.value, updatedAt: siteSettings.updatedAt }).from(siteSettings).where(inArray(siteSettings.settingKey, ["policy.methodology", "policy.privacy", "policy.guidance", "policy.publication"]));
}

export type PublicCatalogueFilters = { query?: string; category?: string; methodology?: string; tag?: string };

/** Published fields only. Private source questions, editorial notes, and contact details never join this query. */
export async function searchPublishedFatwas(filters: PublicCatalogueFilters) {
  const db = await getDb();
  if (!db) return [];
  const query = filters.query?.trim();
  const conditions = [eq(fatwaRecords.status, "published")];
  if (filters.category) conditions.push(eq(fatwaCategories.slug, filters.category));
  if (filters.methodology) conditions.push(eq(fiqhMethodologies.slug, filters.methodology));
  if (filters.tag) conditions.push(sql`CAST(${fatwaRecords.tags} AS CHAR) LIKE ${`%${filters.tag}%`}`);
  if (query) {
    const needle = `%${query}%`;
    conditions.push(or(like(fatwaRecords.referenceNumber, needle), like(fatwaRecords.titleEn, needle), like(fatwaRecords.titleUr, needle), like(fatwaRecords.summaryEn, needle), like(fatwaRecords.summaryUr, needle), like(fatwaCategories.nameEn, needle), like(fatwaCategories.nameUr, needle), like(fiqhMethodologies.nameEn, needle), like(fiqhMethodologies.nameUr, needle), sql`CAST(${fatwaRecords.tags} AS CHAR) LIKE ${needle}`)!);
  }
  return db.select({
    id: fatwaRecords.id, slug: fatwaRecords.slug, referenceNumber: fatwaRecords.referenceNumber, titleEn: fatwaRecords.titleEn, titleUr: fatwaRecords.titleUr,
    summaryEn: fatwaRecords.summaryEn, summaryUr: fatwaRecords.summaryUr, tags: fatwaRecords.tags, publicPdfUrl: fatwaRecords.publicPdfUrl, publishedAt: fatwaRecords.publishedAt,
    categorySlug: fatwaCategories.slug, categoryEn: fatwaCategories.nameEn, categoryUr: fatwaCategories.nameUr,
    methodologySlug: fiqhMethodologies.slug, methodologyEn: fiqhMethodologies.nameEn, methodologyUr: fiqhMethodologies.nameUr,
  }).from(fatwaRecords).leftJoin(fatwaCategories, eq(fatwaRecords.categoryId, fatwaCategories.id)).leftJoin(fiqhMethodologies, eq(fatwaRecords.methodologyId, fiqhMethodologies.id))
    .where(and(...conditions)).orderBy(desc(fatwaRecords.publishedAt), desc(fatwaRecords.id)).limit(100);
}

/** Public record view deliberately selects only publication-safe fields and never joins the private source question. */
export async function getPublishedFatwaBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    id: fatwaRecords.id, slug: fatwaRecords.slug, referenceNumber: fatwaRecords.referenceNumber,
    titleEn: fatwaRecords.titleEn, titleUr: fatwaRecords.titleUr, titleAr: fatwaRecords.titleAr,
    summaryEn: fatwaRecords.summaryEn, summaryUr: fatwaRecords.summaryUr, summaryAr: fatwaRecords.summaryAr,
    bodyEn: fatwaRecords.bodyEn, bodyUr: fatwaRecords.bodyUr, bodyAr: fatwaRecords.bodyAr,
    tags: fatwaRecords.tags, publicPdfUrl: fatwaRecords.publicPdfUrl, publishedAt: fatwaRecords.publishedAt,
    categoryEn: fatwaCategories.nameEn, categoryUr: fatwaCategories.nameUr,
    methodologyEn: fiqhMethodologies.nameEn, methodologyUr: fiqhMethodologies.nameUr,
  }).from(fatwaRecords).leftJoin(fatwaCategories, eq(fatwaRecords.categoryId, fatwaCategories.id)).leftJoin(fiqhMethodologies, eq(fatwaRecords.methodologyId, fiqhMethodologies.id))
    .where(and(eq(fatwaRecords.slug, slug), eq(fatwaRecords.status, "published"))).limit(1);
  return rows[0] ?? null;
}

export async function getPublicCatalogueTaxonomy() {
  const db = await getDb();
  if (!db) return { categories: [], methodologies: [] };
  const [categories, methodologies] = await Promise.all([
    db.select({ slug: fatwaCategories.slug, nameEn: fatwaCategories.nameEn, nameUr: fatwaCategories.nameUr, nameAr: fatwaCategories.nameAr }).from(fatwaCategories).where(eq(fatwaCategories.isActive, true)).orderBy(fatwaCategories.sortOrder),
    db.select({ slug: fiqhMethodologies.slug, nameEn: fiqhMethodologies.nameEn, nameUr: fiqhMethodologies.nameUr, nameAr: fiqhMethodologies.nameAr }).from(fiqhMethodologies).where(eq(fiqhMethodologies.isActive, true)).orderBy(fiqhMethodologies.nameEn),
  ]);
  return { categories, methodologies };
}
