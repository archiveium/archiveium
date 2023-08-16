import { db } from '$lib/server/database/connection';
import { sql } from 'kysely';

export async function findEmailByFolderIdAndUserId(userId: string, folderId: string, offset: number, limit: number) {
    return db.selectFrom('emails')
        .select([
            'id', 'folder_id', 'has_attachments', 'message_number',
            sql<string>`to_char(udate, 'Mon DD, YYYY')`.as('formatted_date')
        ])
        .where('user_id', '=', userId)
        .where('folder_id', '=', folderId)
        .where('imported', '=', true)
        .orderBy('udate', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
}

export async function findEmailByIdAndUserId(userId: string, emailId: string) {
    return db.selectFrom('emails')
        .select(['id', 'folder_id', 'udate', 'has_attachments', 'message_number'])        
        .where('user_id', '=', userId)
        .where('id', '=', emailId)
        .where('imported', '=', true)
        .executeTakeFirstOrThrow();
}

export async function findEmailCountByFolderAndUserId(userId: string, folderId: string): Promise<number> {
    const result = await db.selectFrom('emails')
        .select((eb) => eb.fn('count', ['id']).as('count'))
        .where('user_id', '=', userId)
        .where('folder_id', '=', folderId)
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