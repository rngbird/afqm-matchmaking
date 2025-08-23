import { parseCronExpression } from "cron-schedule";
import { TimerBasedCronScheduler as scheduler } from "cron-schedule/schedulers/timer-based.js";
import { sql } from "drizzle-orm";
import { db } from "$connectors/sqlite";
import { matchmakingQueue } from "$connectors/sqlite/schema";

// On start up and every minute, delete every expired table
scheduler.setInterval(parseCronExpression("* * * * *"), deleteExpiredTables);
deleteExpiredTables();

async function deleteExpiredTables() {
	db.run(
		sql`DELETE FROM ${matchmakingQueue} WHERE expires_in < strftime('%s','now')`,
	);
}
