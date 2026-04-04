CREATE TABLE `email_bounces` (
	`id` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`bounceType` enum('permanent','temporary','complaint') NOT NULL,
	`reason` text,
	`bounceCount` int NOT NULL DEFAULT 1,
	`lastBounceAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_bounces_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_bounces_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `email_bounce_email_idx` ON `email_bounces` (`email`);--> statement-breakpoint
CREATE INDEX `email_bounce_type_idx` ON `email_bounces` (`bounceType`);--> statement-breakpoint
CREATE INDEX `email_bounce_last_bounce_idx` ON `email_bounces` (`lastBounceAt`);