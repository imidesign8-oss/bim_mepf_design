CREATE TABLE `client_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectCode` varchar(50) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`projectDescription` longtext,
	`clientId` int NOT NULL,
	`projectType` enum('residential','commercial','industrial','hospitality','mixed-use') NOT NULL,
	`buildingArea` decimal(12,2),
	`location` varchar(255),
	`startDate` timestamp,
	`endDate` timestamp,
	`currentPhase` enum('concept','dd','cd','construction','as-built') NOT NULL DEFAULT 'concept',
	`status` enum('active','completed','on-hold','cancelled') NOT NULL DEFAULT 'active',
	`portalAccessToken` varchar(255),
	`portalAccessEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_projects_projectCode_unique` UNIQUE(`projectCode`),
	CONSTRAINT `client_projects_portalAccessToken_unique` UNIQUE(`portalAccessToken`)
);
--> statement-breakpoint
CREATE TABLE `project_deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`deliverableName` varchar(255) NOT NULL,
	`description` longtext,
	`deliverableType` enum('bim-model','drawing','specification','report','schedule','other') NOT NULL,
	`fileUrl` text,
	`fileName` varchar(255),
	`fileSize` int,
	`fileType` varchar(50),
	`status` enum('pending','in-progress','ready','delivered') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp,
	`deliveredDate` timestamp,
	`visibleToClient` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`milestoneName` varchar(255) NOT NULL,
	`description` longtext,
	`phase` enum('concept','dd','cd','construction','as-built') NOT NULL,
	`plannedDate` timestamp,
	`completedDate` timestamp,
	`status` enum('pending','in-progress','completed','delayed') NOT NULL DEFAULT 'pending',
	`completionPercentage` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_pricing_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`description` longtext,
	`basePrice` decimal(14,2) NOT NULL,
	`pricePerSqft` decimal(10,2),
	`simpleMultiplier` decimal(5,2) NOT NULL DEFAULT 1,
	`moderateMultiplier` decimal(5,2) NOT NULL DEFAULT 1.2,
	`complexMultiplier` decimal(5,2) NOT NULL DEFAULT 1.5,
	`standardTimelineMultiplier` decimal(5,2) NOT NULL DEFAULT 1,
	`fastTrackMultiplier` decimal(5,2) NOT NULL DEFAULT 1.3,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_pricing_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteCode` varchar(50) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(20),
	`clientCompany` varchar(255),
	`questionnaireResponses` longtext NOT NULL,
	`quoteAmount` decimal(14,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'INR',
	`quoteValidityDays` int NOT NULL DEFAULT 30,
	`quoteValidUntil` timestamp,
	`proposalPdfUrl` text,
	`proposalFileName` varchar(255),
	`status` enum('generated','sent','viewed','accepted','rejected','expired') NOT NULL DEFAULT 'generated',
	`sentDate` timestamp,
	`viewedDate` timestamp,
	`acceptedDate` timestamp,
	`rejectedDate` timestamp,
	`rejectionReason` longtext,
	`emailsSent` int NOT NULL DEFAULT 0,
	`lastEmailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_requests_quoteCode_unique` UNIQUE(`quoteCode`)
);
--> statement-breakpoint
ALTER TABLE `client_projects` ADD CONSTRAINT `client_projects_clientId_contacts_id_fk` FOREIGN KEY (`clientId`) REFERENCES `contacts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_deliverables` ADD CONSTRAINT `project_deliverables_projectId_client_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `client_projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `project_milestones` ADD CONSTRAINT `project_milestones_projectId_client_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `client_projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `project_code_idx` ON `client_projects` (`projectCode`);--> statement-breakpoint
CREATE INDEX `project_client_idx` ON `client_projects` (`clientId`);--> statement-breakpoint
CREATE INDEX `project_status_idx` ON `client_projects` (`status`);--> statement-breakpoint
CREATE INDEX `deliverable_project_idx` ON `project_deliverables` (`projectId`);--> statement-breakpoint
CREATE INDEX `deliverable_status_idx` ON `project_deliverables` (`status`);--> statement-breakpoint
CREATE INDEX `deliverable_type_idx` ON `project_deliverables` (`deliverableType`);--> statement-breakpoint
CREATE INDEX `milestone_project_idx` ON `project_milestones` (`projectId`);--> statement-breakpoint
CREATE INDEX `milestone_status_idx` ON `project_milestones` (`status`);--> statement-breakpoint
CREATE INDEX `quote_code_idx` ON `quote_requests` (`quoteCode`);--> statement-breakpoint
CREATE INDEX `quote_email_idx` ON `quote_requests` (`clientEmail`);--> statement-breakpoint
CREATE INDEX `quote_status_idx` ON `quote_requests` (`status`);--> statement-breakpoint
CREATE INDEX `quote_created_idx` ON `quote_requests` (`createdAt`);