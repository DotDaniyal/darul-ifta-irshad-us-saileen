import { count, desc, eq, inArray } from "drizzle-orm";
import { fatwaRecords, questionSubmissions, users } from "../drizzle/schema";
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

