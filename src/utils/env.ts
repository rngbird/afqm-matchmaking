export const PORT = Number.parseInt(process.env.PORT);
export const PG_URL = process.env.PG_URL;
export const REGIONS = process.env.REGIONS?.length
	? process.env.REGIONS.split(",")
	: ["MODDED"];
export const DISPLAY_VERSION = process.env.DISPLAY_VERSION || "0.0.0";
export const ALLOWED_VERSIONS = process.env.ALLOWED_VERSIONS?.length
	? process.env.ALLOWED_VERSIONS.split(",")
	: [];

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			PG_URL: string;
			REGIONS?: string;
			DISPLAY_VERSION?: string;
			ALLOWED_VERSIONS?: string;
		}
	}
}
