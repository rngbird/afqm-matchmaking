import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { PG_URL } from "$utils/env";
import * as schema from "./schema";

export const pool = new Pool({ connectionString: PG_URL });
export const db = drizzle(pool, { schema });
