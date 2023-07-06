import postgres from 'postgres';
import config from 'config';
import { Redis } from 'ioredis';
import type { DatabaseConfig, RedisConfig } from '../types/config';

const dbConfig = config.get<DatabaseConfig>('database');
const redisConfig = config.get<RedisConfig>('redis');

// TODO These get triggered during build time resulting in errors
// TODO Add a connection timeout for docker container to die instead of retrying forever
export const redis = new Redis(redisConfig);
export const sql = postgres({ ...dbConfig });
