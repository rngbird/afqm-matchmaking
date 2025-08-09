import * as z from "zod";
import { REGIONS } from "$utils/env";

export const clientPacket = z
	.object({
		version: z.string().min(1).max(32),
		keys: z.object({
			random_matchmaking: z.string().min(0).max(256),
			private_lobby: z.string().min(0).max(256),
		}),
	})
	.and(
		z.union([
			z.object({
				type: z.enum(["random_matchmaking_begin", "random_matchmaking_cancel"]),
				data: z.enum(REGIONS),
			}),
			z.object({
				type: z.enum(["private_lobby_reserve", "private_lobby_find"]),
				data: z
					.string()
					.min(0)
					.max(8)
					.regex(/^(?:[A-Z0-9 ]+)?$/),
			}),
			z.object({
				type: z.literal("holepunching_begin"),
				data: z.number().int().min(0),
			}),
		]),
	);

export type ClientPacket = z.infer<typeof clientPacket>;
