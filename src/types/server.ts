import * as z from "zod";

// Not implemented server packets (data is string for all of these):
// - private_lobby_request ({ ip: string; port: number })
// - private_lobby_free_confirmation

export const serverPacket = z.union([
	z.object({
		type: z.enum([
			"incorrect_version",
			"private_lobby_reserve_confirmation",
			"private_lobby_code_taken",
			"private_lobby_found",
			"private_lobby_not_found",
			"private_lobby_is_self",
			"random_matchmaking_confirmation",
			"random_matchmaking_cancel_confirmation",
			"holepunching_found",
			"holepunching_confirmation",
		]),
		data: z.string(),
	}),
	z.object({
		type: z.literal("random_matchmaking_found"),
		data: z.number().int(),
	}),
]);

export type ServerPacket = z.infer<typeof serverPacket>;
