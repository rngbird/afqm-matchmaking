import { parseCronExpression } from "cron-schedule";
import { TimerBasedCronScheduler as scheduler } from "cron-schedule/schedulers/timer-based.js";
import { sql } from "drizzle-orm";
import { db } from "$connectors/psql";
import { matchmakingQueue } from "$schema";

// On start up and every minute, delete every expired table
scheduler.setInterval(parseCronExpression("* * * * *"), deleteExpiredTables);
deleteExpiredTables();

async function deleteExpiredTables() {
	await db.execute(
		sql`DELETE FROM ${matchmakingQueue} WHERE expires_in < now()`,
	);
}
