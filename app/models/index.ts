import postgres from 'postgres';
import config from 'config';
import type { DatabaseConfig } from '~/types/config';

const dbConfig = config.get<DatabaseConfig>('database');

export const sql = postgres({...dbConfig});