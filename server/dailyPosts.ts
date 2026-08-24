import { and, asc, count, desc, eq, isNotNull, like, lte, ne, or, sql } from "drizzle-orm";
import { dailyPostCategories, dailyPosts, type InsertDailyPost, type InsertDailyPostCategory } from "../drizzle/schema";
import { getDb } from "./db";

export type DailyPostStatus = "draft" | "published" | "unpublished";
export type DailyPostSort = "newest" | "oldest";

const defaultCategories: Array<InsertDailyPostCategory> = [
  { slug: "islamic-reminder", nameEn: "Islamic Reminder", nameUr: "اسلامی یاددہانی", nameAr: "تذكرة إسلامية", sortOrder: 10, isActive: true },
  { slug: "fatwa", nameEn: "Fatwa", nameUr: "فتویٰ", nameAr: "فتوى", sortOrder: 20, isActive: true },
  { slug: "quran", nameEn: "Quran", nameUr: "قرآن", nameAr: "القرآن", sortOrder: 30, isActive: true },
  { slug: "hadith", nameEn: "Hadith", nameUr: "حدیث", nameAr: "حديث", sortOrder: 40, isActive: true },
  { slug: "islamic-knowledge", nameEn: "Islamic Knowledge", nameUr: "اسلامی معلومات", nameAr: "المعرفة الإسلامية", sortOrder: 50, isActive: true },
  { slug: "important-announcement", nameEn: "Important Announcement", nameUr: "اہم اعلان", nameAr: "إعلان مهم", sortOrder: 60, isActive: true },
  { slug: "other", nameEn: "Other", nameUr: "دیگر", nameAr: "أخرى", sortOrder: 70, isActive: true },
];

const postFields = {
  id: dailyPosts.id,
  slug: dailyPosts.slug,
  status: dailyPosts.status,
  categoryId: dailyPosts.categoryId,
  authorName: dailyPosts.authorName,
  titleEn: dailyPosts.titleEn,
  titleUr: dailyPosts.titleUr,
  titleAr: dailyPosts.titleAr,
  excerptEn: dailyPosts.excerptEn,
  excerptUr: dailyPosts.excerptUr,
  excerptAr: dailyPosts.excerptAr,
  contentEn: dailyPosts.contentEn,
  contentUr: dailyPosts.contentUr,
  contentAr: dailyPosts.contentAr,
  featuredImageStorageKey: dailyPosts.featuredImageStorageKey,
  featuredImageUrl: dailyPosts.featuredImageUrl,
  featuredImageAltEn: dailyPosts.featuredImageAltEn,
  featuredImageAltUr: dailyPosts.featuredImageAltUr,
  featuredImageAltAr: dailyPosts.featuredImageAltAr,
  attachmentStorageKey: dailyPosts.attachmentStorageKey,
  attachmentUrl: dailyPosts.attachmentUrl,
  attachmentName: dailyPosts.attachmentName,
  attachmentMimeType: dailyPosts.attachmentMimeType,
  seoDescriptionEn: dailyPosts.seoDescriptionEn,
  seoDescriptionUr: dailyPosts.seoDescriptionUr,
  seoDescriptionAr: dailyPosts.seoDescriptionAr,
  scheduledAt: dailyPosts.scheduledAt,
  publishedAt: dailyPosts.publishedAt,
  createdAt: dailyPosts.createdAt,
  updatedAt: dailyPosts.updatedAt,
};

const categoryFields = {
  categoryRecordId: dailyPostCategories.id,
  categorySlug: dailyPostCategories.slug,
  categoryNameEn: dailyPostCategories.nameEn,
  categoryNameUr: dailyPostCategories.nameUr,
  categoryNameAr: dailyPostCategories.nameAr,
};

function asPublicPost(row: Record<string, unknown>) {
  const { categoryRecordId, categorySlug, categoryNameEn, categoryNameUr, categoryNameAr, ...post } = row;
  return {
    ...post,
    category: categoryRecordId ? { id: categoryRecordId, slug: categorySlug, nameEn: categoryNameEn, nameUr: categoryNameUr, nameAr: categoryNameAr } : null,
  };
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : undefined;
}

function optionalString(value: unknown, maxLength: number): string | null | undefined {
  if (value === null || value === "") return null;
  return cleanString(value, maxLength);
}

