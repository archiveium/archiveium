import * as folderRepository from '$lib/server/repositories/folderRepository';
import type { NewAccount, ValidatedAccount, ValidatedExistingAccount } from '../../../types/account';
import type { Folder, FolderInsert } from '../../../types/folder';
import { db } from '../database/connection';

export async function findFoldersByAccountIdAndUserId(userId: string, accountId: string) {
	const folders = await folderRepository.findFoldersByAccountIdAndUserId(userId, accountId);
	return folders.map((folder) => {
		const query = new URLSearchParams({ accountId, folderId: folder.id });
		folder.href = `?${query.toString()}`;
		return folder;
	});
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
