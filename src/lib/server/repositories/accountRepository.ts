import { db } from '$lib/server/database/connection';
import type { DeleteResult } from 'kysely';

export async function findAccountsCountByUserId(userId: string): Promise<number> {
  const result = await db.selectFrom('accounts')
    .select((eb) => eb.fn('count', ['id']).as('count'))
    .where('user_id', '=', userId)
    .where('deleted', '=', false)
    .executeTakeFirstOrThrow();
    return result.count as number;
}

export async function updateAccountSyncingStatus(userId: string, accountId: string, syncing: boolean): Promise<boolean> {
  const result = await db.updateTable('accounts')
    .set({
      'syncing': syncing,
    })
    .where('user_id', '=', userId)
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
    return result.numUpdatedRows > 0;
}

export async function findAccountsByUserId(userId: string) {
  return db.selectFrom('accounts')
    .selectAll()
    .where('user_id', '=', userId)
    .where('deleted', '=', false)
    .execute();
}

export async function findAccountByUserIdAndAccountId(userId: string, accountId: string) {
  return db.selectFrom('accounts')
    .selectAll()
    .where('user_id', '=', userId)
    .where('id', '=', accountId)
    .where('deleted', '=', false)
    .executeTakeFirstOrThrow();
}

export async function findAllSyncingAccountCountByUserId(userId: string) {
  const result = await db.selectFrom('accounts')
    .select((eb) => eb.fn('count', ['id']).as('count'))
    .where('user_id', '=', userId)
    .where('syncing', '=', true)
    .executeTakeFirstOrThrow();
  return result.count as number;
}

export async function isAccountUnique(email: string, userId: string): Promise<boolean> {
  const result = await db.selectFrom('accounts')
    .select((eb) => eb.fn('count', ['id']).as('count'))
    .where('user_id', '=', userId)
    .where('email', '=', email)
    .where('deleted', '=', false)
    .executeTakeFirstOrThrow();
  return result.count as number == 0;
}

export async function deleteAccountByUserId(userId: string, accountId: string): Promise<DeleteResult> {
  return db.deleteFrom('accounts')
    .where('user_id', '=', userId)
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
}