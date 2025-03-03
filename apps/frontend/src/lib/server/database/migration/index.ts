import { Migrator } from 'kysely';
import { CustomMigrationProvider } from './customMigrationProvider';
import { logger } from '../../../../utils/logger';
import { db } from '$lib/server/database/connection';

export async function runMigrations() {
	const migrator = new Migrator({
		db,
		provider: new CustomMigrationProvider()
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			logger.info(`Migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			logger.error(`Failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		logger.error('failed to migrate');
		logger.error(error);
		process.exit(1);
	}

	// await db.destroy();
}
