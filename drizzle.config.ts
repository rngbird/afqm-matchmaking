import { defineConfig } from "drizzle-kit";
import { SQLITE_FILE } from "$utils/env";

export default defineConfig({
	schema: "./schema/**/*",
	dialect: "sqlite",
	dbCredentials: { url: SQLITE_FILE },
});
