CREATE TABLE `chat_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(255) NOT NULL,
	`visitorEmail` varchar(320),
	`visitorName` varchar(255),
	`visitorPhone` varchar(20),
	`leadQualified` boolean NOT NULL DEFAULT false,
	`leadScore` int NOT NULL DEFAULT 0,
	`serviceInterest` varchar(255),
	`projectBudget` varchar(100),
	`projectTimeline` varchar(100),
	`routedToAdmin` boolean NOT NULL DEFAULT false,
	`assignedAdminId` int,
	`routingReason` text,
	`status` enum('active','closed','routed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `chat_visitor_idx` ON `chat_conversations` (`visitorId`);--> statement-breakpoint
CREATE INDEX `chat_status_idx` ON `chat_conversations` (`status`);--> statement-breakpoint
CREATE INDEX `chat_email_idx` ON `chat_conversations` (`visitorEmail`);--> statement-breakpoint
CREATE INDEX `chat_message_conversation_idx` ON `chat_messages` (`conversationId`);