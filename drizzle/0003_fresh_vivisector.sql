CREATE TABLE `seo_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageType` enum('home','about','services','projects','blog','contact','global') NOT NULL,
	`pageSlug` varchar(255),
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`metaKeywords` text,
	`ogTitle` varchar(255),
	`ogDescription` varchar(255),
	`ogImage` text,
	`ogType` varchar(50),
	`twitterTitle` varchar(255),
	`twitterDescription` varchar(255),
	`twitterImage` text,
	`structuredData` longtext,
	`customHeadCode` longtext,
	`customBodyCode` longtext,
	`robotsIndex` boolean NOT NULL DEFAULT true,
	`robotsFollow` boolean NOT NULL DEFAULT true,
	`canonicalUrl` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seo_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `seo_page_type_idx` ON `seo_settings` (`pageType`);--> statement-breakpoint
CREATE INDEX `seo_page_slug_idx` ON `seo_settings` (`pageSlug`);