CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`emailType` varchar(50) NOT NULL,
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`smtpHost` varchar(255) NOT NULL,
	`smtpPort` int NOT NULL,
	`smtpUser` varchar(255) NOT NULL,
	`smtpPassword` text NOT NULL,
	`fromEmail` varchar(320) NOT NULL,
	`fromName` varchar(255) NOT NULL,
	`replyTo` varchar(320),
	`enableTLS` boolean NOT NULL DEFAULT true,
	`enableSSL` boolean NOT NULL DEFAULT false,
	`notifyOnContactSubmission` boolean NOT NULL DEFAULT true,
	`notifyOnHighScoreLead` boolean NOT NULL DEFAULT true,
	`highScoreThreshold` int NOT NULL DEFAULT 80,
	`notificationEmails` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `email_log_status_idx` ON `email_logs` (`status`);--> statement-breakpoint
CREATE INDEX `email_log_type_idx` ON `email_logs` (`emailType`);--> statement-breakpoint
CREATE INDEX `email_log_recipient_idx` ON `email_logs` (`recipientEmail`);