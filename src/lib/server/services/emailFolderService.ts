import * as emailFolderRepository from '$lib/server/repositories/emailFolderRepository';
import type { Transaction } from 'kysely';
import type { DB } from '../database/types';
import type { EmailFolderInsert } from '../database/wrappers';

export async function insertEmailFolder(emailFolder: EmailFolderInsert, trx?: Transaction<DB>) {
    return emailFolderRepository.insertEmailFolder(emailFolder, trx);
}