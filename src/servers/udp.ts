import dgram from "node:dgram";
import { type ClientPacket, clientPacket } from "$types/client";
import type { ServerPacket } from "$types/server";
import { FORCE_VERSION, PORT } from "$utils/env";
import { lobbies } from "$utils/lobbies";
import { matchmaking } from "$utils/matchmaking";
import { compareRemoteInfo } from "$utils/others";

const server = dgram.createSocket("udp4");

server.on("message", async (msg, rinfo) => {
	try {
		const { version, keys, type, data }: ClientPacket =
			await clientPacket.parseAsync(JSON.parse(msg.toString()));

		if (
			keys.random_matchmaking !== "--" ||
			keys.private_lobby !== "HW3LXPtjvp"
		) {
			// The keys need to be "--" and "HW3LXPtjvp" for any response to be accepted
			// This is done in the official matchmaking server as well
			return;
		}

		if (FORCE_VERSION && version !== FORCE_VERSION) {
			return reply({
				type: "incorrect_version",
				data: "Incorrect version",
			});
		}

		switch (type) {
			case "private_lobby_reserve": {
				// Get the lobby ID set by the client
				const lobbyId = data;

				// Get if a lobby with the given code already exists
				// Additionally, check if the host already owns the lobby ID
				const lobby = await lobbies.get({ version, lobbyId });
				if (lobby && !compareRemoteInfo(rinfo, lobby)) {
					return reply({
						type: "private_lobby_code_taken",
						data: "Room already reserved",
					});
				}

				// If the user is creating a new lobby, check if the host already owns a lobby ID
				// If they do, delete old lobby ID from the database
				if (!lobby) {
					const existingLobbyId = await lobbies.getLobbyByRemote({
						version,
						rinfo,
					});
					if (existingLobbyId && existingLobbyId !== lobbyId) {
						await lobbies.del({ version, lobbyId: existingLobbyId, rinfo });
					}
				}

				// Set the lobby into the database
				await lobbies.create({ version, lobbyId, rinfo });

				// Respond with a success message
				return reply({
					type: "private_lobby_reserve_confirmation",
					data: "Added to the list",
				});
			}
			case "private_lobby_find": {
				// Get the lobby ID the client wants to join
				const lobbyId = data;

				// Check if there's a lobby with the given ID
				const lobby = await lobbies.get({ version, lobbyId });
				if (!lobby) {
					return reply({
						type: "private_lobby_not_found",
						data: "No lobby with the provided code exists",
					});
				}

				// Check if client owns the room
				if (compareRemoteInfo(rinfo, lobby)) {
					return reply({
						type: "private_lobby_is_self",
						data: "You can't join your own lobby",
					});
				}

				// Send the room data information
				return reply({
					type: "private_lobby_found",
					data: JSON.stringify({ ip: lobby.address, port: lobby.port }),
				});
			}
			case "random_matchmaking_begin": {
				// Get the region the user wants to queue in
				const region = data;

				// Check if anyone is available in matchmaking
				const opponent = await matchmaking.available({
					version,
					region,
					rinfo,
				});

				// Add user to matchmaking queue if no opponent was found
				if (!opponent) {
					await matchmaking.queue({ version, region, rinfo });
				}

				// Confirm the user was added to the matchmaking list
				reply({
					type: "random_matchmaking_confirmation",
					data: "Added to the list",
				});

				// If no opponent was found, add user to queue
				if (!opponent) return;

				// Create match and get the match ID
				const matchId = await matchmaking.create({
					rinfos: [opponent, rinfo],
				});

				// Send matchmaking is found to both users
				reply(
					{ type: "random_matchmaking_found", data: matchId },
					{ port: opponent.port, address: opponent.address },
				);
				return reply({ type: "random_matchmaking_found", data: matchId });
			}
			case "random_matchmaking_cancel": {
				// Unqueue from matchmaking
				await matchmaking.unqueue({ version, rinfo });
				return reply({
					type: "random_matchmaking_cancel_confirmation",
					data: "Removed from the list",
				});
			}
			case "holepunching_begin": {
				// Get match ID from user and try to find the match
				const matchId = data;
				const match = await matchmaking.get({ id: matchId });

				// If the match doesn't exist or isn't for that user, return nothing
				if (!match?.rinfos.find((r) => compareRemoteInfo(r, rinfo))) {
					// // This is what the matchmaking server responds if you try to join a match that doesn't actually exist:
					// reply({
					// 	type: "holepunching_confirmation",
					// 	data: "Added to the map",
					// });

					// For now, I'm going to ignore cases like this.
					return;
				}

				// If already accepted, return nothing
				const didNotAlreadyAccept = await matchmaking.accept({
					id: matchId,
					rinfo,
				});
				if (!didNotAlreadyAccept) return;

				// Set the leader and send the rinfo to the user
				const isLeader = compareRemoteInfo(match.rinfos[0], rinfo);
				const opponentRinfo = isLeader ? match.rinfos[1] : match.rinfos[0];
				return reply({
					type: "holepunching_found",
					data: JSON.stringify({
						ip: opponentRinfo.address,
						port: opponentRinfo.port,
						is_leader: isLeader,
					}),
				});
			}
		}
	} catch (_) {}

	function reply(
		response: ServerPacket,
		options?: { port: number; address: string },
	) {
		const buffer = Buffer.from(JSON.stringify(response));
		server.send(
			buffer,
			options?.port ?? rinfo.port,
			options?.address ?? rinfo.address,
			(err) => {
				if (err) console.error("Failed to send packet:", err);
			},
		);
	}
});

server.on("listening", () => {
	const { address, port } = server.address();
	console.info(`UDP server listening on ${address}:${port}`);
});

server.on("error", (err) => {
	console.error("UDP server error:", err);
	server.close();
});

server.bind(PORT);
