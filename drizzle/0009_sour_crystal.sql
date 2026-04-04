CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`unsubscribedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`unsubscribeToken` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_email_unique` UNIQUE(`email`),
	CONSTRAINT `subscriptions_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`)
);
--> statement-breakpoint
CREATE INDEX `subscription_email_idx` ON `subscriptions` (`email`);--> statement-breakpoint
CREATE INDEX `subscription_active_idx` ON `subscriptions` (`isActive`);--> statement-breakpoint
CREATE INDEX `subscription_token_idx` ON `subscriptions` (`unsubscribeToken`);