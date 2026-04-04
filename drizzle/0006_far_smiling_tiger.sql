CREATE TABLE `campaign_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`recipientId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('pending','sent','failed','bounced') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	`opened` boolean NOT NULL DEFAULT false,
	`openedAt` timestamp,
	`clicked` boolean NOT NULL DEFAULT false,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`templateType` enum('architect','builder','custom') NOT NULL DEFAULT 'custom',
	`status` enum('draft','scheduled','sending','completed','paused') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`totalRecipients` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`failedCount` int NOT NULL DEFAULT 0,
	`openCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`sendAsTest` boolean NOT NULL DEFAULT false,
	`testEmails` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`recipientType` enum('architect','builder','other') NOT NULL,
	`company` varchar(255),
	`phone` varchar(20),
	`city` varchar(100),
	`state` varchar(100),
	`subscribed` boolean NOT NULL DEFAULT true,
	`unsubscribedAt` timestamp,
	`unsubscribeReason` text,
	`lastEmailSentAt` timestamp,
	`totalEmailsReceived` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_recipients_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`submissionCount` int NOT NULL DEFAULT 1,
	`firstSubmissionAt` timestamp NOT NULL DEFAULT (now()),
	`lastSubmissionAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `campaign_recipient_campaign_idx` ON `campaign_recipients` (`campaignId`);--> statement-breakpoint
CREATE INDEX `campaign_recipient_recipient_idx` ON `campaign_recipients` (`recipientId`);--> statement-breakpoint
CREATE INDEX `campaign_recipient_status_idx` ON `campaign_recipients` (`status`);--> statement-breakpoint
CREATE INDEX `campaign_status_idx` ON `email_campaigns` (`status`);--> statement-breakpoint
CREATE INDEX `campaign_created_idx` ON `email_campaigns` (`createdAt`);--> statement-breakpoint
CREATE INDEX `recipient_email_idx` ON `email_recipients` (`email`);--> statement-breakpoint
CREATE INDEX `recipient_type_idx` ON `email_recipients` (`recipientType`);--> statement-breakpoint
CREATE INDEX `recipient_subscribed_idx` ON `email_recipients` (`subscribed`);--> statement-breakpoint
CREATE INDEX `rate_limit_ip_endpoint_idx` ON `rate_limits` (`ipAddress`,`endpoint`);--> statement-breakpoint
CREATE INDEX `rate_limit_last_submission_idx` ON `rate_limits` (`lastSubmissionAt`);