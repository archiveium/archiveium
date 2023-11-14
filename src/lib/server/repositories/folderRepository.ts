import { db } from '$lib/server/database/connection';
import type { Transaction, UpdateResult } from 'kysely';
import type { DB } from '../database/types';

export async function deleteFolderByAccountId(userId: string, accountId: string, trx?: Transaction<DB>): Promise<UpdateResult> {
  const dbObject = trx ?? db;
  return dbObject.updateTable('folders')
    .set({
      'syncing': false,
      'deleted': true
    })
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .executeTakeFirstOrThrow();
}

export async function findFoldersByAccountIdAndUserId(userId: string, accountId: string) {
  return db.selectFrom('folders')
    .selectAll()
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .where('deleted', '=', false)
    .where('deleted_remote', '=', false)
    .execute();
}

export async function findDeletedFoldersByUserAndAccount(userId: string, accountId: string) {
  return db.selectFrom('folders')
    .selectAll()
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .where('deleted', '=', true)
    .execute();
}