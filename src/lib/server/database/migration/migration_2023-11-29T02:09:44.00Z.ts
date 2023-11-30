import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('password', 'varchar(255)', (col) => col.notNull())
        .addColumn('email_verified_at', 'timestamp(0)')
        .addColumn('email_notified_at', 'timestamp(0)')
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable('providers')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('host', 'varchar(255)', (col) => col.notNull())
        .addColumn('port', 'int4', (col) => col.notNull())
        .addColumn('secure', 'boolean', (col) => col.notNull())
        .addColumn('is_default', 'boolean', (col) => col.notNull())
        .addColumn('check_email_id', 'boolean', (col) => col.notNull())
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .addUniqueConstraint('uniqueNameHost', ['name', 'host'])
        .execute();

    await db.schema
        .createTable('accounts')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull())
        .addColumn('password', 'varchar(255)', (col) => col.notNull())
        .addColumn('user_id', 'int8', (col) => col.notNull().references('users.id'))
        .addColumn('provider_id', 'int8', (col) => col.notNull().references('providers.id'))
        .addColumn('syncing', 'boolean', (col) => col.defaultTo(true))
        .addColumn('deleted', 'boolean', (col) => col.defaultTo(false))
        .addColumn('searchable', 'boolean', (col) => col.defaultTo(true))
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable('user_invitations')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('username', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('accepted', 'boolean', (col) => col.defaultTo(false))
        .addColumn('notification_sent_at', 'timestamp(0)')
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable('folders')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('user_id', 'bigserial', (col) => col.notNull().references('users.id'))
        .addColumn('account_id', 'bigserial', (col) =>
            col.notNull().references('accounts.id').onDelete('cascade')
        )
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('status_uidvalidity', 'int4', (col) => col.notNull())
        .addColumn('last_updated_msgno', 'int4')
        .addColumn('syncing', 'boolean', (col) => col.defaultTo(false))
        .addColumn('deleted', 'boolean', (col) => col.defaultTo(false))
        .addColumn('deleted_remote', 'boolean', (col) => col.defaultTo(false))
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable('emails')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('user_id', 'bigserial', (col) => col.notNull().references('users.id'))
        .addColumn('account_id', 'bigserial', (col) =>
            col.notNull().references('accounts.id').onDelete('cascade')
        )
        .addColumn('email_id', 'bigint')
        .addColumn('message_number', 'int4', (col) => col.notNull())
        .addColumn('udate', 'timestamp(0)', (col) => col.notNull())
        .addColumn('has_attachments', 'boolean', (col) => col.notNull())
        .addColumn('imported', 'boolean', (col) => col.notNull())
        .addColumn('import_fail_reason', 'text')
        .addColumn('size_total', 'bigint', (col) => col.notNull())
        .addColumn('size_without_attachments', 'bigint', (col) => col.notNull())
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable('password_resets')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('email', 'varchar(255)', (col) => col.notNull())
        .addColumn('password_reset_token', 'varchar(255)', (col) => col.notNull())
        .addColumn('email_notified_at', 'timestamp(0)')
        .addColumn('created_at', 'timestamp(0)', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable('email_folders')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('email_id', 'bigserial', (col) => 
            col.notNull().references('emails.id').onDelete('cascade')
        )
        .addColumn('folder_id', 'bigserial', (col) => 
            col.notNull().references('folders.id').onDelete('cascade')
        )
        .addColumn('has_source', 'boolean', (col) => col.notNull())
        .addUniqueConstraint('uniqueEmailIdFolderId', ['email_id', 'folder_id'])
        .execute();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute();
    await db.schema.dropTable('providers').execute();
    await db.schema.dropTable('accounts').execute();
    await db.schema.dropTable('user_invitations').execute();
    await db.schema.dropTable('folders').execute();
    await db.schema.dropTable('emails').execute();
    await db.schema.dropTable('password_resets').execute();
    await db.schema.dropTable('email_folders').execute();
}