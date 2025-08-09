import { DISPLAY_VERSION, PORT, REGIONS } from "$utils/env";

const server = Bun.serve({
	port: PORT,
	fetch() {
		return Response.json({
			latest_version: DISPLAY_VERSION,
			regions: REGIONS,
		});
	},
});

console.info(`HTTP server running at http://localhost:${server.port}`);
