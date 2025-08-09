import type { RemoteInfo } from "$types/remote";

/**
 * Parse template literals into encodeURIComponent
 * @param strings The strings to provide
 * @param values The values of the template literals
 * @returns The parsed string
 */
export function _(
	strings: TemplateStringsArray,
	...values: (string | number | boolean)[]
): string {
	return strings
		.map(
			(str, i) =>
				str + (i < values.length ? encodeURIComponent(String(values[i])) : ""),
		)
		.join("");
}

/** Check if two remote information share the same address, port and family */
export function compareRemoteInfo(rinfo1: RemoteInfo, rinfo2: RemoteInfo) {
	return (
		rinfo1.address === rinfo2.address &&
		rinfo1.port === rinfo2.port &&
		rinfo1.family === rinfo2.family
	);
}
