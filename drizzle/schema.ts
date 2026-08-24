import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "scholar", "reviewer", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Public scholar records are editorially managed separately from login identities. Portrait fields are intentionally omitted. */
export const scholars = mysqlTable("scholars", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  nameUr: varchar("nameUr", { length: 180 }).notNull(),
  titleEn: varchar("titleEn", { length: 180 }),
  titleUr: varchar("titleUr", { length: 180 }),
  organizationEn: varchar("organizationEn", { length: 240 }),
  organizationUr: varchar("organizationUr", { length: 240 }),
  shortIntroductionEn: text("shortIntroductionEn"),
  shortIntroductionUr: text("shortIntroductionUr"),
  introductionEn: text("introductionEn"),
  introductionUr: text("introductionUr"),
  educationalBackgroundEn: text("educationalBackgroundEn"),
  educationalBackgroundUr: text("educationalBackgroundUr"),
  islamicQualifications: json("islamicQualifications"),
  areasOfExpertise: json("areasOfExpertise"),
  responsibilities: json("responsibilities"),
  services: json("services"),
  additionalInformationEn: text("additionalInformationEn"),
  additionalInformationUr: text("additionalInformationUr"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 48 }),
  socialLinks: json("socialLinks"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("scholars_published_idx").on(table.isPublished)]);

export type Scholar = typeof scholars.$inferSelect;
export type InsertScholar = typeof scholars.$inferInsert;

