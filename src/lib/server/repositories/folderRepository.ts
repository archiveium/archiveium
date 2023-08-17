import { db } from '$lib/server/database/connection';

export async function findFoldersByAccountIdAndUserId(userId: string, accountId: string) {
  return db.selectFrom('folders')
    .selectAll()
    .where('user_id', '=', userId)
    .where('account_id', '=', accountId)
    .where('deleted', '=', false)
    .where('deleted_remote', '=', false)
    .execute();
}