CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` longtext NOT NULL,
	`featuredImage` text,
	`author` varchar(255),
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`views` int NOT NULL DEFAULT 0,
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`metaKeywords` text,
	`canonicalUrl` text,
	`ogImage` text,
	`ogTitle` varchar(255),
	`ogDescription` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`companyDescription` text,
	`logo` text,
	`favicon` text,
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`socialLinks` longtext,
	`siteTitle` varchar(255),
	`siteDescription` varchar(255),
	`siteKeywords` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`adminId` int NOT NULL,
	`reply` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`subject` varchar(255) NOT NULL,
	`message` longtext NOT NULL,
	`status` enum('new','read','replied') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(100) NOT NULL,
	`title` varchar(255),
	`content` longtext NOT NULL,
	`image` text,
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`metaKeywords` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_content_pageKey_unique` UNIQUE(`pageKey`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` longtext NOT NULL,
	`shortDescription` varchar(500),
	`featuredImage` text,
	`galleryImages` longtext,
	`client` varchar(255),
	`completionDate` varchar(50),
	`budget` varchar(100),
	`status` enum('completed','ongoing','planned') NOT NULL DEFAULT 'completed',
	`published` boolean NOT NULL DEFAULT true,
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`metaKeywords` text,
	`canonicalUrl` text,
	`ogImage` text,
	`ogTitle` varchar(255),
	`ogDescription` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` longtext NOT NULL,
	`shortDescription` varchar(500),
	`icon` text,
	`image` text,
	`order` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`metaTitle` varchar(255),
	`metaDescription` varchar(255),
	`metaKeywords` text,
	`canonicalUrl` text,
	`ogImage` text,
	`ogTitle` varchar(255),
	`ogDescription` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `slug_idx` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `published_idx` ON `blog_posts` (`published`);--> statement-breakpoint
CREATE INDEX `contact_status_idx` ON `contacts` (`status`);--> statement-breakpoint
CREATE INDEX `contact_email_idx` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `project_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `project_published_idx` ON `projects` (`published`);--> statement-breakpoint
CREATE INDEX `service_slug_idx` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `service_published_idx` ON `services` (`published`);