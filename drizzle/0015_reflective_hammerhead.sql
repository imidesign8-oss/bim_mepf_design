CREATE TABLE `report_generation_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('mep','bim') NOT NULL,
	`projectType` enum('residential','commercial','industrial','hospitality','mixed-use') NOT NULL,
	`cityId` int NOT NULL,
	`stateId` int NOT NULL,
	`lodLevel` varchar(10),
	`buildingArea` decimal(12,2),
	`estimatedCost` decimal(14,2),
	`userEmail` varchar(255),
	`emailShared` boolean NOT NULL DEFAULT false,
	`downloadedAsPdf` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_generation_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `report_generation_analytics` ADD CONSTRAINT `report_generation_analytics_cityId_mep_cities_id_fk` FOREIGN KEY (`cityId`) REFERENCES `mep_cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_generation_analytics` ADD CONSTRAINT `report_generation_analytics_stateId_mep_states_id_fk` FOREIGN KEY (`stateId`) REFERENCES `mep_states`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `analytics_report_type_idx` ON `report_generation_analytics` (`reportType`);--> statement-breakpoint
CREATE INDEX `analytics_city_idx` ON `report_generation_analytics` (`cityId`);--> statement-breakpoint
CREATE INDEX `analytics_state_idx` ON `report_generation_analytics` (`stateId`);--> statement-breakpoint
CREATE INDEX `analytics_lod_idx` ON `report_generation_analytics` (`lodLevel`);--> statement-breakpoint
CREATE INDEX `analytics_created_idx` ON `report_generation_analytics` (`createdAt`);--> statement-breakpoint
CREATE INDEX `analytics_email_idx` ON `report_generation_analytics` (`userEmail`);