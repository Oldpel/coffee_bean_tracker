CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(64) NOT NULL UNIQUE,
  `passwordHash` varchar(255) NOT NULL,
  `name` text,
  `email` varchar(320),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  `lastSignedIn` timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS `coffee_beans` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `origin` varchar(255),
  `processingMethod` varchar(100),
  `roastLevel` varchar(50),
  `purchaseDate` timestamp NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE IF NOT EXISTS `brewing_records` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
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
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW()
);