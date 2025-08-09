import { PORT, REGIONS } from "$utils/env";

const server = Bun.serve({
	port: PORT,
	fetch() {
		return Response.json({
			latest_version: "0.0.0",
			regions: REGIONS,
		});
	},
});

console.info(`HTTP server running at http://localhost:${server.port}`);
