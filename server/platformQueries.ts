import { and, count, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { fatwaCategories, fatwaRecords, fiqhMethodologies, questionSubmissions, users } from "../drizzle/schema";
import { getDb } from "./db";

export async function getMyQuestionSummaries(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: questionSubmissions.id,
      referenceCode: questionSubmissions.referenceCode,
      subject: questionSubmissions.subject,
      status: questionSubmissions.status,
      submittedAt: questionSubmissions.submittedAt,
      updatedAt: questionSubmissions.updatedAt,
    })
    .from(questionSubmissions)
    .where(eq(questionSubmissions.submittedById, userId))
    .orderBy(desc(questionSubmissions.updatedAt))
    .limit(30);
}

export async function getAssignedQuestionSummaries(scholarId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: questionSubmissions.id,
      referenceCode: questionSubmissions.referenceCode,
      preferredLanguage: questionSubmissions.preferredLanguage,
      subject: questionSubmissions.subject,
      questionBody: questionSubmissions.questionBody,
      status: questionSubmissions.status,
      sensitivity: questionSubmissions.sensitivity,
      submittedAt: questionSubmissions.submittedAt,
      updatedAt: questionSubmissions.updatedAt,
    })
    .from(questionSubmissions)
    .where(eq(questionSubmissions.assignedScholarId, scholarId))
    .orderBy(desc(questionSubmissions.updatedAt))
    .limit(30);
}

export async function getFatwaReviewQueue() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: fatwaRecords.id,
      referenceNumber: fatwaRecords.referenceNumber,
      slug: fatwaRecords.slug,
      titleEn: fatwaRecords.titleEn,
      titleUr: fatwaRecords.titleUr,
      status: fatwaRecords.status,
      createdAt: fatwaRecords.createdAt,
      updatedAt: fatwaRecords.updatedAt,
    })
    .from(fatwaRecords)
    .where(eq(fatwaRecords.status, "review"))
    .orderBy(desc(fatwaRecords.updatedAt))
    .limit(30);
}

export async function getPlatformOverview() {
  const db = await getDb();
  if (!db) {
    return { openQuestions: 0, reviewQueue: 0, publishedFatwas: 0, scholars: 0 };
  }

  const [openQuestions, reviewQueue, publishedFatwas, scholars] = await Promise.all([
    db.select({ total: count() }).from(questionSubmissions).where(inArray(questionSubmissions.status, ["received", "triaged", "in_review", "clarification_needed"])),
    db.select({ total: count() }).from(fatwaRecords).where(eq(fatwaRecords.status, "review")),
    db.select({ total: count() }).from(fatwaRecords).where(eq(fatwaRecords.status, "published")),
    db.select({ total: count() }).from(users).where(inArray(users.role, ["scholar", "reviewer", "admin"])),
  ]);

  return {
    openQuestions: Number(openQuestions[0]?.total ?? 0),
    reviewQueue: Number(reviewQueue[0]?.total ?? 0),
    publishedFatwas: Number(publishedFatwas[0]?.total ?? 0),
    scholars: Number(scholars[0]?.total ?? 0),
  };
}

export async function updatePlatformUserRole(userId: number, role: "user" | "scholar" | "reviewer" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  await db.update(users).set({ role }).where(eq(users.id, userId));
  return { userId, role };
}

export type PublicCatalogueFilters = {
  query?: string;
  category?: string;
  methodology?: string;
  tag?: string;
};

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
    conditions.push(or(
      like(fatwaRecords.referenceNumber, needle),
      like(fatwaRecords.titleEn, needle),
      like(fatwaRecords.titleUr, needle),
      like(fatwaRecords.summaryEn, needle),
      like(fatwaRecords.summaryUr, needle),
      like(fatwaCategories.nameEn, needle),
      like(fatwaCategories.nameUr, needle),
      like(fiqhMethodologies.nameEn, needle),
      like(fiqhMethodologies.nameUr, needle),
      sql`CAST(${fatwaRecords.tags} AS CHAR) LIKE ${needle}`,
    )!);
  }

  return db
    .select({
      id: fatwaRecords.id,
      slug: fatwaRecords.slug,
      referenceNumber: fatwaRecords.referenceNumber,
      titleEn: fatwaRecords.titleEn,
      titleUr: fatwaRecords.titleUr,
      summaryEn: fatwaRecords.summaryEn,
      summaryUr: fatwaRecords.summaryUr,
      tags: fatwaRecords.tags,
      publicPdfUrl: fatwaRecords.publicPdfUrl,
      publishedAt: fatwaRecords.publishedAt,
      categorySlug: fatwaCategories.slug,
      categoryEn: fatwaCategories.nameEn,
      categoryUr: fatwaCategories.nameUr,
      methodologySlug: fiqhMethodologies.slug,
      methodologyEn: fiqhMethodologies.nameEn,
      methodologyUr: fiqhMethodologies.nameUr,
    })
    .from(fatwaRecords)
    .leftJoin(fatwaCategories, eq(fatwaRecords.categoryId, fatwaCategories.id))
    .leftJoin(fiqhMethodologies, eq(fatwaRecords.methodologyId, fiqhMethodologies.id))
    .where(and(...conditions))
    .orderBy(desc(fatwaRecords.publishedAt), desc(fatwaRecords.id))
    .limit(100);
}

export async function getPublicCatalogueTaxonomy() {
  const db = await getDb();
  if (!db) return { categories: [], methodologies: [] };

  const [categories, methodologies] = await Promise.all([
    db.select({ slug: fatwaCategories.slug, nameEn: fatwaCategories.nameEn, nameUr: fatwaCategories.nameUr, nameAr: fatwaCategories.nameAr })
      .from(fatwaCategories).where(eq(fatwaCategories.isActive, true)).orderBy(fatwaCategories.sortOrder),
    db.select({ slug: fiqhMethodologies.slug, nameEn: fiqhMethodologies.nameEn, nameUr: fiqhMethodologies.nameUr, nameAr: fiqhMethodologies.nameAr })
      .from(fiqhMethodologies).where(eq(fiqhMethodologies.isActive, true)).orderBy(fiqhMethodologies.nameEn),
  ]);

  return { categories, methodologies };
}
