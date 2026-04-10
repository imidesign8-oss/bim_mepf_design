CREATE TABLE `crm_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crmType` enum('hubspot','pipedrive','salesforce') NOT NULL,
	`apiKey` text NOT NULL,
	`accountId` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`syncEnabled` boolean NOT NULL DEFAULT true,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`crmIntegrationId` int NOT NULL,
	`contactId` int,
	`action` enum('create','update','delete','sync') NOT NULL,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`externalId` varchar(255),
	`errorMessage` text,
	`requestPayload` longtext,
	`responsePayload` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_routing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`assignedToUserId` int,
	`routingReason` varchar(255),
	`crmContactId` varchar(255),
	`crmDealId` varchar(255),
	`syncStatus` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`syncError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_routing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`totalScore` int NOT NULL,
	`qualification` enum('cold','warm','hot','qualified') NOT NULL,
	`projectType` varchar(100),
	`projectSize` varchar(50),
	`estimatedBudget` varchar(50),
	`timeline` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_scoring_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`criterion` varchar(100) NOT NULL,
	`weight` int NOT NULL,
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_scoring_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `lead_scoring_rules_criterion_unique` UNIQUE(`criterion`)
);
--> statement-breakpoint
CREATE INDEX `crm_sync_log_integration_idx` ON `crm_sync_logs` (`crmIntegrationId`);--> statement-breakpoint
CREATE INDEX `crm_sync_log_contact_idx` ON `crm_sync_logs` (`contactId`);--> statement-breakpoint
CREATE INDEX `crm_sync_log_status_idx` ON `crm_sync_logs` (`status`);--> statement-breakpoint
CREATE INDEX `lead_routing_contact_idx` ON `lead_routing` (`contactId`);--> statement-breakpoint
CREATE INDEX `lead_routing_assigned_idx` ON `lead_routing` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `lead_routing_sync_idx` ON `lead_routing` (`syncStatus`);--> statement-breakpoint
CREATE INDEX `lead_score_contact_idx` ON `lead_scores` (`contactId`);--> statement-breakpoint
CREATE INDEX `lead_score_qualification_idx` ON `lead_scores` (`qualification`);