function optionalStorageUrl(value: unknown) {
  const parsed = optionalString(value, 512);
  if (parsed === null) return null;
  return parsed?.startsWith("/manus-storage/") ? parsed : undefined;
}

function parseId(value: unknown) {
  if (value === null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function parseDate(value: unknown) {
  if (value === null || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseStatus(value: unknown): DailyPostStatus | undefined {
  return value === "draft" || value === "published" || value === "unpublished" ? value : undefined;
}

export function slugifyDailyPost(value: string) {
  const slug = value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
  return slug || `daily-post-${Date.now().toString(36)}`;
}

export function parseDailyPostInput(body: unknown, partial = false): Partial<InsertDailyPost> | undefined {
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
  const data = body as Record<string, unknown>;
  const output: Partial<InsertDailyPost> = {};
  const titles = ["titleEn", "titleUr", "titleAr"] as const;
  const excerpts = ["excerptEn", "excerptUr", "excerptAr"] as const;
  const content = ["contentEn", "contentUr", "contentAr"] as const;
  const imageAlts = ["featuredImageAltEn", "featuredImageAltUr", "featuredImageAltAr"] as const;
  const seo = ["seoDescriptionEn", "seoDescriptionUr", "seoDescriptionAr"] as const;
  for (const field of titles) if (field in data) { const value = optionalString(data[field], 300); if (value !== undefined) output[field] = value; }
  for (const field of excerpts) if (field in data) { const value = optionalString(data[field], 12_000); if (value !== undefined) output[field] = value; }
  for (const field of content) if (field in data) { const value = optionalString(data[field], 60_000); if (value !== undefined) output[field] = value; }
  for (const field of imageAlts) if (field in data) { const value = optionalString(data[field], 300); if (value !== undefined) output[field] = value; }
  for (const field of seo) if (field in data) { const value = optionalString(data[field], 320); if (value !== undefined) output[field] = value; }
  for (const field of ["authorName", "attachmentName", "attachmentMimeType"] as const) {
    if (field in data) { const value = optionalString(data[field], field === "attachmentName" ? 255 : 180); if (value !== undefined) output[field] = value; }
  }
  for (const field of ["featuredImageStorageKey", "attachmentStorageKey"] as const) {
    if (field in data) { const value = optionalString(data[field], 512); if (value !== undefined) output[field] = value; }
  }
  for (const field of ["featuredImageUrl", "attachmentUrl"] as const) {
    if (field in data) { const value = optionalStorageUrl(data[field]); if (value !== undefined) output[field] = value; }
  }
  if ("categoryId" in data) { const value = parseId(data.categoryId); if (value !== undefined) output.categoryId = value; }
  if ("scheduledAt" in data) { const value = parseDate(data.scheduledAt); if (value !== undefined) output.scheduledAt = value; }
  if ("status" in data) { const value = parseStatus(data.status); if (value) output.status = value; }
  if ("slug" in data) { const value = cleanString(data.slug, 160); if (value) output.slug = slugifyDailyPost(value); }
  if (!partial) {
    const hasTitle = titles.some(field => typeof output[field] === "string");
    const hasContent = content.some(field => typeof output[field] === "string");
    if (!hasTitle || !hasContent) return undefined;
    if (!output.slug) output.slug = slugifyDailyPost(String(output.titleEn || output.titleUr || output.titleAr));
  }
  return Object.keys(output).length ? output : undefined;
}

export function parseDailyPostCategoryInput(body: unknown, partial = false): Partial<InsertDailyPostCategory> | undefined {
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
  const data = body as Record<string, unknown>;
  const output: Partial<InsertDailyPostCategory> = {};
  if ("slug" in data) { const value = cleanString(data.slug, 96); if (value) output.slug = slugifyDailyPost(value).slice(0, 96); }
  if ("nameEn" in data) { const value = cleanString(data.nameEn, 160); if (value) output.nameEn = value; }
  for (const field of ["nameUr", "nameAr"] as const) if (field in data) { const value = optionalString(data[field], 160); if (value !== undefined) output[field] = value as never; }
  for (const field of ["descriptionEn", "descriptionUr", "descriptionAr"] as const) if (field in data) { const value = optionalString(data[field], 3_000); if (value !== undefined) output[field] = value; }
  if ("sortOrder" in data) { const value = Number(data.sortOrder); if (Number.isInteger(value) && value >= 0 && value <= 10_000) output.sortOrder = value; }
  if (typeof data.isActive === "boolean") output.isActive = data.isActive;
  if (!partial && (!output.slug || !output.nameEn)) return undefined;
  return Object.keys(output).length ? output : undefined;
}

export async function publishDueDailyPosts(now = new Date()) {
  const db = getDb();
  await db.update(dailyPosts).set({
    status: "published",
    publishedAt: sql`coalesce(${dailyPosts.publishedAt}, ${dailyPosts.scheduledAt})`,
  }).where(and(eq(dailyPosts.status, "draft"), isNotNull(dailyPosts.scheduledAt), lte(dailyPosts.scheduledAt, now)));
}

export async function ensureDailyPostCategories() {
  const db = getDb();
  const existing = await db.select({ total: count() }).from(dailyPostCategories);
  if ((existing[0]?.total || 0) > 0) return;
  for (const category of defaultCategories) {
    await db.insert(dailyPostCategories).values(category).onDuplicateKeyUpdate({ set: { nameEn: category.nameEn } });
  }
}

function publicVisibility(now = new Date()) {
  return and(eq(dailyPosts.status, "published"), isNotNull(dailyPosts.publishedAt), lte(dailyPosts.publishedAt, now));
}

export async function listPublicDailyPosts(input: { page?: number; pageSize?: number; query?: string; category?: string; sort?: DailyPostSort } = {}) {
  const now = new Date();
  await publishDueDailyPosts(now);
  const page = Math.max(1, Math.floor(input.page || 1));
  const pageSize = Math.min(24, Math.max(6, Math.floor(input.pageSize || 9)));
  const term = input.query?.trim();
  const conditions = [publicVisibility(now)];
  if (term) {
    const wildcard = `%${term}%`;
    conditions.push(or(like(dailyPosts.titleEn, wildcard), like(dailyPosts.titleUr, wildcard), like(dailyPosts.titleAr, wildcard), like(dailyPosts.excerptEn, wildcard), like(dailyPosts.excerptUr, wildcard), like(dailyPosts.excerptAr, wildcard), like(dailyPosts.contentEn, wildcard), like(dailyPosts.contentUr, wildcard), like(dailyPosts.contentAr, wildcard)));
  }
  if (input.category) conditions.push(eq(dailyPostCategories.slug, input.category));
  const condition = and(...conditions);
  const order = input.sort === "oldest" ? asc(dailyPosts.publishedAt) : desc(dailyPosts.publishedAt);
  const db = getDb();
  const [rows, totalRows] = await Promise.all([
    db.select({ ...postFields, ...categoryFields }).from(dailyPosts).leftJoin(dailyPostCategories, eq(dailyPosts.categoryId, dailyPostCategories.id)).where(condition).orderBy(order, desc(dailyPosts.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(dailyPosts).leftJoin(dailyPostCategories, eq(dailyPosts.categoryId, dailyPostCategories.id)).where(condition),
  ]);
  return { items: rows.map(row => asPublicPost(row as Record<string, unknown>)), page, pageSize, total: totalRows[0]?.total || 0 };
}

export async function getPublicDailyPost(slug: string) {
  const now = new Date();
  await publishDueDailyPosts(now);
  const db = getDb();
  const [row] = await db.select({ ...postFields, ...categoryFields }).from(dailyPosts).leftJoin(dailyPostCategories, eq(dailyPosts.categoryId, dailyPostCategories.id)).where(and(eq(dailyPosts.slug, slug), publicVisibility(now))).limit(1);
  return row ? asPublicPost(row as Record<string, unknown>) : undefined;
}

export async function listRelatedPublicDailyPosts(post: { id: number; categoryId: number | null }) {
  if (!post.categoryId) return [];
  const now = new Date();
  const rows = await getDb().select({ ...postFields, ...categoryFields }).from(dailyPosts).leftJoin(dailyPostCategories, eq(dailyPosts.categoryId, dailyPostCategories.id)).where(and(publicVisibility(now), eq(dailyPosts.categoryId, post.categoryId), ne(dailyPosts.id, post.id))).orderBy(desc(dailyPosts.publishedAt)).limit(3);
  return rows.map(row => asPublicPost(row as Record<string, unknown>));
}

export async function listPublicDailyPostCategories() {
  await ensureDailyPostCategories();
  return getDb().select().from(dailyPostCategories).where(eq(dailyPostCategories.isActive, true)).orderBy(asc(dailyPostCategories.sortOrder), asc(dailyPostCategories.nameEn));
}

export async function listAdminDailyPosts(input: { query?: string; status?: DailyPostStatus; categoryId?: number; sort?: DailyPostSort } = {}) {
  const term = input.query?.trim();
  const conditions = [];
  if (term) { const wildcard = `%${term}%`; conditions.push(or(like(dailyPosts.titleEn, wildcard), like(dailyPosts.titleUr, wildcard), like(dailyPosts.titleAr, wildcard), like(dailyPosts.contentEn, wildcard), like(dailyPosts.contentUr, wildcard), like(dailyPosts.contentAr, wildcard))); }
  if (input.status) conditions.push(eq(dailyPosts.status, input.status));
  if (input.categoryId) conditions.push(eq(dailyPosts.categoryId, input.categoryId));
  const query = getDb().select({ ...postFields, ...categoryFields }).from(dailyPosts).leftJoin(dailyPostCategories, eq(dailyPosts.categoryId, dailyPostCategories.id));
  const filtered = conditions.length ? query.where(and(...conditions)) : query;
  const rows = await filtered.orderBy(input.sort === "oldest" ? asc(dailyPosts.createdAt) : desc(dailyPosts.createdAt));
  return rows.map(row => asPublicPost(row as Record<string, unknown>));
}

export async function getAdminDailyPost(id: number) {
  const [post] = await getDb().select().from(dailyPosts).where(eq(dailyPosts.id, id)).limit(1);
  return post;
}

export async function createDailyPost(input: InsertDailyPost) {
  const now = new Date();
  const values: InsertDailyPost = { ...input };
  if (values.scheduledAt && values.scheduledAt > now) {
    values.status = "draft";
    values.publishedAt = null;
  } else if (values.status === "published") {
    values.scheduledAt = null;
    values.publishedAt = now;
  }
  const result = await getDb().insert(dailyPosts).values(values).$returningId();
  return getAdminDailyPost(result[0]!.id);
}

export async function updateDailyPost(id: number, input: Partial<InsertDailyPost>) {
  const existing = await getAdminDailyPost(id);
  if (!existing) return undefined;
  const now = new Date();
  const values: Partial<InsertDailyPost> = { ...input };
  if (values.scheduledAt && values.scheduledAt > now) {
    values.status = "draft";
    values.publishedAt = null;
  } else if (values.status === "published") {
    values.scheduledAt = null;
    values.publishedAt = now;
  } else if (values.status === "unpublished") {
    values.scheduledAt = null;
  }
  await getDb().update(dailyPosts).set(values).where(eq(dailyPosts.id, id));
  return getAdminDailyPost(id);
}

export async function deleteDailyPost(id: number) {
  await getDb().delete(dailyPosts).where(eq(dailyPosts.id, id));
}

export async function duplicateDailyPost(id: number) {
  const source = await getAdminDailyPost(id);
  if (!source) return undefined;
  const copy: InsertDailyPost = {
    ...source,
    id: undefined,
    slug: `${source.slug}-copy-${Date.now().toString(36)}`.slice(0, 160),
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    createdAt: undefined,
    updatedAt: undefined,
  };
  const result = await getDb().insert(dailyPosts).values(copy).$returningId();
  return getAdminDailyPost(result[0]!.id);
}

export async function listAdminDailyPostCategories() {
  await ensureDailyPostCategories();
  return getDb().select().from(dailyPostCategories).orderBy(asc(dailyPostCategories.sortOrder), asc(dailyPostCategories.nameEn));
}

export async function createDailyPostCategory(input: InsertDailyPostCategory) {
  const result = await getDb().insert(dailyPostCategories).values(input).$returningId();
  const [category] = await getDb().select().from(dailyPostCategories).where(eq(dailyPostCategories.id, result[0]!.id)).limit(1);
  return category;
}

export async function updateDailyPostCategory(id: number, input: Partial<InsertDailyPostCategory>) {
  await getDb().update(dailyPostCategories).set(input).where(eq(dailyPostCategories.id, id));
  const [category] = await getDb().select().from(dailyPostCategories).where(eq(dailyPostCategories.id, id)).limit(1);
  return category;
}

export async function deleteDailyPostCategory(id: number) {
  await getDb().delete(dailyPostCategories).where(eq(dailyPostCategories.id, id));
}
