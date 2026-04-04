CREATE TABLE `case_studies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` longtext NOT NULL,
	`shortDescription` varchar(500),
	`serviceCategory` enum('BIM','MEPF','Quantities & Estimation') NOT NULL,
	`clientName` varchar(255),
	`projectName` varchar(255),
	`location` varchar(255),
	`completionDate` varchar(50),
	`budget` varchar(100),
	`featuredImage` text,
	`galleryImages` longtext,
	`challenge` longtext,
	`solution` longtext,
	`results` longtext,
	`relatedProjectId` int,
	`published` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`metaKeywords` text,
	`canonicalUrl` text,
	`ogImage` text,
	`ogTitle` varchar(255),
	`ogDescription` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `case_studies_id` PRIMARY KEY(`id`),
	CONSTRAINT `case_studies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `case_study_slug_idx` ON `case_studies` (`slug`);--> statement-breakpoint
CREATE INDEX `case_study_category_idx` ON `case_studies` (`serviceCategory`);--> statement-breakpoint
CREATE INDEX `case_study_published_idx` ON `case_studies` (`published`);