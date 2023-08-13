import type { DB } from './types';
import { Pool } from 'pg';
import config from 'config';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseConfig } from '../../../types/config';

const dbConfig = config.get<DatabaseConfig>('database');
const dialect = new PostgresDialect({
  pool: new Pool(dbConfig),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
})