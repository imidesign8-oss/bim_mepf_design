CREATE TABLE `client_portal_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`tokenName` varchar(255) NOT NULL,
	`description` text,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int NOT NULL,
	`lastUsedAt` timestamp,
	`usageCount` int NOT NULL DEFAULT 0,
	`ipWhitelist` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_portal_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_portal_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `email_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteRequestId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` enum('pending','sent','delivered','bounced','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`openCount` int NOT NULL DEFAULT 0,
	`firstOpenedAt` timestamp,
	`lastOpenedAt` timestamp,
	`downloadCount` int NOT NULL DEFAULT 0,
	`firstDownloadedAt` timestamp,
	`lastDownloadedAt` timestamp,
	`errorMessage` text,
	`errorCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portal_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('deliverable_uploaded','milestone_completed','project_update','message','deadline_approaching') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` longtext NOT NULL,
	`deliverableId` int,
	`milestoneId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portal_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_usage_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` int,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_usage_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `client_portal_tokens` ADD CONSTRAINT `client_portal_tokens_projectId_client_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `client_projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_portal_tokens` ADD CONSTRAINT `client_portal_tokens_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_tracking` ADD CONSTRAINT `email_tracking_quoteRequestId_quote_requests_id_fk` FOREIGN KEY (`quoteRequestId`) REFERENCES `quote_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portal_notifications` ADD CONSTRAINT `portal_notifications_projectId_client_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `client_projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portal_notifications` ADD CONSTRAINT `portal_notifications_deliverableId_project_deliverables_id_fk` FOREIGN KEY (`deliverableId`) REFERENCES `project_deliverables`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portal_notifications` ADD CONSTRAINT `portal_notifications_milestoneId_project_milestones_id_fk` FOREIGN KEY (`milestoneId`) REFERENCES `project_milestones`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `token_usage_analytics` ADD CONSTRAINT `token_usage_analytics_tokenId_client_portal_tokens_id_fk` FOREIGN KEY (`tokenId`) REFERENCES `client_portal_tokens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `token_project_idx` ON `client_portal_tokens` (`projectId`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `client_portal_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `token_active_idx` ON `client_portal_tokens` (`isActive`);--> statement-breakpoint
CREATE INDEX `token_expires_idx` ON `client_portal_tokens` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `email_tracking_quote_idx` ON `email_tracking` (`quoteRequestId`);--> statement-breakpoint
CREATE INDEX `email_tracking_email_idx` ON `email_tracking` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `email_tracking_status_idx` ON `email_tracking` (`status`);--> statement-breakpoint
CREATE INDEX `email_tracking_sent_idx` ON `email_tracking` (`sentAt`);--> statement-breakpoint
CREATE INDEX `notification_project_idx` ON `portal_notifications` (`projectId`);--> statement-breakpoint
CREATE INDEX `notification_type_idx` ON `portal_notifications` (`type`);--> statement-breakpoint
CREATE INDEX `notification_read_idx` ON `portal_notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notification_deliverable_idx` ON `portal_notifications` (`deliverableId`);--> statement-breakpoint
CREATE INDEX `notification_milestone_idx` ON `portal_notifications` (`milestoneId`);--> statement-breakpoint
CREATE INDEX `notification_created_idx` ON `portal_notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `usage_token_idx` ON `token_usage_analytics` (`tokenId`);--> statement-breakpoint
CREATE INDEX `usage_session_idx` ON `token_usage_analytics` (`sessionId`);--> statement-breakpoint
CREATE INDEX `usage_action_idx` ON `token_usage_analytics` (`action`);--> statement-breakpoint
CREATE INDEX `usage_created_idx` ON `token_usage_analytics` (`createdAt`);