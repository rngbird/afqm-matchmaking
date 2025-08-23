import RedisClient from "ioredis-mock";

class CustomRedisClient extends RedisClient {
	async getJson<R extends object>(key: string): Promise<R | null> {
		const value = await this.get(key);
		return value ? JSON.parse(value) : null;
	}
	setJson<R extends object>(key: string, value: R, ...options: ["EX", number]) {
		return this.set(key, JSON.stringify(value), ...options);
	}
}

export const redis = new CustomRedisClient();
