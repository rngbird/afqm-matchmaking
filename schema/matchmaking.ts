import {
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

export const matchmakingQueue = pgTable(
	"matchmaking_queue",
	{
		version: text("version").notNull(),
		address: text("address").notNull(),
		family: text("family").notNull().$type<"IPv4" | "IPv6">(),
		port: integer("port").notNull(),
		region: text("region").notNull(),
		expiresIn: timestamp("expires_in", { mode: "date" })
			.notNull()
			.default(sql`now() + interval '15 seconds'`), // expires in 15 seconds
	},
	(table) => [
		primaryKey({
			columns: [table.version, table.address, table.family, table.port],
		}),
	],
);
