import * as accountService from '$lib/server/services/accountService';
import * as folderService from '$lib/server/services/folderService';
import * as imapService from '$lib/server/services/imapService';
import type { Job } from 'bullmq';
import { logger } from '../../../../utils/logger';
import type { ImapFlow } from 'imapflow';
import { buildClient } from '$lib/server/services/imapService';
import { 
    IMAPAuthenticationFailed,
    IMAPGenericException,
    IMAPTooManyRequests,
    IMAPUidValidityChanged,
    IMAPUserAuthenticatedNotConnected 
} from '../../../../exceptions/imap';
import type { Folder } from '../../../../types/folder';
import type { ImapFolderStatus, MessageNumber } from '../../../../types/imap';
import { JobScheduler } from '..';
import { isNull, sortBy } from 'lodash';
import { FolderDeletedOnRemoteException } from '../../../../exceptions/folder';

const BATCH_SIZE = 200;

export async function syncAccount(job: Job): Promise<void> {
    logger.info(`Running ${job.name} job`);

    const jobScheduler = new JobScheduler();
    const allSyncingAccounts = await accountService.findAllSyncingAccounts();
    allSyncingAccounts.forEach(async (syncingAccount) => {
        let imapClient: ImapFlow;
        try {
            imapClient = await buildClient(
                syncingAccount.email,
                syncingAccount.password,
                syncingAccount.provider_host
            );
        } catch (error) {
            if (error instanceof IMAPTooManyRequests) {
                logger.error(`Too many requests for Account ID: ${syncingAccount.id}`);
                // TODO Add logic to backoff for a while before attempting again
                throw error;
            } else if (error instanceof IMAPAuthenticationFailed) {
                logger.error(`Authentication failed for Account ID ${syncingAccount.id}. Disabling account syncing`);
                await accountService.updateAccountSyncingStatus(syncingAccount.user_id, syncingAccount.id, false);
                // TODO send notification to user
                return;
            } else if (
                error instanceof IMAPGenericException ||
                error instanceof IMAPUserAuthenticatedNotConnected
            ) {
                logger.error(`${error.message} for Account ID: ${syncingAccount.id}`);
                // TODO Add logic to backoff for a while before attempting again
                throw error;
            }
            throw error;
        }

        const accountFolders = await folderService.findSyncingFoldersByUserAndAccount(
            syncingAccount.user_id,
            syncingAccount.id,
            false
        );
        const promises = accountFolders.map(async (accountFolder) => {
            try {
                await processAccount(accountFolder, imapClient, jobScheduler);
            } catch (error) {
                if (error instanceof IMAPTooManyRequests) {
                    logger.error(`Too many requests for Account ID: ${accountFolder.account_id}`);
                    // TODO Add logic to backoff for a while before attempting again
                    throw error;
                } else if (error instanceof IMAPAuthenticationFailed) {
                    logger.error(`Authentication failed for Account ID ${accountFolder.id}. Disabling account syncing`);
                    await accountService.updateAccountSyncingStatus(syncingAccount.user_id, syncingAccount.id, false);
                    // TODO send notification to user
                } else if (error instanceof FolderDeletedOnRemoteException) {
                    logger.warn(`Folder ID ${accountFolder.id} was deleted on remote. Skipping account`);
                } else if (error instanceof IMAPGenericException) {
                    logger.error(`${error.message} for Account ID: ${accountFolder.id}`);
                    // TODO Add logic to backoff for a while before attempting again
                    throw error;
                } else {
                    logger.error(`[schedule]` + JSON.stringify(error));
                    throw error;
                }
            }
        });

        await Promise.all(promises);
        await imapClient.logout();
    });

    logger.info(`Finished running ${job.name} job`);
}

async function processAccount(accountFolder: Folder, imapClient: ImapFlow, jobScheduler: JobScheduler): Promise<void> {
    const folders = await folderService.findFoldersByAccountIdAndUserId(accountFolder.user_id, accountFolder.id);
    // TODO Check if there can be multiple folders for a given account and user
    const folder = folders[0];
    const imapFolderStatus = await imapService.getFolderStatusByName(imapClient, folder.name);
    const imapFolderLastUid = imapFolderStatus.uidNext - 1;

    if (isNull(folder.last_updated_msgno)) {
        if (imapFolderStatus.messages > 0) {
            const messageNumbers = await buildMessageNumbers(
                imapClient,
                folder.name,
                1,
                imapFolderLastUid,
            );
            await processMessageNumbers(
                messageNumbers,
                folder.user_id,
                folder.account_id,
                folder.id,
                imapFolderStatus,
                jobScheduler
            );
        } else {
            logger.info(`FolderId ${accountFolder.id} has 0 messages to sync`);
        }
    } else {
        if (folder.status_uidvalidity != imapFolderStatus.uidValidity) {
            logger.warn(`FolderId ${accountFolder.id} uidvalidity changed.
            This error should fix itself after scanner job runs`);
            throw new IMAPUidValidityChanged(`FolderId ${accountFolder.id} uidvalidity changed`);
        } else if (imapFolderStatus.messages == 0) {
            logger.info(`FolderId ${accountFolder.id} has 0 messages to sync`);
        } else if (folder.last_updated_msgno == imapFolderLastUid) {
            logger.info(`FolderId ${accountFolder.id} has no new messages to sync`);
        } else {
            const messageNumbers = await buildMessageNumbers(
                imapClient,
                folder.name,
                folder.last_updated_msgno ? folder.last_updated_msgno + 1 : 1,
                imapFolderLastUid,
            );
            await processMessageNumbers(
                messageNumbers,
                folder.user_id,
                folder.account_id,
                folder.id,
                imapFolderStatus,
                jobScheduler
            );
        }
    }
}

async function processMessageNumbers(
    messageNumbers: MessageNumber[],
    userId: string,
    accountId: string,
    folderId: string,
    imapFolderStatus: ImapFolderStatus,
    jobScheduler: JobScheduler,
): Promise<void> {
    if (messageNumbers.length > 0) {
        const job = await jobScheduler.addJobToExistingQueue(
            JobScheduler.QUEUE_IMPORT_EMAIL,
            { userId, accountId, folderId, messageNumbers },
        );
        logger.info(`Created job ${job?.id} to process ${messageNumbers.length} emails`);

        const updateResult = await folderService.updateFolder(
            folderId,
            {
                status_uidvalidity: imapFolderStatus.uidValidity,
                last_updated_msgno: messageNumbers[messageNumbers.length - 1].uid,
            }
        );

        if (Number(updateResult.numUpdatedRows) != 1) {
            logger.error(`Updated inadequate no. of rows updated: ${updateResult.numUpdatedRows}`);
        }
    }
}

async function buildMessageNumbers(
    imapClient: ImapFlow,
    folderName: string,
    lastUpdatedMsgNo: number,
    imapFolderLastUid: number
): Promise<MessageNumber[]> {
    let messageNumbers = await imapService.getMessageNumbers(imapClient, folderName, lastUpdatedMsgNo, imapFolderLastUid);
    messageNumbers = sortBy(messageNumbers, ['uid']);
    return messageNumbers.slice(0, BATCH_SIZE);
}