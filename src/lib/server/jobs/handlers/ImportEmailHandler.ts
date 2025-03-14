import { BaseHandler } from './BaseHandler';
import { logger } from '../../../../utils/logger';
import type { ImportEmailJobPayload } from '../../../../types/job';
import * as folderService from '$lib/server/services/folderService';
import * as accountService from '$lib/server/services/accountService';
import * as imapService from '$lib/server/services/imapService';
import * as emailService from '$lib/server/services/emailService';
import {
	AccountDeletedException,
	AccountSyncingPausedException
} from '../../../../exceptions/account';
import _ from 'lodash';
import { MissingStartEndSeqException } from '../../../../exceptions/job';
import type { ImapEmail } from '../../../../types/imap';
import {
	FolderDeletedException,
	FolderDeletedOnRemoteException,
	FolderNotFoundException,
	FolderNotSyncingException
} from '../../../../exceptions/folder';
import {
	IMAPAuthenticationFailedException,
	IMAPGenericException,
	IMAPTooManyRequestsException,
	IMAPUserAuthenticatedNotConnectedException
} from '../../../../exceptions/imap';
import pLimit from 'p-limit';
import { decrypt } from '../../../../utils/encrypter';

export class ImportEmailHandler extends BaseHandler {
	async handle(): Promise<void> {
		const jobData = this.getJobData<ImportEmailJobPayload>();

		try {
			const folder = await folderService.findFolderById(jobData.folderId);

			const account = await accountService.findAccountWithProviderByUserIdAndAccountId(
				folder.user_id,
				folder.account_id
			);
			if (account.deleted) {
				throw new AccountDeletedException(
					`${this.jobName}: Account ${folder.account_id} was deleted`
				);
			} else if (!account.syncing) {
				throw new AccountSyncingPausedException(
					`${this.jobName}: Account syncing ${folder.account_id} was paused`
				);
			}

			const decryptedPassword = decrypt(account.password);
			const imapClient = await imapService.buildClient({
				username: account.email,
				password: decryptedPassword,
				host: account.provider_host,
				port: account.provider_port,
				secure: account.provider_secure
			});

			// TODO Pass startSeq and endSeq from scheduler
			const startSeq = _.first(jobData.messageNumbers)?.uid;
			const endSeq = _.last(jobData.messageNumbers)?.uid;

			if (startSeq === undefined || endSeq === undefined) {
				logger.error(`${this.jobName}: Flagging job as failed`);
				throw new MissingStartEndSeqException(JSON.stringify(jobData));
			} else {
				logger.info(`${this.jobName}: Processing job ${JSON.stringify(jobData)}`);
				const emails = await imapService.getEmails(imapClient, folder, startSeq, endSeq);

				const promisesLimit = pLimit(10);
				const promises: Promise<void>[] = [];
				emails.forEach((email: ImapEmail) => {
					promises.push(
						promisesLimit(() =>
							emailService.saveAndSyncWithS3(email, folder, account.provider_check_email_id)
						)
					);
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
				logger.warn(
					`${this.jobName}: Ignoring job since account/folder was deleted locally or on remote`,
					{
						folderId: jobData.folderId,
						accountId: jobData.accountId
					}
				);
			} else if (error instanceof IMAPTooManyRequestsException) {
				// This will retry job as per configured attempts and backoff
				logger.warn(`${this.jobName}: Too many requests for Job Id ${this.getJobId()}`);
				throw error;
			} else if (error instanceof IMAPAuthenticationFailedException) {
				// TODO send notification to user
				logger.error(
					`${this.jobName}: Authentication failed for Account ID ${jobData.accountId}. Disabling syncing`
				);
				await accountService.updateAccountSyncingStatus(jobData.userId, jobData.accountId, false);
			} else if (
				error instanceof IMAPGenericException ||
				error instanceof IMAPUserAuthenticatedNotConnectedException
			) {
				logger.error(`${this.jobName}: Error ${error.message} for Job Id ${this.getJobId()}`);
				throw error;
			} else if (
				error instanceof AccountSyncingPausedException ||
				error instanceof FolderNotSyncingException
			) {
				// TODO Rethink handling of account when syncing is paused
				// Avoid db read and write unnecessarily, maybe a separate table
				// with account and folder id as separate columns
				logger.warn(
					`${this.jobName}: Account/Folder syncing paused. Skipping job with error ${error.message}`
				);
			} else {
				logger.error(`${this.jobName}: ` + JSON.stringify(error));
				throw error;
			}
		}
	}
}
