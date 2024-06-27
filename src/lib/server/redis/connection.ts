import config from 'config';
import { Redis } from 'ioredis';
import type { RedisConfig } from '../../../types/config';

const redisConfig = config.get<RedisConfig>('redis');

// TODO These get triggered during build time resulting in errors
// Note maxRetriesPerRequest and retryStrategy are set especially for bullmq
export const redis = new Redis({
	...redisConfig,
	maxRetriesPerRequest: null,
	retryStrategy: function (times: number) {
		return Math.max(Math.min(Math.exp(times), 20000), 1000);
	}
});
