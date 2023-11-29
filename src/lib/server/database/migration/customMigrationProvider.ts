import type { Migration, MigrationProvider } from "kysely";

export class CustomMigrationProvider implements MigrationProvider {
    getMigrations(): Promise<Record<string, Migration>> {
        const migrations: Record<string, Migration> = import.meta.glob('./../migration/migration_*', {
            eager: true,
        });

        return Promise.resolve(migrations);
    }
}