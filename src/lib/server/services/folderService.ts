import * as folderRepository from '$lib/server/repositories/folderRepository';
import { FolderDeletedException, FolderDeletedOnRemoteException, FolderNotFoundException, FolderNotSyncingException } from '../../../exceptions/folder';
import type { NewAccount, ValidatedAccount, ValidatedExistingAccount } from '../../../types/account';
import type { Folder, FolderInsert } from '../../../types/folder';
import { db } from '../database/connection';
import type { FolderUpdate } from '../database/wrappers';

export async function findFoldersWithDeletedFilterByAccountIdAndUserId(
	userId: string,
	accountId: string,
	deletedRemote: boolean,
) {
	const folders = await folderRepository.findFoldersWithDeletedFilterByAccountIdAndUserId(
		userId,
		accountId,
		deletedRemote
	);
	return folders.map((folder) => {
		const query = new URLSearchParams({ accountId, folderId: folder.id });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore TODO Accommodate href property in return type
		folder.href = `?${query.toString()}`;
		return folder;
	});
}

export async function findFoldersWithoutDeletedFilterByAccountIdAndUserId(
	userId: string,
	accountId: string,
) {
	return folderRepository.findFoldersWithoutDeletedFilterByAccountIdAndUserId(
		userId,
		accountId,
	);
}

export async function findFolderById(folderId: string) {
	const folders = await folderRepository.findFolderById(folderId);
    if (folders.length > 0) {
        const folder = folders[0];
        if (folder.deleted) {
            throw new FolderDeletedException(`Folder ${folderId} was deleted`);
        } else if (folder.deleted_remote) {
            throw new FolderDeletedOnRemoteException(`Folder ${folderId} was deleted on remote`);
        } else if (!folder.syncing) {
            throw new FolderNotSyncingException(`Folder ${folderId} has syncing = false`);
        }
        return folder;
    }
    throw new FolderNotFoundException(`Folder ${folderId} was not found`);
}

export async function insertFoldersAndAccount(
	userId: string,
	validatedAccount: ValidatedAccount,
	selectedRemoteFolders: FormDataEntryValue[]) {
	return db.transaction().execute(async (trx) => {
		const account = validatedAccount.account;
		const newAccount: NewAccount = {
			name: account.name,
			email: account.email,
			password: account.password,
			provider_id: account.provider_id,
			user_id: userId
		};
		const insertedAccount = await trx.insertInto('accounts')
			.values(newAccount)
			.returning('id')
			.executeTakeFirstOrThrow()

		const foldersToSave: FolderInsert[] = [];
		selectedRemoteFolders.forEach((selectedFolder) => {
			const remoteFolder = validatedAccount.remoteFolders.find(
				({ name }) => name === selectedFolder
			);
			if (remoteFolder) {
				foldersToSave.push({
					name: remoteFolder.name,
					status_uidvalidity: remoteFolder.status_uidvalidity,
					user_id: userId,
					account_id: insertedAccount.id,
					syncing: true
				});
			}
		});

		return await trx.insertInto('folders')
			.values(foldersToSave)
			.executeTakeFirst()
	});
}

export async function updateFoldersAndAccount(
	userId: string,
	validatedExistingAccount: ValidatedExistingAccount,
	selectedRemoteFolders: FormDataEntryValue[],
	existingFolders: Folder[]
) {
	return db.transaction().execute(async (trx) => {
		// update account
		await trx.updateTable('accounts')
			.set({
				name: validatedExistingAccount.account.name,
				password: validatedExistingAccount.account.password
			})
			.where('id', '=', validatedExistingAccount.account.account_id)
			.executeTakeFirstOrThrow();

		const folderIdsToUpdate: string[] = [];
		const foldersToSave: FolderInsert[] = [];
		selectedRemoteFolders.forEach((selectedFolder) => {
			const remoteFolder = validatedExistingAccount.remoteFolders.find(
				({ name }) => name === selectedFolder
			);
			if (remoteFolder) {
				const existingFolder = existingFolders.find((folder) => folder.name === remoteFolder.name);
				if (existingFolder) {
					// existing folder that needs to be updated
					folderIdsToUpdate.push(existingFolder.id);
				} else {
					// new folder that needs to be added
					foldersToSave.push({
						...remoteFolder,
						user_id: userId,
						account_id: validatedExistingAccount.account.account_id,
						syncing: true
					});
				}
			}
		});

		// disable syncing for all existing folders
		await trx.updateTable('folders')
			.set({ syncing: false })
			.where('user_id', '=', userId)
			.where('account_id', '=', validatedExistingAccount.account.account_id)
			.executeTakeFirstOrThrow();

		// enable syncing for all selected folders
		if (folderIdsToUpdate.length > 0) {
			await trx.updateTable('folders')
				.set({ syncing: true })
				.where('user_id', '=', userId)
				.where('account_id', '=', validatedExistingAccount.account.account_id)
				.where('id', 'in', folderIdsToUpdate)
				.executeTakeFirstOrThrow();
		}

		// insert new folders not present in database
		if (foldersToSave.length > 0) {
			return await trx.insertInto('folders')
				.values(foldersToSave)
				.executeTakeFirst();
		}
	});
}

export async function findDeletedFoldersByUserAndAccount(userId: string, accountId: string) {
	return folderRepository.findDeletedFoldersByUserAndAccount(userId, accountId);
}

export async function findSyncingFoldersByUserAndAccount(
	userId: string,
	accountId: string,
	remoteDeleted: boolean,
) {
	return folderRepository.findSyncingFoldersByUserAndAccount(userId, accountId, remoteDeleted);
}

export async function updateFolder(folderId: string, folderUpdate: FolderUpdate) {
	return folderRepository.updateFolder(folderId, folderUpdate);
}

export async function insertFolder(folderInsert: FolderInsert) {
	return folderRepository.insertFolder(folderInsert);
}
