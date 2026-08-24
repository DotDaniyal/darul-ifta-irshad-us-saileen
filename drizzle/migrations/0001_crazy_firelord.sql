CREATE TABLE `dailyPostCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`nameUr` varchar(160),
	`nameAr` varchar(160),
	`descriptionEn` text,
	`descriptionUr` text,
	`descriptionAr` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyPostCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `dailyPostCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `dailyPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`status` enum('draft','published','unpublished') NOT NULL DEFAULT 'draft',
	`categoryId` int,
	`authorName` varchar(180),
	`titleEn` varchar(300),
	`titleUr` varchar(300),
	`titleAr` varchar(300),
	`excerptEn` text,
	`excerptUr` text,
	`excerptAr` text,
	`contentEn` text,
	`contentUr` text,
	`contentAr` text,
	`featuredImageStorageKey` varchar(512),
	`featuredImageUrl` varchar(512),
	`featuredImageAltEn` varchar(300),
	`featuredImageAltUr` varchar(300),
	`featuredImageAltAr` varchar(300),
	`attachmentStorageKey` varchar(512),
	`attachmentUrl` varchar(512),
	`attachmentName` varchar(255),
	`attachmentMimeType` varchar(120),
	`seoDescriptionEn` varchar(320),
	`seoDescriptionUr` varchar(320),
	`seoDescriptionAr` varchar(320),
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`createdById` int,
	`updatedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `dailyPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD CONSTRAINT `dailyPosts_categoryId_dailyPostCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `dailyPostCategories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD CONSTRAINT `dailyPosts_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD CONSTRAINT `dailyPosts_updatedById_users_id_fk` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `daily_post_categories_active_sort_idx` ON `dailyPostCategories` (`isActive`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `daily_posts_publication_idx` ON `dailyPosts` (`status`,`scheduledAt`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `daily_posts_category_publication_idx` ON `dailyPosts` (`categoryId`,`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `daily_posts_created_idx` ON `dailyPosts` (`createdAt`);