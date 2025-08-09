import { and, eq, gt, ne, or, sql } from "drizzle-orm";
import { db } from "$connectors/psql";
import { redis } from "$connectors/redis";
import { matchmakingQueue } from "$schema/matchmaking";
import type { RemoteInfo } from "$types/remote";
import { _ } from "./others";

/*
	Redis
		[Number keys]
			afqm:match_id = match id, incrementing up by 1
		[String keys]
			afqm:match_accepted:<match id>:<"IPv4"/"IPv6">:<ip address>:<port> = "1" (true)
		[JSON keys]
			afqm:match:<match id> = [RemoteInfo, RemoteInfo]
*/

export const matchmaking = {
	/** Queue a user into matchmaking */
	async queue({
		version,
		region,
		rinfo,
	}: {
		version: string;
		region: string;
		rinfo: RemoteInfo;
	}) {
		// Set the queue
		await db
			.insert(matchmakingQueue)
			.values({
				version,
				address: rinfo.address,
				family: rinfo.family,
				port: rinfo.port,
				region,
			})
			.onConflictDoUpdate({
				target: [
					matchmakingQueue.version,
					matchmakingQueue.address,
					matchmakingQueue.family,
					matchmakingQueue.port,
				],
				set: { region, expiresIn: sql`now() + interval '15 seconds'` },
			});
	},
	/** Unqueue from matchmaking */
	async unqueue({ version, rinfo }: { version: string; rinfo: RemoteInfo }) {
		await db
			.delete(matchmakingQueue)
			.where(
				and(
					eq(matchmakingQueue.version, version),
					eq(matchmakingQueue.family, rinfo.family),
					eq(matchmakingQueue.address, rinfo.address),
					eq(matchmakingQueue.port, rinfo.port),
				),
			);
	},
	/** Check if another user is available in matchmaking. If so, remove the user from the queue. */
	async available({
		version,
		region,
		rinfo,
	}: {
		version: string;
		region: string;
		rinfo: RemoteInfo;
	}) {
		const opponent = await db
			.delete(matchmakingQueue)
			.where(
				and(
					eq(matchmakingQueue.version, version),
					eq(matchmakingQueue.region, region),
					or(
						ne(matchmakingQueue.family, rinfo.family),
						ne(matchmakingQueue.address, rinfo.address),
						ne(matchmakingQueue.port, rinfo.port),
					),
					gt(matchmakingQueue.expiresIn, sql`now()`),
				),
			)
			.returning({
				family: matchmakingQueue.family,
				address: matchmakingQueue.address,
				port: matchmakingQueue.port,
			});
		return opponent[0] || null;
	},
	/** Get a match by ID */
	async get({ id }: { id: number }) {
		const rinfos = await redis.getJson<[RemoteInfo, RemoteInfo]>(
			_`afqm:match:${id}`,
		);
		if (!rinfos) return null;
		return { rinfos };
	},
	/** Check if the match for the rinfo was already given. If not, set it as accepted. */
	async accept({ id, rinfo }: { id: number; rinfo: RemoteInfo }) {
		// If match was already accepted, return false
		if (
			await redis.get(
				_`afqm:match_accepted:${id}:${rinfo.family}:${rinfo.address}:${rinfo.port}`,
			)
		) {
			return false;
		}

		// If match wasn't already accepted, return true
		await redis.set(
			_`afqm:match_accepted:${id}:${rinfo.family}:${rinfo.address}:${rinfo.port}`,
			"1",
			"EX",
			60, // expire in a minute
		);
		return true;
	},
	/** Create a match */
	async create({ rinfos }: { rinfos: [RemoteInfo, RemoteInfo] }) {
		const id = await redis.incr("afqm:match_id");
		await redis.setJson(_`afqm:match:${id}`, rinfos, "EX", 60); // expires in a minute
		return id;
	},
};
