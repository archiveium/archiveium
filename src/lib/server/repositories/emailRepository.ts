import { db } from '$lib/server/database/connection';
import { Transaction, sql } from 'kysely';
import type { EmailInsert } from '../database/wrappers';
import type { DB } from '../database/types';

export async function findEmailByFolderIdAndUserId(
	userId: string,
	folderId: string,
	offset: number,
	limit: number
) {
	return db
		.selectFrom('emails as e')
		.innerJoin('email_folders as ef', 'ef.email_id', 'e.id')
		.select([
			'e.id',
			'e.has_attachments',
			'e.message_number',
			'e.email_id',
			'e.udate',
			sql<string>`to_char(e.udate, 'Mon DD, YYYY')`.as('formatted_date')
		])
		.where('e.user_id', '=', userId)
		.where('ef.folder_id', '=', folderId)
		.where('e.imported', '=', true)
		.orderBy('e.udate', 'desc')
		.offset(offset)
		.limit(limit)
		.execute();
}

export async function findEmailByAccountIdAndUserId(
	userId: string,
	accountId: string,
	offset: number,
	limit: number
) {
	return db
		.selectFrom('emails as e')
		.innerJoin('email_folders as ef', 'ef.email_id', 'e.id')
		.select([
			'e.id',
			'e.has_attachments',
			'e.message_number',
			'ef.folder_id',
			sql<string>`to_char(e.udate, 'Mon DD, YYYY')`.as('formatted_date')
		])
		.where('e.user_id', '=', userId)
		.where('e.account_id', '=', accountId)
		.where('e.imported', '=', true)
		.where('ef.has_source', '=', true)
		.orderBy('e.udate', 'desc')
		.offset(offset)
		.limit(limit)
		.execute();
}

export async function findEmailByUserId(userId: string, offset: number, limit: number) {
	return db
		.selectFrom('emails as e')
		.innerJoin('email_folders as ef', 'ef.email_id', 'e.id')
		.innerJoin('accounts as a', 'a.id', 'e.account_id')
		.select([
			'e.id',
			'e.email_id',
			'e.has_attachments',
			'e.message_number',
			'ef.folder_id',
			sql<string>`to_char(e.udate, 'Mon DD, YYYY')`.as('formatted_date')
		])
		.where('e.user_id', '=', userId)
		.where('e.imported', '=', true)
		.where('a.deleted', '!=', true)
		.where('ef.has_source', '=', true)
		.orderBy('e.udate', 'desc')
		.offset(offset)
		.limit(limit)
		.execute();
}

export async function findEmailByIdAndUserId(userId: string, emailId: string) {
	return db
		.selectFrom('emails as e')
		.innerJoin('email_folders as ef', 'ef.email_id', 'e.id')
		.select([
			'e.id',
			'e.email_id',
			'e.udate',
			'e.has_attachments',
			'e.message_number',
			'ef.folder_id'
		])
		.where('e.user_id', '=', userId)
		.where('e.id', '=', emailId)
		.where('e.imported', '=', true)
		.where('ef.has_source', '=', true)
		.executeTakeFirstOrThrow();
}

export async function findEmailByEmailId(emailId: string) {
	return db
		.selectFrom('emails as e')
		.innerJoin('email_folders as ef', 'ef.email_id', 'e.id')
		.select(['e.id', 'e.user_id', 'e.email_id', 'e.imported', 'ef.folder_id', 'ef.has_source'])
		.where('e.email_id', '=', emailId)
		.execute();
}

export async function findEmailCountByFolderAndUserId(
	userId: string,
	folderId: string
): Promise<number> {
	const result = await db
		.selectFrom('emails')
		.innerJoin('email_folders', 'email_folders.email_id', 'emails.id')
		.select((eb) => eb.fn('count', ['emails.id']).as('count'))
		.where('emails.user_id', '=', userId)
		.where('email_folders.folder_id', '=', folderId)
		.where('emails.imported', '=', true)
		.executeTakeFirstOrThrow();
	return result.count as number;
}

export async function findEmailCountByAccountIdAndUserId(
	userId: string,
	accountId: string
): Promise<number> {
	const result = await db
		.selectFrom('emails')
		.select((eb) => eb.fn('count', ['id']).as('count'))
		.where('user_id', '=', userId)
		.where('account_id', '=', accountId)
		.where('imported', '=', true)
		.executeTakeFirstOrThrow();
	return result.count as number;
}

export async function findEmailCountByUserId(userId: string): Promise<number> {
	const result = await db
		.selectFrom('emails')
		.select((eb) => eb.fn('count', ['id']).as('count'))
		.where('user_id', '=', userId)
		.where('imported', '=', true)
		.executeTakeFirstOrThrow();
	return result.count as number;
}

export async function findFailedEmailCountByUserId(userId: string): Promise<number> {
	const result = await db
		.selectFrom('emails')
		.select((eb) => eb.fn('count', ['id']).as('count'))
		.where('user_id', '=', userId)
		.where('imported', '=', false)
		.executeTakeFirstOrThrow();
	return result.count as number;
}

export async function insertEmail(email: EmailInsert, trx?: Transaction<DB>) {
	const dbObject = trx ?? db;
	return dbObject.insertInto('emails').values(email).returningAll().executeTakeFirstOrThrow();
}
