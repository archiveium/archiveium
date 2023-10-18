import { db } from '$lib/server/database/connection';
import { sql } from 'kysely';

export async function findEmailByFolderIdAndUserId(userId: string, folderId: string, offset: number, limit: number) {
    return db.selectFrom('emails')
        .innerJoin('email_folders', 'email_folders.email_id', 'emails.id')
        .select([
            'emails.id', 'emails.has_attachments', 'emails.message_number',
            sql<string>`to_char(emails.udate, 'Mon DD, YYYY')`.as('formatted_date')
        ])
        .where('emails.user_id', '=', userId)
        .where('email_folders.folder_id', '=', folderId)
        .where('emails.imported', '=', true)
        .orderBy('emails.udate', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
}

export async function findEmailByAccountIdAndUserId(userId: string, accountId: string, offset: number, limit: number) {
    return db.selectFrom('emails')
        .select([
            'id', 'has_attachments', 'message_number',
            sql<string>`to_char(udate, 'Mon DD, YYYY')`.as('formatted_date')
        ])
        .where('user_id', '=', userId)
        .where('account_id', '=', accountId)
        .where('imported', '=', true)
        .orderBy('udate', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
}

export async function findEmailByUserId(userId: string, offset: number, limit: number) {
    return db.selectFrom('emails')
        .select([
            'id', 'email_id', 'has_attachments', 'message_number',
            sql<string>`to_char(udate, 'Mon DD, YYYY')`.as('formatted_date')
        ])
        .where('user_id', '=', userId)
        .where('imported', '=', true)
        .orderBy('udate', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
}

export async function findEmailByIdAndUserId(userId: string, emailId: string) {
    return db.selectFrom('emails')
        .select(['id', 'email_id', 'udate', 'has_attachments', 'message_number'])        
        .where('user_id', '=', userId)
        .where('id', '=', emailId)
        .where('imported', '=', true)
        .executeTakeFirstOrThrow();
}

export async function findEmailCountByFolderAndUserId(userId: string, folderId: string): Promise<number> {
    const result = await db.selectFrom('emails')
        .innerJoin('email_folders', 'email_folders.email_id', 'emails.id')
        .select((eb) => eb.fn('count', ['emails.id']).as('count'))
        .where('emails.user_id', '=', userId)
        .where('email_folders.folder_id', '=', folderId)
        .where('emails.imported', '=', true)
        .executeTakeFirstOrThrow();
    return result.count as number;
}

export async function findEmailCountByAccountIdAndUserId(userId: string, accountId: string): Promise<number> {
    const result = await db.selectFrom('emails')
        .select((eb) => eb.fn('count', ['id']).as('count'))
        .where('user_id', '=', userId)
        .where('account_id', '=', accountId)
        .where('imported', '=', true)
        .executeTakeFirstOrThrow();
    return result.count as number;
}

export async function findEmailCountByUserId(userId: string): Promise<number> {
    const result = await db.selectFrom('emails')
        .select((eb) => eb.fn('count', ['id']).as('count'))
        .where('user_id', '=', userId)
        .where('imported', '=', true)
        .executeTakeFirstOrThrow();
    return result.count as number;
}

export async function findFailedEmailCountByUserId(userId: string): Promise<number> {
    const result = await db.selectFrom('emails')
        .select((eb) => eb.fn('count', ['id']).as('count'))
        .where('user_id', '=', userId)
        .where('imported', '=', false)
        .executeTakeFirstOrThrow();
    return result.count as number;
}