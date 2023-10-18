import type { DB } from './types';
import pg from 'pg';
import config from 'config';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseConfig } from '../../../types/config';
import { LOG_LEVEL } from '$env/dynamic/private';

const { Pool } = pg;
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
  log(event) {
    if (event.level === 'query' && LOG_LEVEL === 'VERBOSE') {
      console.log(event.query.sql)
      console.log(event.query.parameters)
    }
  }
})