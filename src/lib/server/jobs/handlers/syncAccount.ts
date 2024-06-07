import * as accountService from '$lib/server/services/accountService';
import * as folderService from '$lib/server/services/folderService';
import * as imapService from '$lib/server/services/imapService';
import type { Job } from 'bullmq';
import { logger } from '../../../../utils/logger';
import type { ImapFlow } from 'imapflow';
import { buildClient } from '$lib/server/services/imapService';
import {
	IMAPAuthenticationFailedException,
	IMAPGenericException,
	IMAPTooManyRequestsException,
	IMAPUidValidityChangedException,
	IMAPUserAuthenticatedNotConnectedException
} from '../../../../exceptions/imap';
import type { Folder } from '../../../../types/folder';
import type { ImapFolderStatus, MessageNumber } from '../../../../types/imap';
import _ from 'lodash';
import { FolderDeletedOnRemoteException } from '../../../../exceptions/folder';
import { decrypt } from '../../../../utils/encrypter';
import { scheduler } from '..';
import { ImportEmailQueue } from '../queues/importEmailQueue';

const BATCH_SIZE = 200;
let jobName: string;

export async function syncAccount(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	let imapClient: ImapFlow;
	const allSyncingAccounts = await accountService.findAllSyncingAccounts();
	for (const syncingAccount of allSyncingAccounts) {
		const decryptedPassword = decrypt(syncingAccount.password);
		try {
			logger.info(`${jobName}: Logging in`);
			imapClient = await buildClient(
				syncingAccount.email,
				decryptedPassword,
				syncingAccount.provider_host
			);
			logger.info(`${jobName}: Logged in`);
		} catch (error) {
			if (error instanceof IMAPTooManyRequestsException) {
				logger.error(`${jobName}: Too many requests for Account ID: ${syncingAccount.id}`);
				// TODO Add logic to backoff for a while before attempting again
				throw error;
			} else if (error instanceof IMAPAuthenticationFailedException) {
				logger.error(
					`${jobName}: Authentication failed for Account ID ${syncingAccount.id}. Disabling account syncing`
				);
				await accountService.updateAccountSyncingStatus(
					syncingAccount.user_id,
					syncingAccount.id,
					false
				);
				// TODO send notification to user
				return;
			} else if (
				error instanceof IMAPGenericException ||
				error instanceof IMAPUserAuthenticatedNotConnectedException
			) {
				logger.error(`${jobName}: ${error.message} for Account ID: ${syncingAccount.id}`);
				// TODO Add logic to backoff for a while before attempting again
				throw error;
			}

			logger.error(`${jobName}: ` + JSON.stringify(error));
			throw error;
		}

		const accountFolders = await folderService.findSyncingFoldersByUserAndAccount(
			syncingAccount.user_id,
			syncingAccount.id,
			false
		);
		const promises = accountFolders.map(async (accountFolder) => {
			try {
				await processAccount(accountFolder, imapClient);
			} catch (error) {
				if (error instanceof IMAPTooManyRequestsException) {
					logger.error(`${jobName}: Too many requests for Account ID: ${accountFolder.account_id}`);
					// TODO Add logic to backoff for a while before attempting again
					throw error;
				} else if (error instanceof IMAPAuthenticationFailedException) {
					logger.error(
						`${jobName}: Authentication failed for Account ID ${accountFolder.id}. Disabling account syncing`
					);
					await accountService.updateAccountSyncingStatus(
						syncingAccount.user_id,
						syncingAccount.id,
						false
					);
					// TODO send notification to user
				} else if (error instanceof FolderDeletedOnRemoteException) {
					logger.warn(
						`${jobName}: Folder ID ${accountFolder.id} was deleted on remote. Skipping account`
					);
				} else if (error instanceof IMAPGenericException) {
					logger.error(`${jobName}: ${error.message} for Account ID: ${accountFolder.id}`);
					// TODO Add logic to backoff for a while before attempting again
					throw error;
				} else {
					logger.error(`${jobName}: ` + JSON.stringify(error));
					throw error;
				}
			}
		});

		logger.info(`${jobName}: Waiting for all folders to be processed`);
		await Promise.all(promises);

		logger.info(`${jobName}: Logging out`);
		await imapClient.logout();
	}

	logger.info(`${jobName}: Finished running job`);
}

