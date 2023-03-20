import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('users', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        password: {
            type: 'varchar(255)',
            notNull: true,
        },
        email_verified_at: {
            type: 'timestamp(0)',
            notNull: false,
        },
        email_notified_at: {
            type: 'timestamp(0)',
            notNull: false,
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        }
    });

    pgm.createTable('providers', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        host: {
            type: 'varchar(255)',
            notNull: true,
        },
        port: {
            type: 'int4',
            notNull: true,
        },
        secure: {
            type: 'boolean',
            notNull: true,
        },
        is_default: {
            type: 'boolean',
            notNull: true,
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        }
    });

    pgm.createTable('accounts', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        username: {
            type: 'varchar(255)',
            notNull: true,
        },
        password: {
            type: 'varchar(255)',
            notNull: true,
        },
        user_id: {
            type: 'int8',
            notNull: true,
            references: 'users',
        },
        provider_id: {
            type: 'int8',
            notNull: true,
            references: 'providers',
        },
        syncing: {
            type: 'boolean',
            default: true,
        },
        deleted: {
            type: 'boolean',
            default: false,
        },
        searchable: {
            type: 'boolean',
            default: true,
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        }
    });

    pgm.createTable('password_resets', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
        },
        token: {
            type: 'varchar(255)',
            notNull: true,
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
    });

    pgm.createTable('user_invitations', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        username: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        accepted: {
            type: 'boolean',
            default: false,
        },
        notification_sent_at: {
            type: 'timestamp(0)',
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
    });

    pgm.createTable('folders', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        user_id: {
            type: 'int8',
            notNull: true,
            references: 'users',
        },
        account_id: {
            type: 'int8',
            notNull: true,
            references: 'accounts',
            onDelete: 'CASCADE',
        },
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        status_uidvalidity: {
            type: 'int4',
            notNull: true,
        },
        status_messages: {
            type: 'int4',
            notNull: true,
        },
        last_updated_msgno: {
            type: 'int4',
        },
        deleted: {
            type: 'boolean',
            default: false,
        },
        deleted_remote: {
            type: 'boolean',
            default: false,
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        }
    });

    pgm.createTable('emails', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        user_id: {
            type: 'int8',
            notNull: true,
            references: 'users',
        },
        folder_id: {
            type: 'int8',
            notNull: true,
            references: 'folders',
            onDelete: 'CASCADE',
        },
        message_number: {
            type: 'int4',
            notNull: true,
        },
        udate: {
            type: 'timestamp(0)',
            notNull: true,
        },
        has_attachments: {
            type: 'boolean',
            notNull: true,
        },
        imported: {
            type: 'boolean',
            notNull: true,
        },
        import_fail_reason: {
            type: 'text',
        },
        created_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp(0)',
            default: pgm.func('NOW()'),
        }
    });

    pgm.createTable('jobs', {
        id: {
            primaryKey: true,
            type: 'serial8',
        },
        queue: {
            type: 'varchar(255)',
            notNull: true,
        },
        payload: {
            type: 'json',
            notNull: true,
        },
        attempts: {
            type: 'int2',
            notNull: true,
        },
        reserved_at: {
            type: 'int4',
        },
        available_at: {
            type: 'int4',
            notNull: true,
        },
        created_at: {
            type: 'int4',
            notNull: true,
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
}
