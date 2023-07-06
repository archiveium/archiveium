import postgres from 'postgres';
import config from 'config';
import { Redis } from "ioredis"
import type { DatabaseConfig, RedisConfig } from '../types/config';

const dbConfig = config.get<DatabaseConfig>('database');
const redisConfig = config.get<RedisConfig>('redis');

export const redis = new Redis(redisConfig);
export const sql = postgres({...dbConfig});