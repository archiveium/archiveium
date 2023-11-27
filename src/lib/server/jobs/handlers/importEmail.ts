import type { Job } from "bullmq";
import { logger } from "../../../../utils/logger";
import type { ImportEmailJobPayload } from "../../../../types/job";
import * as folderService from '$lib/server/services/folderService';
import * as accountService from '$lib/server/services/accountService';
import * as imapService from '$lib/server/services/imapService';
import * as emailService from '$lib/server/services/emailService';
import { AccountDeletedException, AccountSyncingPausedException } from "../../../../exceptions/account";
import { first, last } from "lodash";
import { MissingStartEndSeqException } from "../../../../exceptions/job";
import type { ImapEmail } from "../../../../types/imap";
import {  FolderDeletedException, FolderDeletedOnRemoteException, FolderNotFoundException, FolderNotSyncingException } from "../../../../exceptions/folder";
import { 
    IMAPAuthenticationFailedException,
    IMAPGenericException,
    IMAPTooManyRequestsException,
    IMAPUserAuthenticatedNotConnectedException
} from "../../../../exceptions/imap";
import pLimit from "p-limit";

// TODO Add a progress bar to show how many emails have been imported for each account
export async function importEmail(job: Job): Promise<void> {
    logger.info(`Running ${job.name} job`);

    const jobData = job.data as ImportEmailJobPayload;

    try {
        const folder = await folderService.findFolderById(jobData.folderId);

        const account = await accountService.findAccountWithProviderByUserIdAndAccountId(folder.user_id, folder.account_id);
        if (account.deleted) {
            throw new AccountDeletedException(`Account ${folder.account_id} was deleted`);
        } else if (!account.syncing) {
            throw new AccountSyncingPausedException(`Account syncing ${folder.account_id} was paused`);
        }

        const imapClient = await imapService.buildClient(account.email, account.password, account.provider_host);

        // TODO Pass startSeq and endSeq from scheduler
        const startSeq = first(jobData.messageNumbers)?.uid;
        const endSeq = last(jobData.messageNumbers)?.uid;

        if (startSeq === undefined || endSeq === undefined) {
            logger.error('Flagging job as failed');
            throw new MissingStartEndSeqException(JSON.stringify(jobData));
        } else {
            logger.info(`Processing job ${JSON.stringify(jobData)}`);
            const emails = await imapService.getEmails(imapClient, folder, startSeq, endSeq);

            const promisesLimit = pLimit(10);
            const promises: Promise<void>[] = [];
            emails.forEach((email: ImapEmail) => {
                promisesLimit(() => emailService.saveAndSyncWithS3(email, folder, account.provider_check_email_id));
            });
            await Promise.all(promises);
        }
    } catch (error) {
        if (
            error instanceof FolderDeletedException ||
            error instanceof AccountDeletedException ||
            error instanceof FolderDeletedOnRemoteException ||
            error instanceof FolderNotFoundException
        ) {
            // FIXME Check why this error is thrown when re-processing a job
            logger.warn(error.message);
            logger.warn(`Ignoring job since account/folder was deleted locally or on remote`, {
                folderId: jobData.folderId,
                accountId: jobData.accountId
            });
        } else if (error instanceof IMAPTooManyRequestsException) {
            // This will retry job as per configured attemps and backoff
            logger.warn(`Too many requests for Job ID: ${job.id}`);
            throw error;
        } else if (error instanceof IMAPAuthenticationFailedException) {
            // TODO send notification to user
            logger.error(`Authentication failed for Account ID ${jobData.accountId}. Disabling syncing`);
            await accountService.updateAccountSyncingStatus(jobData.userId, jobData.accountId, false);
        } else if (
            error instanceof IMAPGenericException ||
            error instanceof IMAPUserAuthenticatedNotConnectedException
        ) {
            logger.error(`${error.message} for Job ID: ${job.id}`);
            throw error;
        } else if (
            error instanceof AccountSyncingPausedException ||
            error instanceof FolderNotSyncingException
        ) {
            // TODO Rethink handling of account when syncing is paused
            // Avoid db read and write unnecessarily, maybe a separate table
            // with account and folder id as separate columns
            logger.warn(`Account/Folder syncing paused. Skipping job: ${error.message}`);
        } else {
            logger.error(`[process]` + JSON.stringify(error));
            throw error;
        }
    }

    logger.info(`Finished running ${job.name} job`);
}