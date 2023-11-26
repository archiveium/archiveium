import { db } from '$lib/server/database/connection';
import type { Transaction, UpdateResult } from 'kysely';
import type { DB } from '../database/types';
import type { FolderInsert, FolderUpdate } from '../database/wrappers';

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

export async function findFoldersWithoutDeletedFilterByAccountIdAndUserId(
  userId: string,
  accountId: string,
) {
  return db.selectFrom('folders')
    .selectAll()
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .execute();
}

export async function findFoldersWithDeletedFilterByAccountIdAndUserId(
  userId: string,
  accountId: string,
  deletedRemote: boolean
) {
  return db.selectFrom('folders')
    .selectAll()
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .where('deleted', '=', false)
    .where('deleted_remote', '=', deletedRemote)
    .execute();
}

export async function findFolderById(folderId: string) {
  return db.selectFrom('folders')
    .selectAll()
    .where('id', '=', folderId)
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

export async function updateFolder(folderId: string, folderUpdate: FolderUpdate) {
  return db.updateTable('folders')
    .set(folderUpdate)
    .where('id', '=', folderId)
    .executeTakeFirstOrThrow();
}

export async function insertFolder(folderInsert: FolderInsert) {
  return db.insertInto('folders')
    .values(folderInsert)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function findSyncingFoldersByUserAndAccount(
  userId: string,
  accountId: string,
  remoteDeleted: boolean,
) {
  return db.selectFrom('folders')
    .selectAll()
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .where('deleted', '=', false)
    .where('deleted_remote', '=', remoteDeleted)
    .where('syncing', '=', true)
    .execute();
}