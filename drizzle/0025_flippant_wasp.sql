ALTER TABLE `quote_requests` MODIFY COLUMN `proposalPdfUrl` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `proposalFileName` varchar(255) DEFAULT null;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `sentDate` timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `viewedDate` timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `acceptedDate` timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `rejectedDate` timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `rejectionReason` longtext DEFAULT null;--> statement-breakpoint
ALTER TABLE `quote_requests` MODIFY COLUMN `lastEmailSentAt` timestamp DEFAULT null;