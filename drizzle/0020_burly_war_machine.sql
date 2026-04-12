CREATE TABLE `internal_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourcePagePath` varchar(255) NOT NULL,
	`targetPagePath` varchar(255) NOT NULL,
	`anchorText` varchar(255) NOT NULL,
	`linkType` enum('contextual','related','navigation','footer') NOT NULL DEFAULT 'contextual',
	`keywordTarget` varchar(255),
	`position` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keyword_density` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pagePath` varchar(255) NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`density` decimal(5,2),
	`count` int,
	`wordCount` int,
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `keyword_density_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`category` varchar(100),
	`searchVolume` int,
	`difficulty` int,
	`relatedPages` longtext,
	`targetPosition` int,
	`currentPosition` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `keywords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `internal_link_source_idx` ON `internal_links` (`sourcePagePath`);--> statement-breakpoint
CREATE INDEX `internal_link_target_idx` ON `internal_links` (`targetPagePath`);--> statement-breakpoint
CREATE INDEX `internal_link_type_idx` ON `internal_links` (`linkType`);--> statement-breakpoint
CREATE INDEX `keyword_density_page_keyword_idx` ON `keyword_density` (`pagePath`,`keyword`);--> statement-breakpoint
CREATE INDEX `keyword_density_page_idx` ON `keyword_density` (`pagePath`);--> statement-breakpoint
CREATE INDEX `keyword_idx` ON `keywords` (`keyword`);--> statement-breakpoint
CREATE INDEX `keyword_category_idx` ON `keywords` (`category`);