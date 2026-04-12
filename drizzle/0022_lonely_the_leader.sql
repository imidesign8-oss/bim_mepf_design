ALTER TABLE `quote_pricing_rules` MODIFY COLUMN `simpleMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00';--> statement-breakpoint
ALTER TABLE `quote_pricing_rules` MODIFY COLUMN `moderateMultiplier` decimal(5,2) NOT NULL DEFAULT '1.20';--> statement-breakpoint
ALTER TABLE `quote_pricing_rules` MODIFY COLUMN `complexMultiplier` decimal(5,2) NOT NULL DEFAULT '1.50';--> statement-breakpoint
ALTER TABLE `quote_pricing_rules` MODIFY COLUMN `standardTimelineMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00';--> statement-breakpoint
ALTER TABLE `quote_pricing_rules` MODIFY COLUMN `fastTrackMultiplier` decimal(5,2) NOT NULL DEFAULT '1.30';