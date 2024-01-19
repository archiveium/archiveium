import type { DB } from './types';
import pg from 'pg';
import config from 'config';
import { Kysely, PostgresDialect } from 'kysely';
import type { DatabaseConfig } from '../../../types/config';
import { logger } from '../../../utils/logger';

const { Pool } = pg;
const dbConfig = config.get<DatabaseConfig>('database');
const logLevel = config.get<string>('app.logLevel');
const dialect = new PostgresDialect({
	pool: new Pool(dbConfig)
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<DB>({
	dialect,
	log(event) {
		if (event.level === 'query' && logLevel === 'verbose') {
			logger.info(event.query.sql);
			logger.info(JSON.stringify(event.query.parameters));
		}
	}
});