async function processAccount(accountFolder: Folder, imapClient: ImapFlow): Promise<void> {
	// TODO Check if there can be multiple folders for a given account and user
	const folder = await folderService.findFolderById(accountFolder.id);
	const imapFolderStatus = await imapService.getFolderStatusByName(imapClient, folder.name);
	const imapFolderLastUid = imapFolderStatus.uidNext - 1;

	if (_.isNull(folder.last_updated_msgno)) {
		logger.info(`${jobName}: last_updated_msgno for folder id ${accountFolder.id} is null`);
		if (imapFolderStatus.messages > 0) {
			const messageNumbers = await buildMessageNumbers(
				imapClient,
				folder.name,
				1,
				imapFolderLastUid
			);
			await processMessageNumbers(
				messageNumbers,
				folder.user_id,
				folder.account_id,
				folder.id,
				imapFolderStatus
			);
		} else {
			logger.info(`${jobName}: FolderId ${accountFolder.id} has 0 messages to sync`);
		}
	} else {
		if (folder.status_uidvalidity != imapFolderStatus.uidValidity) {
			logger.warn(`${jobName}: FolderId ${accountFolder.id} uidvalidity changed.
            This error should fix itself after scanner job runs`);
			throw new IMAPUidValidityChangedException(
				`${jobName}: FolderId ${accountFolder.id} uidvalidity changed`
			);
		} else if (imapFolderStatus.messages == 0) {
			logger.info(`${jobName}: FolderId ${accountFolder.id} has 0 messages to sync`);
		} else if (folder.last_updated_msgno == imapFolderLastUid) {
			logger.info(`${jobName}: FolderId ${accountFolder.id} has no new messages to sync`);
		} else {
			const messageNumbers = await buildMessageNumbers(
				imapClient,
				folder.name,
				folder.last_updated_msgno ? folder.last_updated_msgno + 1 : 1,
				imapFolderLastUid
			);
			await processMessageNumbers(
				messageNumbers,
				folder.user_id,
				folder.account_id,
				folder.id,
				imapFolderStatus
			);
		}
	}
}

async function processMessageNumbers(
	messageNumbers: MessageNumber[],
	userId: string,
	accountId: string,
	folderId: string,
	imapFolderStatus: ImapFolderStatus
): Promise<void> {
	if (messageNumbers.length > 0) {
		const jobData = {
			userId,
			accountId,
			folderId,
			messageNumbers
		};
		const job = await scheduler.addJobByQueueName(ImportEmailQueue.name, jobData);
		logger.info(`${jobName}: Created job ${job?.id} to process ${messageNumbers.length} emails`);

		const updateResult = await folderService.updateFolder(folderId, {
			status_uidvalidity: imapFolderStatus.uidValidity,
			last_updated_msgno: messageNumbers[messageNumbers.length - 1].uid
		});

		if (Number(updateResult.numUpdatedRows) != 1) {
			logger.error(`${jobName}: Inadequate no. of rows updated: ${updateResult.numUpdatedRows}`);
		}
	}
}

async function buildMessageNumbers(
	imapClient: ImapFlow,
	folderName: string,
	lastUpdatedMsgNo: number,
	imapFolderLastUid: number
): Promise<MessageNumber[]> {
	let messageNumbers = await imapService.getMessageNumbers(
		imapClient,
		folderName,
		lastUpdatedMsgNo,
		imapFolderLastUid
	);
	messageNumbers = _.sortBy(messageNumbers, ['uid']);
	return messageNumbers.slice(0, BATCH_SIZE);
}
