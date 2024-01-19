import { db } from '$lib/server/database/connection';
import type { Transaction, UpdateResult } from 'kysely';
import type { DB } from '../database/types';

export async function findAccountsCountByUserId(userId: string): Promise<number> {
	const result = await db
		.selectFrom('accounts')
		.select((eb) => eb.fn('count', ['id']).as('count'))
		.where('user_id', '=', userId)
		.where('deleted', '=', false)
		.executeTakeFirstOrThrow();
	return result.count as number;
}

export async function updateAccountSyncingStatus(
	userId: string,
	accountId: string,
	syncing: boolean
): Promise<boolean> {
	const result = await db
		.updateTable('accounts')
		.set({
			syncing: syncing
		})
		.where('user_id', '=', userId)
		.where('id', '=', accountId)
		.executeTakeFirstOrThrow();
	return result.numUpdatedRows > 0;
}

export async function findAccountsByUserId(userId: string) {
	return db
		.selectFrom('accounts')
		.selectAll()
		.where('user_id', '=', userId)
		.where('deleted', '=', false)
		.execute();
}

export async function findAccountByUserIdAndAccountId(userId: string, accountId: string) {
	return db
		.selectFrom('accounts')
		.selectAll()
		.where('user_id', '=', userId)
		.where('id', '=', accountId)
		.where('deleted', '=', false)
		.executeTakeFirstOrThrow();
}

export async function findAccountWithProviderByUserIdAndAccountId(
	userId: string,
	accountId: string
) {
	return db
		.selectFrom('accounts as a')
		.innerJoin('providers as p', 'p.id', 'a.provider_id')
		.select([
			'a.id',
			'a.email',
			'a.password',
			'a.deleted',
			'a.syncing',
			'p.host as provider_host',
			'p.check_email_id as provider_check_email_id'
		])
		.where('a.user_id', '=', userId)
		.where('a.id', '=', accountId)
		.executeTakeFirstOrThrow();
}

export async function findAllSyncingAccountCountByUserId(userId: string) {
	const result = await db
		.selectFrom('accounts')
		.select((eb) => eb.fn('count', ['id']).as('count'))
		.where('user_id', '=', userId)
		.where('syncing', '=', true)
		.executeTakeFirstOrThrow();
	return result.count as number;
}

export async function findAllSyncingAccounts() {
	return db
		.selectFrom('accounts as a')
		.innerJoin('providers as p', 'p.id', 'a.provider_id')
		.select([
			'a.id',
			'a.email',
			'a.password',
			'a.user_id',
			'p.host as provider_host',
			'p.name as provider_name'
		])
		.where('a.deleted', '=', false)
		.where('a.syncing', '=', true)
		.execute();
}

export async function isAccountUnique(email: string, userId: string): Promise<boolean> {
	const result = await db
		.selectFrom('accounts')
		.select((eb) => eb.fn('count', ['id']).as('count'))
		.where('user_id', '=', userId)
		.where('email', '=', email)
		.where('deleted', '=', false)
		.executeTakeFirstOrThrow();
	return (result.count as number) == 0;
}

export async function softDeleteAccountByUserId(
	userId: string,
	accountId: string,
	trx?: Transaction<DB>
): Promise<UpdateResult> {
	const dbObject = trx ?? db;
	return dbObject
		.updateTable('accounts')
		.set({
			syncing: false,
			deleted: true
		})
		.where('user_id', '=', userId)
		.where('id', '=', accountId)
		.executeTakeFirstOrThrow();
}

export async function findDeletedAccounts() {
	return db
		.selectFrom('accounts')
		.select(['id', 'user_id', 'provider_id'])
		.where('deleted', '=', true)
		.execute();
}

export async function deleteAccount(id: string) {
	return db.deleteFrom('accounts').where('id', '=', id).executeTakeFirst();
}
