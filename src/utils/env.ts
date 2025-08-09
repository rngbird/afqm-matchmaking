export const { PG_URL, FORCE_VERSION } = process.env;
export const PORT = Number.parseInt(process.env.PORT);
export const REGIONS = process.env.REGIONS?.split(",") || ["REGION_NAME"];

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			PG_URL: string;
			REGIONS: string;
			FORCE_VERSION?: string;
		}
	}
}
