import type { Kysely } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('users')
        .addColumn('admin', 'boolean', (col) => col.defaultTo(false))
        .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('users')
        .dropColumn('admin')
        .execute();
}