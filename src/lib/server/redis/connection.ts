import config from 'config';
import { Redis } from 'ioredis';
import type { RedisConfig } from '../../../types/config';

const redisConfig = config.get<RedisConfig>('redis');

// TODO These get triggered during build time resulting in errors
// TODO Add a connection timeout for docker container to die instead of retrying forever
// Note maxRetriesPerRequest is set to null for the purpose of bullmq
export const redis = new Redis({ ...redisConfig, maxRetriesPerRequest: null });
