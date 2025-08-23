CREATE TABLE `matchmaking_queue` (
	`version` text NOT NULL,
	`address` text NOT NULL,
	`family` text NOT NULL,
	`port` integer NOT NULL,
	`region` text NOT NULL,
	`expires_in` integer DEFAULT (strftime('%s','now')+15) NOT NULL,
	PRIMARY KEY(`version`, `address`, `family`, `port`)
);
