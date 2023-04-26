import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('password_resets', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
        },
        password_reset_token: {
            type: 'varchar(255)',
            notNull: true,
        },
        email_notified_at: {
            type: 'timestamp(0)',
            notNull: false,
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('password_resets', {
        ifExists: true
    });
}
