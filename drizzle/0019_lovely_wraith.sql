CREATE TABLE `seo_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pagePath` varchar(255) NOT NULL,
	`score` int NOT NULL,
	`issues` longtext,
	`recommendations` longtext,
	`auditedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seo_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `seo_audit_page_idx` ON `seo_audits` (`pagePath`);--> statement-breakpoint
CREATE INDEX `seo_audit_date_idx` ON `seo_audits` (`auditedAt`);