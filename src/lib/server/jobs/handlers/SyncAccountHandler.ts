import { BaseHandler } from "./BaseHandler";
import * as accountService from '$lib/server/services/accountService';
import * as folderService from '$lib/server/services/folderService';
import * as imapService from '$lib/server/services/imapService';
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
import { ImportEmailQueue } from '../queues/ImportEmailQueue';

export class SyncAccountHandler extends BaseHandler {
    private readonly BATCH_SIZE = 200;

    async handle(): Promise<void> {
        let imapClient: ImapFlow;
        const allSyncingAccounts = await accountService.findAllSyncingAccounts();
        for (const syncingAccount of allSyncingAccounts) {
            const decryptedPassword = decrypt(syncingAccount.password);
            try {
                logger.info(`${this.jobName}: Logging in`);
                imapClient = await buildClient(
                    syncingAccount.email,
                    decryptedPassword,
                    syncingAccount.provider_host
                );
                logger.info(`${this.jobName}: Logged in`);
            } catch (error) {
                if (error instanceof IMAPTooManyRequestsException) {
                    logger.error(`${this.jobName}: Too many requests for Account ID: ${syncingAccount.id}`);
                    // TODO Add logic to backoff for a while before attempting again
                    throw error;
                } else if (error instanceof IMAPAuthenticationFailedException) {
                    logger.error(
                        `${this.jobName}: Authentication failed for Account ID ${syncingAccount.id}. Disabling account syncing`
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
                    logger.error(`${this.jobName}: ${error.message} for Account ID: ${syncingAccount.id}`);
                    // TODO Add logic to backoff for a while before attempting again
                    throw error;
                }
    
                logger.error(`${this.jobName}: ` + JSON.stringify(error));
                throw error;
            }
    
            const accountFolders = await folderService.findSyncingFoldersByUserAndAccount(
                syncingAccount.user_id,
                syncingAccount.id,
                false
            );
            const promises = accountFolders.map(async (accountFolder) => {
                try {
                    await this.processAccount(accountFolder, imapClient);
                } catch (error) {
                    if (error instanceof IMAPTooManyRequestsException) {
                        logger.error(`${this.jobName}: Too many requests for Account ID: ${accountFolder.account_id}`);
                        // TODO Add logic to backoff for a while before attempting again
                        throw error;
                    } else if (error instanceof IMAPAuthenticationFailedException) {
                        logger.error(
                            `${this.jobName}: Authentication failed for Account ID ${accountFolder.id}. Disabling account syncing`
                        );
                        await accountService.updateAccountSyncingStatus(
                            syncingAccount.user_id,
                            syncingAccount.id,
                            false
                        );
                        // TODO send notification to user
                    } else if (error instanceof FolderDeletedOnRemoteException) {
                        logger.warn(
                            `${this.jobName}: Folder ID ${accountFolder.id} was deleted on remote. Skipping account`
                        );
                    } else if (error instanceof IMAPGenericException) {
                        logger.error(`${this.jobName}: ${error.message} for Account ID: ${accountFolder.id}`);
                        // TODO Add logic to backoff for a while before attempting again
                        throw error;
                    } else {
                        logger.error(`${this.jobName}: ` + JSON.stringify(error));
                        throw error;
                    }
                }
            });
    
            logger.info(`${this.jobName}: Waiting for all folders to be processed`);
    
            try {
                await Promise.all(promises);
            } catch (error) {
                logger.error(`${this.jobName}: ${JSON.stringify(error)}`);
                throw error;
            }
    
            logger.info(`${this.jobName}: Logging out`);
            await imapClient.logout();
        }
    }

    public async processAccount(accountFolder: Folder, imapClient: ImapFlow): Promise<void> {
        // TODO Check if there can be multiple folders for a given account and user
        const folder = await folderService.findFolderById(accountFolder.id);
        const imapFolderStatus = await imapService.getFolderStatusByName(imapClient, folder.name);
        const imapFolderLastUid = imapFolderStatus.uidNext - 1;
    
        if (_.isNull(folder.last_updated_msgno)) {
            logger.info(`${this.jobName}: last_updated_msgno for folder id ${accountFolder.id} is null`);
            if (imapFolderStatus.messages > 0) {
                const messageNumbers = await this.buildMessageNumbers(
                    imapClient,
                    folder.name,
                    1,
                    imapFolderLastUid
                );
                await this.processMessageNumbers(
                    messageNumbers,
                    folder.user_id,
                    folder.account_id,
                    folder.id,
                    imapFolderStatus
                );
            } else {
                logger.info(`${this.jobName}: FolderId ${accountFolder.id} has 0 messages to sync`);
            }
        } else {
            logger.info(`${this.jobName}: last_updated_msgno for folder id ${accountFolder.id} is not null`);
            if (folder.status_uidvalidity != imapFolderStatus.uidValidity) {
                logger.warn(`${this.jobName}: FolderId ${accountFolder.id} uidvalidity changed.
                This error should fix itself after scanner job runs`);
                throw new IMAPUidValidityChangedException(
                    `${this.jobName}: FolderId ${accountFolder.id} uidvalidity changed`
                );
            } else if (imapFolderStatus.messages == 0) {
                logger.info(`${this.jobName}: FolderId ${accountFolder.id} has 0 messages to sync`);
            } else if (folder.last_updated_msgno == imapFolderLastUid) {
                logger.info(`${this.jobName}: FolderId ${accountFolder.id} has no new messages to sync`);
            } else {
                logger.info(`${this.jobName}: FolderId ${accountFolder.id} has new messages to sync`);
                const messageNumbers = await this.buildMessageNumbers(
                    imapClient,
                    folder.name,
                    folder.last_updated_msgno ? folder.last_updated_msgno + 1 : 1,
                    imapFolderLastUid
                );
                await this.processMessageNumbers(
                    messageNumbers,
                    folder.user_id,
                    folder.account_id,
                    folder.id,
                    imapFolderStatus
                );
            }
        }
    }

    public async processMessageNumbers(
        messageNumbers: MessageNumber[],
        userId: string,
        accountId: string,
        folderId: string,
        imapFolderStatus: ImapFolderStatus
    ): Promise<void> {
        if (messageNumbers.length <= 0) {
            logger.info(`${this.jobName}: No job needs to be created`);
            return;
        }
    
        const jobData = {
            userId,
            accountId,
            folderId,
            messageNumbers
        };
        const job = await scheduler.addJobByQueueName(ImportEmailQueue.name, jobData);
        logger.info(`${this.jobName}: Created job ${job?.id} to process ${messageNumbers.length} emails`);
    
        const updateResult = await folderService.updateFolder(folderId, {
            status_uidvalidity: imapFolderStatus.uidValidity,
            last_updated_msgno: messageNumbers[messageNumbers.length - 1].uid
        });
    
        if (Number(updateResult.numUpdatedRows) != 1) {
            logger.error(`${this.jobName}: Inadequate no. of rows updated: ${updateResult.numUpdatedRows}`);
        }
    }
    
    public async buildMessageNumbers(
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
        return messageNumbers.slice(0, this.BATCH_SIZE);
    }
}