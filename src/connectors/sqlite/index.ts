import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { SQLITE_FILE } from "$utils/env";
import * as schema from "./schema";

export const sqlite = new Database(SQLITE_FILE);
export const db = drizzle(sqlite, { schema });
