import { sql } from "drizzle-orm/sql";
import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const matchmakingQueue = sqliteTable(
	"matchmaking_queue",
	{
		version: text("version").notNull(),
		address: text("address").notNull(),
		family: text("family").notNull().$type<"IPv4" | "IPv6">(),
		port: integer("port").notNull(),
		region: text("region").notNull(),
		expiresIn: integer("expires_in", { mode: "timestamp" })
			.notNull()
			.default(sql`(strftime('%s','now')+15)`),
	},
	(table) => [
		primaryKey({
			columns: [table.version, table.address, table.family, table.port],
		}),
	],
);
