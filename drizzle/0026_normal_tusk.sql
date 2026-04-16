ALTER TABLE `quote_requests` MODIFY COLUMN `proposalPdfUrl` text;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `proposalFileName` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `sentDate` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `viewedDate` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `acceptedDate` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `rejectedDate` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `rejectionReason` longtext;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `lastEmailSentAt` timestamp;