/** Structured public taxonomy. Categories are administratively managed rather than hard-coded in forms. */
export const fatwaCategories = mysqlTable("fatwaCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  nameUr: varchar("nameUr", { length: 160 }),
  nameAr: varchar("nameAr", { length: 160 }),
  descriptionEn: text("descriptionEn"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** A configurable school or methodology label applied to Fatwas and private requests. */
export const fiqhMethodologies = mysqlTable("fiqhMethodologies", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  nameUr: varchar("nameUr", { length: 160 }),
  nameAr: varchar("nameAr", { length: 160 }),
  methodologyStatement: text("methodologyStatement"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Verified scholar profile information, published only after administrative approval. */
export const scholarProfiles = mysqlTable("scholarProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  honorific: varchar("honorific", { length: 80 }),
  displayNameEn: varchar("displayNameEn", { length: 180 }),
  displayNameUr: varchar("displayNameUr", { length: 180 }),
  displayNameAr: varchar("displayNameAr", { length: 180 }),
  biographyEn: text("biographyEn"),
  biographyUr: text("biographyUr"),
  biographyAr: text("biographyAr"),
  qualifications: json("qualifications"),
  scholarlyLineage: text("scholarlyLineage"),
  portraitStorageKey: varchar("portraitStorageKey", { length: 512 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("scholar_profiles_user_unique").on(table.userId)]);

/** Confidential public intake. Personally identifying fields remain private and are never returned by public procedures. */
export const questionSubmissions = mysqlTable("questionSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  referenceCode: varchar("referenceCode", { length: 32 }).notNull().unique(),
  /** Hash of the one-time tracking secret shown only to the requester after submission. */
  trackingSecretHash: varchar("trackingSecretHash", { length: 128 }).notNull(),
  submittedById: int("submittedById").references(() => users.id, { onDelete: "set null" }),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  requesterName: varchar("requesterName", { length: 180 }),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  requesterPhone: varchar("requesterPhone", { length: 48 }),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ur", "ar"]).default("ur").notNull(),
  categoryId: int("categoryId").references(() => fatwaCategories.id, { onDelete: "set null" }),
  methodologyId: int("methodologyId").references(() => fiqhMethodologies.id, { onDelete: "set null" }),
  subject: varchar("subject", { length: 240 }).notNull(),
  questionBody: text("questionBody").notNull(),
  status: mysqlEnum("status", ["received", "triaged", "in_review", "clarification_needed", "answered", "closed", "withdrawn"]).default("received").notNull(),
  sensitivity: mysqlEnum("sensitivity", ["standard", "private", "restricted"]).default("private").notNull(),
  assignedScholarId: int("assignedScholarId").references(() => users.id, { onDelete: "set null" }),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("question_submissions_status_idx").on(table.status),
  index("question_submissions_assigned_scholar_idx").on(table.assignedScholarId),
  index("question_submissions_category_idx").on(table.categoryId),
  index("question_submissions_tracking_idx").on(table.referenceCode, table.trackingSecretHash),
]);

/** S3-only private file metadata for a question; raw bytes are never stored in the database. */
export const questionAttachments = mysqlTable("questionAttachments", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull().references(() => questionSubmissions.id, { onDelete: "cascade" }),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  byteSize: int("byteSize").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
}, table => [index("question_attachments_question_idx").on(table.questionId)]);

/** Controlled scholarly work product. Public fields are available only after an approved publication state. */
export const fatwaRecords = mysqlTable("fatwaRecords", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  referenceNumber: varchar("referenceNumber", { length: 48 }).notNull().unique(),
  sourceQuestionId: int("sourceQuestionId").references(() => questionSubmissions.id, { onDelete: "set null" }),
  categoryId: int("categoryId").references(() => fatwaCategories.id, { onDelete: "set null" }),
  methodologyId: int("methodologyId").references(() => fiqhMethodologies.id, { onDelete: "set null" }),
  authorId: int("authorId").notNull().references(() => users.id, { onDelete: "restrict" }),
  approverId: int("approverId").references(() => users.id, { onDelete: "set null" }),
  status: mysqlEnum("status", ["draft", "research", "review", "approved", "published", "archived"]).default("draft").notNull(),
  titleEn: varchar("titleEn", { length: 300 }),
  titleUr: varchar("titleUr", { length: 300 }),
  titleAr: varchar("titleAr", { length: 300 }),
  summaryEn: text("summaryEn"),
  summaryUr: text("summaryUr"),
  summaryAr: text("summaryAr"),
  bodyEn: text("bodyEn"),
  bodyUr: text("bodyUr"),
  bodyAr: text("bodyAr"),
  tags: json("tags"),
  publicPdfUrl: varchar("publicPdfUrl", { length: 512 }),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("fatwa_records_status_published_idx").on(table.status, table.publishedAt),
  index("fatwa_records_category_idx").on(table.categoryId),
]);

/** Immutable editorial history for scholarly accountability and recovery. */
export const fatwaRevisions = mysqlTable("fatwaRevisions", {
  id: int("id").autoincrement().primaryKey(),
  fatwaId: int("fatwaId").notNull().references(() => fatwaRecords.id, { onDelete: "cascade" }),
  revisionNumber: int("revisionNumber").notNull(),
  editorId: int("editorId").notNull().references(() => users.id, { onDelete: "restrict" }),
  changeSummary: varchar("changeSummary", { length: 500 }).notNull(),
  snapshot: json("snapshot").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("fatwa_revisions_unique_revision").on(table.fatwaId, table.revisionNumber)]);

/** Private scholar and reviewer notes. These are never exposed from public Fatwa routes. */
export const questionNotes = mysqlTable("questionNotes", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull().references(() => questionSubmissions.id, { onDelete: "cascade" }),
  authorId: int("authorId").notNull().references(() => users.id, { onDelete: "restrict" }),
  body: text("body").notNull(),
  visibility: mysqlEnum("visibility", ["internal", "requester"]).default("internal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("question_notes_question_idx").on(table.questionId)]);

/** Append-only operational history for sensitive actions, approvals, and publication events. */
export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").references(() => users.id, { onDelete: "set null" }),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: varchar("entityId", { length: 96 }).notNull(),
  action: varchar("action", { length: 96 }).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("audit_events_entity_idx").on(table.entityType, table.entityId),
  index("audit_events_actor_idx").on(table.actorId),
]);

/** Site-wide policy and methodology content, revised only through administration. */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  value: json("value").notNull(),
  updatedById: int("updatedById").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Editorially managed taxonomy for Daily Posts. Labels support the website's English, Urdu, and Arabic reading contexts. */
export const dailyPostCategories = mysqlTable("dailyPostCategories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 160 }).notNull(),
  nameUr: varchar("nameUr", { length: 160 }),
  nameAr: varchar("nameAr", { length: 160 }),
  descriptionEn: text("descriptionEn"),
  descriptionUr: text("descriptionUr"),
  descriptionAr: text("descriptionAr"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("daily_post_categories_active_sort_idx").on(table.isActive, table.sortOrder)]);

/**
 * Public editorial posts. A future `scheduledAt` remains non-public until due;
 * server-side release queries promote it to `published` atomically before public output.
 */
export const dailyPosts = mysqlTable("dailyPosts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "published", "unpublished"]).default("draft").notNull(),
  source: mysqlEnum("source", ["manual", "whatsapp_channel"]).default("manual").notNull(),
  sourcePostId: varchar("sourcePostId", { length: 255 }),
  sourceMediaIdentifier: varchar("sourceMediaIdentifier", { length: 255 }),
  originalPostUrl: varchar("originalPostUrl", { length: 512 }),
  sourceCaption: text("sourceCaption"),
  sourcePublishedAt: timestamp("sourcePublishedAt"),
  importedAt: timestamp("importedAt"),
  categoryId: int("categoryId").references(() => dailyPostCategories.id, { onDelete: "set null" }),
  authorName: varchar("authorName", { length: 180 }),
  titleEn: varchar("titleEn", { length: 300 }),
  titleUr: varchar("titleUr", { length: 300 }),
  titleAr: varchar("titleAr", { length: 300 }),
  excerptEn: text("excerptEn"),
  excerptUr: text("excerptUr"),
  excerptAr: text("excerptAr"),
  contentEn: text("contentEn"),
  contentUr: text("contentUr"),
  contentAr: text("contentAr"),
  featuredImageStorageKey: varchar("featuredImageStorageKey", { length: 512 }),
  featuredImageUrl: varchar("featuredImageUrl", { length: 512 }),
  featuredImageAltEn: varchar("featuredImageAltEn", { length: 300 }),
  featuredImageAltUr: varchar("featuredImageAltUr", { length: 300 }),
  featuredImageAltAr: varchar("featuredImageAltAr", { length: 300 }),
  attachmentStorageKey: varchar("attachmentStorageKey", { length: 512 }),
  attachmentUrl: varchar("attachmentUrl", { length: 512 }),
  attachmentName: varchar("attachmentName", { length: 255 }),
  attachmentMimeType: varchar("attachmentMimeType", { length: 120 }),
  seoDescriptionEn: varchar("seoDescriptionEn", { length: 320 }),
  seoDescriptionUr: varchar("seoDescriptionUr", { length: 320 }),
  seoDescriptionAr: varchar("seoDescriptionAr", { length: 320 }),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  createdById: int("createdById").references(() => users.id, { onDelete: "set null" }),
  updatedById: int("updatedById").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("daily_posts_publication_idx").on(table.status, table.scheduledAt, table.publishedAt),
  index("daily_posts_category_publication_idx").on(table.categoryId, table.status, table.publishedAt),
  index("daily_posts_created_idx").on(table.createdAt),
  uniqueIndex("daily_posts_source_post_unique").on(table.source, table.sourcePostId),
  index("daily_posts_source_publication_idx").on(table.source, table.sourcePublishedAt),
]);

/** Singleton administrative settings for a policy-compliant WhatsApp Channel import queue. No tokens or credentials are stored here. */
export const whatsappChannelImportSettings = mysqlTable("whatsappChannelImportSettings", {
  id: int("id").autoincrement().primaryKey(),
  channelUrl: varchar("channelUrl", { length: 512 }).notNull(),
  importMode: mysqlEnum("importMode", ["manual_only"]).default("manual_only").notNull(),
  autoPublish: boolean("autoPublish").default(true).notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  lastImportAt: timestamp("lastImportAt"),
  importedPostsCount: int("importedPostsCount").default(0).notNull(),
  failedImportsCount: int("failedImportsCount").default(0).notNull(),
  lastFailureMessage: varchar("lastFailureMessage", { length: 500 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Append-only record of every administrator-triggered import, duplicate skip, or rejected import attempt. */
export const dailyPostImports = mysqlTable("dailyPostImports", {
  id: int("id").autoincrement().primaryKey(),
  dailyPostId: int("dailyPostId").references(() => dailyPosts.id, { onDelete: "set null" }),
  initiatedById: int("initiatedById").references(() => users.id, { onDelete: "set null" }),
  source: mysqlEnum("source", ["whatsapp_channel"]).default("whatsapp_channel").notNull(),
  sourcePostId: varchar("sourcePostId", { length: 255 }).notNull(),
  sourceMediaIdentifier: varchar("sourceMediaIdentifier", { length: 255 }),
  originalPostUrl: varchar("originalPostUrl", { length: 512 }),
  sourcePublishedAt: timestamp("sourcePublishedAt"),
  status: mysqlEnum("status", ["imported", "duplicate", "failed"]).notNull(),
  errorMessage: varchar("errorMessage", { length: 500 }),
  importedAt: timestamp("importedAt").defaultNow().notNull(),
}, table => [
  index("daily_post_imports_source_reference_idx").on(table.source, table.sourcePostId),
  index("daily_post_imports_status_time_idx").on(table.status, table.importedAt),
]);

export type DailyPostCategory = typeof dailyPostCategories.$inferSelect;
export type InsertDailyPostCategory = typeof dailyPostCategories.$inferInsert;
export type DailyPost = typeof dailyPosts.$inferSelect;
export type InsertDailyPost = typeof dailyPosts.$inferInsert;
export type WhatsappChannelImportSettings = typeof whatsappChannelImportSettings.$inferSelect;
export type DailyPostImport = typeof dailyPostImports.$inferSelect;
