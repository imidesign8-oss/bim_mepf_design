CREATE TABLE `mep_estimate_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`estimateId` int NOT NULL,
	`userId` int NOT NULL,
	`projectName` varchar(255),
	`projectNotes` longtext,
	`selectedDisciplines` varchar(500),
	`disciplineCosts` longtext,
	`totalCost` decimal(14,2) NOT NULL,
	`isCompared` boolean NOT NULL DEFAULT false,
	`comparedWithEstimateIds` varchar(500),
	`emailSent` boolean NOT NULL DEFAULT false,
	`emailSentAt` timestamp,
	`emailRecipient` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_estimate_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mep_estimate_history` ADD CONSTRAINT `mep_estimate_history_estimateId_mep_estimates_id_fk` FOREIGN KEY (`estimateId`) REFERENCES `mep_estimates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mep_estimate_history` ADD CONSTRAINT `mep_estimate_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `mep_history_user_idx` ON `mep_estimate_history` (`userId`);--> statement-breakpoint
CREATE INDEX `mep_history_estimate_idx` ON `mep_estimate_history` (`estimateId`);--> statement-breakpoint
CREATE INDEX `mep_history_created_idx` ON `mep_estimate_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `mep_history_email_idx` ON `mep_estimate_history` (`emailSent`);