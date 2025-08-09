import { RedisClient } from "bun";

class CustomRedisClient extends RedisClient {
	async getJson<R extends object>(key: string): Promise<R | null> {
		const value = await this.get(key);
		return value ? JSON.parse(value) : null;
	}
	setJson<R extends object>(
		key: string,
		value: R,
		...options: (string | number)[]
	) {
		return this.set(
			key,
			JSON.stringify(value),
			...options.map((o) => String(o)),
		);
	}
}

export const redis = new CustomRedisClient();
