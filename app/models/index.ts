import postgres from 'postgres';
import config from 'config';
import type { DatabaseConfig, RedisConfig } from '~/types/config';
import { Redis } from "ioredis"

const dbConfig = config.get<DatabaseConfig>('database');
const redisConfig = config.get<RedisConfig>('redis');

export const redis = new Redis(redisConfig);
export const sql = postgres({...dbConfig});