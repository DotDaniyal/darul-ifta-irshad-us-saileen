CREATE TABLE `dailyPostImports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyPostId` int,
	`initiatedById` int,
	`source` enum('whatsapp_channel') NOT NULL DEFAULT 'whatsapp_channel',
	`sourcePostId` varchar(255) NOT NULL,
	`sourceMediaIdentifier` varchar(255),
	`originalPostUrl` varchar(512),
	`sourcePublishedAt` timestamp,
	`status` enum('imported','duplicate','failed') NOT NULL,
	`errorMessage` varchar(500),
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyPostImports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappChannelImportSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelUrl` varchar(512) NOT NULL,
	`importMode` enum('manual_only') NOT NULL DEFAULT 'manual_only',
	`autoPublish` boolean NOT NULL DEFAULT true,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`lastImportAt` timestamp,
	`importedPostsCount` int NOT NULL DEFAULT 0,
	`failedImportsCount` int NOT NULL DEFAULT 0,
	`lastFailureMessage` varchar(500),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappChannelImportSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `source` enum('manual','whatsapp_channel') DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `sourcePostId` varchar(255);--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `sourceMediaIdentifier` varchar(255);--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `originalPostUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `sourceCaption` text;--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `sourcePublishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD `importedAt` timestamp;--> statement-breakpoint
ALTER TABLE `dailyPosts` ADD CONSTRAINT `daily_posts_source_post_unique` UNIQUE(`source`,`sourcePostId`);--> statement-breakpoint
ALTER TABLE `dailyPostImports` ADD CONSTRAINT `dailyPostImports_dailyPostId_dailyPosts_id_fk` FOREIGN KEY (`dailyPostId`) REFERENCES `dailyPosts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyPostImports` ADD CONSTRAINT `dailyPostImports_initiatedById_users_id_fk` FOREIGN KEY (`initiatedById`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `daily_post_imports_source_reference_idx` ON `dailyPostImports` (`source`,`sourcePostId`);--> statement-breakpoint
CREATE INDEX `daily_post_imports_status_time_idx` ON `dailyPostImports` (`status`,`importedAt`);--> statement-breakpoint
CREATE INDEX `daily_posts_source_publication_idx` ON `dailyPosts` (`source`,`sourcePublishedAt`);