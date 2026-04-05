CREATE TABLE `bim_estimates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`estimateCode` varchar(50) NOT NULL,
	`projectName` varchar(255),
	`projectType` enum('residential','commercial','industrial','hospitality','mixed-use') NOT NULL,
	`buildingArea` decimal(12,2) NOT NULL,
	`areaUnit` enum('sqft','sqm') NOT NULL DEFAULT 'sqft',
	`cityId` int NOT NULL,
	`lodLevel` enum('100','200','300','400','500') NOT NULL,
	`buildingComplexity` enum('simple','moderate','complex') NOT NULL DEFAULT 'moderate',
	`projectCost` decimal(14,2) NOT NULL,
	`baseBimCost` decimal(14,2) NOT NULL,
	`adjustedBimCost` decimal(14,2) NOT NULL,
	`userEmail` varchar(255),
	`userName` varchar(255),
	`emailSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bim_estimates_id` PRIMARY KEY(`id`),
	CONSTRAINT `bim_estimates_estimateCode_unique` UNIQUE(`estimateCode`)
);
--> statement-breakpoint
CREATE TABLE `bim_lod_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityId` int NOT NULL,
	`lodLevel` enum('100','200','300','400','500') NOT NULL,
	`bimPercentageResidential` decimal(5,2) NOT NULL,
	`bimPercentageCommercial` decimal(5,2) NOT NULL,
	`bimPercentageIndustrial` decimal(5,2) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bim_lod_pricing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mep_cost_range` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectType` enum('residential','commercial','industrial','hospitality','mixed-use') NOT NULL,
	`minPercentage` decimal(5,2) NOT NULL,
	`maxPercentage` decimal(5,2) NOT NULL,
	`defaultPercentage` decimal(5,2) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_cost_range_id` PRIMARY KEY(`id`),
	CONSTRAINT `mep_cost_range_projectType_unique` UNIQUE(`projectType`)
);
--> statement-breakpoint
CREATE TABLE `mep_discipline_weightage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discipline` enum('electrical','plumbing','hvac','fire-system') NOT NULL,
	`weightagePercentage` decimal(5,2) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_discipline_weightage_id` PRIMARY KEY(`id`),
	CONSTRAINT `mep_discipline_weightage_discipline_unique` UNIQUE(`discipline`)
);
--> statement-breakpoint
ALTER TABLE `bim_estimates` ADD CONSTRAINT `bim_estimates_cityId_mep_cities_id_fk` FOREIGN KEY (`cityId`) REFERENCES `mep_cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bim_lod_pricing` ADD CONSTRAINT `bim_lod_pricing_cityId_mep_cities_id_fk` FOREIGN KEY (`cityId`) REFERENCES `mep_cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bim_estimate_code_idx` ON `bim_estimates` (`estimateCode`);--> statement-breakpoint
CREATE INDEX `bim_estimate_city_idx` ON `bim_estimates` (`cityId`);--> statement-breakpoint
CREATE INDEX `bim_estimate_email_idx` ON `bim_estimates` (`userEmail`);--> statement-breakpoint
CREATE INDEX `bim_estimate_created_idx` ON `bim_estimates` (`createdAt`);--> statement-breakpoint
CREATE INDEX `bim_lod_city_idx` ON `bim_lod_pricing` (`cityId`,`lodLevel`);--> statement-breakpoint
CREATE INDEX `bim_lod_idx` ON `bim_lod_pricing` (`lodLevel`);--> statement-breakpoint
CREATE INDEX `mep_cost_range_type_idx` ON `mep_cost_range` (`projectType`);--> statement-breakpoint
CREATE INDEX `mep_weightage_discipline_idx` ON `mep_discipline_weightage` (`discipline`);