CREATE TABLE `page_metadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageSlug` varchar(255) NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`ogTitle` varchar(255),
	`ogDescription` varchar(255),
	`ogImage` text,
	`ogImageAlt` varchar(255),
	`twitterCard` varchar(50) DEFAULT 'summary_large_image',
	`twitterImage` text,
	`canonicalUrl` text,
	`keywords` text,
	`robots` varchar(100) DEFAULT 'index, follow',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_metadata_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_metadata_pageSlug_unique` UNIQUE(`pageSlug`)
);
--> statement-breakpoint
CREATE INDEX `page_metadata_slug_idx` ON `page_metadata` (`pageSlug`);