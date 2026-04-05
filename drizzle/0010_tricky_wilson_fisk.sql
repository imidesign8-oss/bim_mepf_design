CREATE TABLE `mep_cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateId` int NOT NULL,
	`cityName` varchar(100) NOT NULL,
	`tier` enum('Tier-1','Tier-2','Tier-3') NOT NULL,
	`baseCostResidential` decimal(10,2) NOT NULL,
	`baseCostCommercial` decimal(10,2) NOT NULL,
	`baseCostIndustrial` decimal(10,2) NOT NULL,
	`mepPercentageResidential` decimal(5,2) NOT NULL DEFAULT '12.00',
	`mepPercentageCommercial` decimal(5,2) NOT NULL DEFAULT '15.00',
	`mepPercentageIndustrial` decimal(5,2) NOT NULL DEFAULT '13.00',
	`regionalMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00',
	`climateZone` enum('hot-humid','hot-dry','moderate','cold') NOT NULL,
	`climateAdjustment` decimal(5,2) NOT NULL DEFAULT '0.00',
	`laborCostMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mep_component_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`componentType` enum('mechanical','electrical','plumbing','fire-safety','smart-systems') NOT NULL,
	`subComponent` varchar(100) NOT NULL,
	`description` text,
	`costPerUnit` decimal(12,2) NOT NULL,
	`unitType` enum('per-sqft','per-unit','per-room','per-fixture','lump-sum') NOT NULL,
	`lodLevel` enum('100','200','300','350','400','500') NOT NULL,
	`applicableProjectTypes` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_component_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mep_estimates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`estimateCode` varchar(50) NOT NULL,
	`projectName` varchar(255),
	`projectType` enum('residential','commercial','industrial','hospitality','mixed-use') NOT NULL,
	`projectSubType` varchar(100),
	`buildingArea` decimal(12,2) NOT NULL,
	`cityId` int NOT NULL,
	`buildingComplexity` enum('simple','moderate','complex') NOT NULL DEFAULT 'moderate',
	`greenCertification` enum('none','LEED','IGBC') NOT NULL DEFAULT 'none',
	`materialQuality` enum('standard','premium','imported') NOT NULL DEFAULT 'standard',
	`projectTimeline` enum('standard','fast-track','delayed') NOT NULL DEFAULT 'standard',
	`lodLevel` enum('100','200','300','350','400','500') NOT NULL DEFAULT '300',
	`baseMepCost` decimal(14,2) NOT NULL,
	`adjustedMepCost` decimal(14,2) NOT NULL,
	`costPerSqft` decimal(10,2) NOT NULL,
	`accuracyRange` varchar(50) NOT NULL,
	`mechanicalCost` decimal(14,2),
	`electricalCost` decimal(14,2),
	`plumbingCost` decimal(14,2),
	`fireSafetyCost` decimal(14,2),
	`smartSystemsCost` decimal(14,2),
	`appliedAdjustments` longtext,
	`userId` int,
	`userEmail` varchar(320),
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_estimates_id` PRIMARY KEY(`id`),
	CONSTRAINT `mep_estimates_estimateCode_unique` UNIQUE(`estimateCode`)
);
--> statement-breakpoint
CREATE TABLE `mep_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateName` varchar(100) NOT NULL,
	`stateCode` varchar(10) NOT NULL,
	`region` enum('North','South','East','West','Northeast','Central') NOT NULL,
	`baseMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00',
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_states_id` PRIMARY KEY(`id`),
	CONSTRAINT `mep_states_stateName_unique` UNIQUE(`stateName`),
	CONSTRAINT `mep_states_stateCode_unique` UNIQUE(`stateCode`)
);
--> statement-breakpoint
ALTER TABLE `mep_cities` ADD CONSTRAINT `mep_cities_stateId_mep_states_id_fk` FOREIGN KEY (`stateId`) REFERENCES `mep_states`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mep_estimates` ADD CONSTRAINT `mep_estimates_cityId_mep_cities_id_fk` FOREIGN KEY (`cityId`) REFERENCES `mep_cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `mep_city_state_idx` ON `mep_cities` (`stateId`);--> statement-breakpoint
CREATE INDEX `mep_city_name_idx` ON `mep_cities` (`cityName`);--> statement-breakpoint
CREATE INDEX `mep_city_tier_idx` ON `mep_cities` (`tier`);--> statement-breakpoint
CREATE INDEX `mep_component_type_idx` ON `mep_component_costs` (`componentType`);--> statement-breakpoint
CREATE INDEX `mep_component_lod_idx` ON `mep_component_costs` (`lodLevel`);--> statement-breakpoint
CREATE INDEX `mep_estimate_code_idx` ON `mep_estimates` (`estimateCode`);--> statement-breakpoint
CREATE INDEX `mep_estimate_city_idx` ON `mep_estimates` (`cityId`);--> statement-breakpoint
CREATE INDEX `mep_estimate_user_idx` ON `mep_estimates` (`userId`);--> statement-breakpoint
CREATE INDEX `mep_estimate_created_idx` ON `mep_estimates` (`createdAt`);--> statement-breakpoint
CREATE INDEX `mep_state_name_idx` ON `mep_states` (`stateName`);--> statement-breakpoint
CREATE INDEX `mep_region_idx` ON `mep_states` (`region`);