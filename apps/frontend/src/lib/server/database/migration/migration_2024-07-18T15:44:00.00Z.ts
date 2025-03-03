import type { Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('emails')
		.addColumn('indexed', 'boolean', (col) => col.defaultTo(false))
		.addColumn('indexer_processing', 'boolean', (col) => col.defaultTo(false))
		.execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('users')
		.dropColumn('indexed')
		.dropColumn('indexer_processing')
		.execute();
}
