import { redis } from "$connectors/redis";
import type { RemoteInfo } from "$types/remote";
import { _ } from "./others";

/*
	Redis
		[String keys]
			afqm:ips:<version>:<"IPv4"/"IPv6">:<ip address>:<port> = the lobby ID that the client owns
		[JSON keys]
			afqm:lobbies:<version>:<lobby id> = RemoteInfo
*/

export const lobbies = {
	/** Get a lobby's host information */
	get({ version, lobbyId }: { version: string; lobbyId: string }) {
		return redis.getJson<RemoteInfo>(_`afqm:lobbies:${version}:${lobbyId}`);
	},
	/** Get a lobby ID based on the host information */
	getLobbyByRemote({ version, rinfo }: { version: string; rinfo: RemoteInfo }) {
		return redis.get(
			_`afqm:remote_to_lobby:${version}:${rinfo.family}:${rinfo.address}:${rinfo.port}`,
		);
	},
	/** Create a lobby */
	async create({
		version,
		lobbyId,
		rinfo,
	}: {
		version: string;
		lobbyId: string;
		rinfo: RemoteInfo;
	}) {
		const options = ["EX", 86400] as const; // expires in 1 day
		await Promise.all([
			redis.set(
				_`afqm:remote_to_lobby:${version}:${rinfo.family}:${rinfo.address}:${rinfo.port}`,
				lobbyId,
				...options,
			),
			redis.setJson<RemoteInfo>(
				_`afqm:lobbies:${version}:${lobbyId}`,
				rinfo,
				...options,
			),
		]);
	},
	/** Delete a lobby */
	async del({
		version,
		lobbyId,
		rinfo,
	}: {
		version: string;
		lobbyId: string;
		rinfo: RemoteInfo;
	}) {
		await Promise.all([
			redis.del(
				_`afqm:remote_to_lobby:${version}:${rinfo.family}:${rinfo.address}:${rinfo.port}`,
			),
			redis.del(_`afqm:lobbies:${version}:${lobbyId}`),
		]);
	},
};
