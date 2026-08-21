import { asc, eq } from "drizzle-orm";
import { scholars, type InsertScholar } from "../drizzle/schema";
import { getDb } from "./db";

export type ScholarInput = Omit<InsertScholar, "id" | "createdAt" | "updatedAt">;

export async function listPublishedScholars() {
  return getDb()
    .select()
    .from(scholars)
    .where(eq(scholars.isPublished, true))
    .orderBy(asc(scholars.nameEn));
}

export async function listAllScholars() {
  return getDb().select().from(scholars).orderBy(asc(scholars.nameEn));
}

export async function getPublishedScholar(slug: string) {
  const [scholar] = await getDb()
    .select()
    .from(scholars)
    .where(eq(scholars.slug, slug))
    .limit(1);
  return scholar?.isPublished ? scholar : undefined;
}

export async function getScholarById(id: number) {
  const [scholar] = await getDb().select().from(scholars).where(eq(scholars.id, id)).limit(1);
  return scholar;
}

export async function createScholar(input: ScholarInput) {
  const result = await getDb().insert(scholars).values(input).$returningId();
  return getScholarById(result[0].id);
}

export async function updateScholar(id: number, input: Partial<ScholarInput>) {
  await getDb().update(scholars).set(input).where(eq(scholars.id, id));
  return getScholarById(id);
}

export async function deleteScholar(id: number) {
  await getDb().delete(scholars).where(eq(scholars.id, id));
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength
    ? value.trim()
    : undefined;
}

function optionalText(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === "") return null;
  return text(value, maxLength);
}

function localizedList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { en: string; ur: string } => Boolean(item) && typeof item === "object" && text((item as { en?: unknown }).en, 800) !== undefined && text((item as { ur?: unknown }).ur, 800) !== undefined)
    .map(item => ({ en: item.en.trim(), ur: item.ur.trim() }));
}

export function parseScholarInput(body: unknown, partial = false): Partial<ScholarInput> | undefined {
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
  const data = body as Record<string, unknown>;
  const slug = text(data.slug, 120);
  const nameEn = text(data.nameEn, 180);
  const nameUr = text(data.nameUr, 180);

  if (!partial && (!slug || !nameEn || !nameUr)) return undefined;

  const output: Partial<ScholarInput> = {};
  if (slug) output.slug = slug;
  if (nameEn) output.nameEn = nameEn;
  if (nameUr) output.nameUr = nameUr;

  const textFields: Array<[keyof ScholarInput, number]> = [
    ["titleEn", 180], ["titleUr", 180], ["organizationEn", 240], ["organizationUr", 240],
    ["shortIntroductionEn", 5000], ["shortIntroductionUr", 5000], ["introductionEn", 16000], ["introductionUr", 16000],
    ["educationalBackgroundEn", 12000], ["educationalBackgroundUr", 12000], ["additionalInformationEn", 16000], ["additionalInformationUr", 16000],
    ["contactEmail", 320], ["contactPhone", 48],
  ];

  for (const [field, maxLength] of textFields) {
    if (field in data) output[field] = optionalText(data[field], maxLength) as never;
  }

  for (const field of ["islamicQualifications", "areasOfExpertise", "responsibilities", "services", "socialLinks"] as const) {
    if (field in data) output[field] = localizedList(data[field]) as never;
  }

  if (typeof data.isPublished === "boolean") output.isPublished = data.isPublished;
  return output;
}
