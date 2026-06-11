CREATE TABLE `brewing_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`beanId` int NOT NULL,
	`userId` int NOT NULL,
	`brewDate` timestamp NOT NULL,
	`brewMethod` varchar(100),
	`waterTemperature` int,
	`grindSize` varchar(100),
	`coffeeAmount` decimal(5,2),
	`waterAmount` decimal(5,2),
	`brewTime` int,
	`tasteRating` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brewing_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coffee_beans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`origin` varchar(255),
	`processingMethod` varchar(100),
	`roastLevel` varchar(50),
	`purchaseDate` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coffee_beans_id` PRIMARY KEY(`id`)
);
