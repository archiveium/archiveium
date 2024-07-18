import * as accountService from '$lib/server/services/accountService';
import * as imapService from '$lib/server/services/imapService';
import * as folderService from '$lib/server/services/folderService';
import type { Job } from 'bullmq';
import { logger } from '../../../../utils/logger';
import type { SyncingAccount } from '../../../../types/account';
import type { ImapFlow } from 'imapflow';
import {
	IMAPGenericException,
	IMAPTooManyRequestsException,
	IMAPUserAuthenticatedNotConnectedException
} from '../../../../exceptions/imap';
import { providerFactory } from '../providerFactory';
import type { FolderSelect } from '$lib/server/database/wrappers';
import _ from 'lodash';
import { decrypt } from '../../../../utils/encrypter';

let jobName: string;

export async function syncFolder(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	// set max execution time of 10 minutes
	setTimeout(() => new Error(`${jobName}: Timed out`), 10 * 60 * 1000);

	const allSyncingAccounts = await accountService.findAllSyncingAccounts();
	const promises = allSyncingAccounts.map((syncingAccount) => {
		return syncAccount(syncingAccount);
	});

	try {
		await Promise.all(promises);
	} catch (error) {
		logger.error(`${jobName}: ${JSON.stringify(error)}`);
		throw error;
	}

	logger.info(`${jobName}: Finished running job`);
}

// TEST Add a test case where one of the local folder isn't processed
async function syncAccount(account: SyncingAccount): Promise<void> {
	logger.info(`${jobName}: Syncing Account ID ${account.id}`);

	let imapClient: ImapFlow;
	const decryptedPassword = decrypt(account.password);
	try {
		imapClient = await imapService.buildClient(
			account.email,
			decryptedPassword,
			account.provider_host
		);
	} catch (error) {
		if (error instanceof IMAPTooManyRequestsException) {
			logger.warn(
				`${jobName}: Too many requests, skipping account id ${account.id}. Error: ${error.message}`
			);
			return;
		} else if (
			error instanceof IMAPGenericException ||
			error instanceof IMAPUserAuthenticatedNotConnectedException
		) {
			logger.error(
				`${jobName}: Error ${error.message} for account id ${account.id}. Skipping account`
			);
			return;
		}
		throw error;
	}

	const remoteFolders = await imapService.getAllIMAPFolders(imapClient);
	await imapClient.logout();

	const provider = providerFactory(account.provider_name);
	const localFolders = await provider.getAllLocalFolders(account.user_id, account.id);
	const processedFolders: FolderSelect[] = [];

	for (let i = 0; i < remoteFolders.length; i++) {
		const syncedSavedFolder = provider.getMappedLocalFolder(localFolders, remoteFolders[i]);
		if (syncedSavedFolder) {
			// TODO Compare only the folder name not path & store path separately
			const folderNameChanged = provider.hasFolderNameChanged(
				syncedSavedFolder.name,
				remoteFolders[i].path
			);
			if (folderNameChanged) {
				const updateResult = await folderService.updateFolder(syncedSavedFolder.id, {
					name: remoteFolders[i].path
				});
				if (updateResult.numUpdatedRows > 0) {
					logger.info(`${jobName}: Renamed folder id ${syncedSavedFolder.id}`);
					delete remoteFolders[i];
				} else {
					logger.error(`${jobName}: Failed to rename folder id ${syncedSavedFolder.id}`);
				}
			} else if (syncedSavedFolder.deleted_remote) {
				await folderService.updateFolder(syncedSavedFolder.id, { deleted_remote: false });
				delete remoteFolders[i];
				logger.info(`${jobName}: Restored folder id ${syncedSavedFolder.id}`);
			} else {
				delete remoteFolders[i];
			}

			processedFolders.push(syncedSavedFolder);
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore since type definitions have the parameters wrong
		else if (!remoteFolders[i].status) {
			delete remoteFolders[i];
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore since type definitions have the parameters wrong
			if (remoteFolders[i].status.messages > 0) {
				// TODO Save name separately from remote folder path
				const insertedFolder = await folderService.insertFolder({
					account_id: account.id,
					user_id: account.user_id,
					name: remoteFolders[i].path,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore since type definitions have the parameters wrong
					status_uidvalidity: remoteFolders[i].status.uidValidity,
					syncing: false
				});
				delete remoteFolders[i];
				logger.info(`${jobName}: Inserted folder with id ${insertedFolder.id}`);
			} else {
				delete remoteFolders[i];
			}
		}
	}

	const remoteFolderDeletes = _.pullAllBy(localFolders, processedFolders);
	remoteFolderDeletes?.map(async (deletedFolder) => {
		if (!deletedFolder.deleted_remote) {
			await folderService.updateFolder(deletedFolder.id, { deleted_remote: true });
			logger.info(`${jobName}: Soft deleted folder ${deletedFolder.id}`);
		}
	});

	logger.info(`${jobName}: Finished syncing account Id ${account.id}`);
}
