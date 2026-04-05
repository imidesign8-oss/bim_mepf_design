CREATE TABLE `mep_discipline_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cityId` int NOT NULL,
	`discipline` enum('electrical','plumbing','hvac','fire-system') NOT NULL,
	`costResidential` decimal(10,2) NOT NULL,
	`costCommercial` decimal(10,2) NOT NULL,
	`costIndustrial` decimal(10,2) NOT NULL,
	`percentageOfMep` decimal(5,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mep_discipline_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mep_discipline_costs` ADD CONSTRAINT `mep_discipline_costs_cityId_mep_cities_id_fk` FOREIGN KEY (`cityId`) REFERENCES `mep_cities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `mep_discipline_city_idx` ON `mep_discipline_costs` (`cityId`,`discipline`);--> statement-breakpoint
CREATE INDEX `mep_discipline_idx` ON `mep_discipline_costs` (`discipline`);