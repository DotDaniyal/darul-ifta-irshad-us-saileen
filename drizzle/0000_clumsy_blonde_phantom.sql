CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`entityType` varchar(64) NOT NULL,
	`entityId` varchar(96) NOT NULL,
	`action` varchar(96) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fatwaCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`nameUr` varchar(160),
	`nameAr` varchar(160),
	`descriptionEn` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fatwaCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `fatwaCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `fatwaRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`referenceNumber` varchar(48) NOT NULL,
	`sourceQuestionId` int,
	`categoryId` int,
	`methodologyId` int,
	`authorId` int NOT NULL,
	`approverId` int,
	`status` enum('draft','research','review','approved','published','archived') NOT NULL DEFAULT 'draft',
	`titleEn` varchar(300),
	`titleUr` varchar(300),
	`titleAr` varchar(300),
	`summaryEn` text,
	`summaryUr` text,
	`summaryAr` text,
	`bodyEn` text,
	`bodyUr` text,
	`bodyAr` text,
	`tags` json,
	`publicPdfUrl` varchar(512),
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fatwaRecords_id` PRIMARY KEY(`id`),
	CONSTRAINT `fatwaRecords_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `fatwaRecords_referenceNumber_unique` UNIQUE(`referenceNumber`)
);
--> statement-breakpoint
CREATE TABLE `fatwaRevisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fatwaId` int NOT NULL,
	`revisionNumber` int NOT NULL,
	`editorId` int NOT NULL,
	`changeSummary` varchar(500) NOT NULL,
	`snapshot` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fatwaRevisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `fatwa_revisions_unique_revision` UNIQUE(`fatwaId`,`revisionNumber`)
);
--> statement-breakpoint
CREATE TABLE `fiqhMethodologies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`nameUr` varchar(160),
	`nameAr` varchar(160),
	`methodologyStatement` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fiqhMethodologies_id` PRIMARY KEY(`id`),
	CONSTRAINT `fiqhMethodologies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `questionAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`byteSize` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`authorId` int NOT NULL,
	`body` text NOT NULL,
	`visibility` enum('internal','requester') NOT NULL DEFAULT 'internal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referenceCode` varchar(32) NOT NULL,
	`submittedById` int,
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`requesterName` varchar(180),
	`requesterEmail` varchar(320),
	`requesterPhone` varchar(48),
	`preferredLanguage` enum('en','ur','ar') NOT NULL DEFAULT 'ur',
	`categoryId` int,
	`methodologyId` int,
	`subject` varchar(240) NOT NULL,
	`questionBody` text NOT NULL,
	`status` enum('received','triaged','in_review','clarification_needed','answered','closed','withdrawn') NOT NULL DEFAULT 'received',
	`sensitivity` enum('standard','private','restricted') NOT NULL DEFAULT 'private',
	`assignedScholarId` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionSubmissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `questionSubmissions_referenceCode_unique` UNIQUE(`referenceCode`)
);
--> statement-breakpoint
CREATE TABLE `scholarProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(120) NOT NULL,
	`honorific` varchar(80),
	`displayNameEn` varchar(180),
	`displayNameUr` varchar(180),
	`displayNameAr` varchar(180),
	`biographyEn` text,
	`biographyUr` text,
	`biographyAr` text,
	`qualifications` json,
	`scholarlyLineage` text,
	`portraitStorageKey` varchar(512),
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scholarProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `scholarProfiles_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `scholar_profiles_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(120) NOT NULL,
	`value` json NOT NULL,
	`updatedById` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','scholar','reviewer','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `auditEvents` ADD CONSTRAINT `auditEvents_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRecords` ADD CONSTRAINT `fatwaRecords_sourceQuestionId_questionSubmissions_id_fk` FOREIGN KEY (`sourceQuestionId`) REFERENCES `questionSubmissions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRecords` ADD CONSTRAINT `fatwaRecords_categoryId_fatwaCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `fatwaCategories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRecords` ADD CONSTRAINT `fatwaRecords_methodologyId_fiqhMethodologies_id_fk` FOREIGN KEY (`methodologyId`) REFERENCES `fiqhMethodologies`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRecords` ADD CONSTRAINT `fatwaRecords_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRecords` ADD CONSTRAINT `fatwaRecords_approverId_users_id_fk` FOREIGN KEY (`approverId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRevisions` ADD CONSTRAINT `fatwaRevisions_fatwaId_fatwaRecords_id_fk` FOREIGN KEY (`fatwaId`) REFERENCES `fatwaRecords`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fatwaRevisions` ADD CONSTRAINT `fatwaRevisions_editorId_users_id_fk` FOREIGN KEY (`editorId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionAttachments` ADD CONSTRAINT `questionAttachments_questionId_questionSubmissions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questionSubmissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionNotes` ADD CONSTRAINT `questionNotes_questionId_questionSubmissions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questionSubmissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionNotes` ADD CONSTRAINT `questionNotes_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_submittedById_users_id_fk` FOREIGN KEY (`submittedById`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_categoryId_fatwaCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `fatwaCategories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_methodologyId_fiqhMethodologies_id_fk` FOREIGN KEY (`methodologyId`) REFERENCES `fiqhMethodologies`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questionSubmissions` ADD CONSTRAINT `questionSubmissions_assignedScholarId_users_id_fk` FOREIGN KEY (`assignedScholarId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scholarProfiles` ADD CONSTRAINT `scholarProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `siteSettings` ADD CONSTRAINT `siteSettings_updatedById_users_id_fk` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_events_entity_idx` ON `auditEvents` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `audit_events_actor_idx` ON `auditEvents` (`actorId`);--> statement-breakpoint
CREATE INDEX `fatwa_records_status_published_idx` ON `fatwaRecords` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `fatwa_records_category_idx` ON `fatwaRecords` (`categoryId`);--> statement-breakpoint
CREATE INDEX `question_attachments_question_idx` ON `questionAttachments` (`questionId`);--> statement-breakpoint
CREATE INDEX `question_notes_question_idx` ON `questionNotes` (`questionId`);--> statement-breakpoint
CREATE INDEX `question_submissions_status_idx` ON `questionSubmissions` (`status`);--> statement-breakpoint
CREATE INDEX `question_submissions_assigned_scholar_idx` ON `questionSubmissions` (`assignedScholarId`);--> statement-breakpoint
CREATE INDEX `question_submissions_category_idx` ON `questionSubmissions` (`categoryId`);