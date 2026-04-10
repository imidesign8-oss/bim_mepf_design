CREATE TABLE `lead_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`leadScoreId` int,
	`salesTeamMemberId` int NOT NULL,
	`notificationType` enum('email','slack','sms') NOT NULL DEFAULT 'email',
	`status` enum('pending','sent','failed','bounced') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	`recipientEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`role` varchar(100),
	`specialization` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`notificationPreference` enum('all','qualified_only','hot_and_qualified','none') NOT NULL DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_team_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_team_members_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `lead_notification_contact_idx` ON `lead_notifications` (`contactId`);--> statement-breakpoint
CREATE INDEX `lead_notification_status_idx` ON `lead_notifications` (`status`);--> statement-breakpoint
CREATE INDEX `lead_notification_sales_team_idx` ON `lead_notifications` (`salesTeamMemberId`);--> statement-breakpoint
CREATE INDEX `sales_team_email_idx` ON `sales_team_members` (`email`);--> statement-breakpoint
CREATE INDEX `sales_team_active_idx` ON `sales_team_members` (`isActive`);