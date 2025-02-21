import { BaseHandler } from './BaseHandler';
import { logger } from '../../../../utils/logger';
import * as emailService from '$lib/server/services/emailService';
import * as s3Service from '$lib/server/services/s3Service';
import { parseEmail } from '../../../../utils/emailHelper';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { searchService } from '$lib/server/services/searchService';

// TODO Handle IndexEmail jobs that get stuck if indexer_processing=true
// but the job fails. Currently the job doesn't pick it up in next run.
export class IndexEmailHandler extends BaseHandler {
	private readonly EMAIL_PROCESS_LIMIT = 20;

	async handle(): Promise<void> {
		const emailsWithSource = await this.getEmailsWithSource();
		if (emailsWithSource.length === 0) {
			logger.info(`${this.jobName}: Found no emails to process.`);
			return;
		}

		const parsedEmails = await this.parseEmails(emailsWithSource);

		const emailIds: string[] = [];
		const documentsToIndex: {
			id: string;
			accountId: string;
			folderId: string;
			userId: string;
			textBody: string;
			subject?: string;
		}[] = [];
		parsedEmails.map((parsedEmail) => {
			emailIds.push(parsedEmail.id);
			if (parsedEmail.parsedEmail) {
				documentsToIndex.push({
					id: parsedEmail.id,
					accountId: parsedEmail.account_id,
					folderId: parsedEmail.folder_id,
					userId: parsedEmail.user_id,
					subject: parsedEmail.parsedEmail.subject,
					textBody: parsedEmail.parsedEmail.text ? parsedEmail.parsedEmail.text : ''
				});
			}
		});

		try {
			await searchService.addDocuments(documentsToIndex);
		} catch (error) {
			await emailService.updateIndexingStatus(emailIds, {
				indexed: false,
				indexerProcessing: false
			});
			throw error;
		}

		logger.info(`${this.jobName}: Email Ids to process ${JSON.stringify(emailIds)}`);
		await emailService.updateIndexingStatus(emailIds, { indexed: true, indexerProcessing: false });
	}

	public async parseEmails(
		emailsWithSource: {
			id: string;
			account_id: string;
			folder_id: string;
			user_id: string;
			sourceData: GetObjectCommandOutput | undefined;
		}[]
	) {
		const promises = emailsWithSource.map(async (emailWithSource) => {
			let parsedEmail;
			if (emailWithSource.sourceData) {
				const stringSource = await emailWithSource.sourceData.Body?.transformToString();
				parsedEmail = await parseEmail(stringSource);
			}

			return {
				id: emailWithSource.id,
				account_id: emailWithSource.account_id,
				folder_id: emailWithSource.folder_id,
				user_id: emailWithSource.user_id,
				parsedEmail: parsedEmail ?? undefined
			};
		});

		try {
			const parsedEmails = await Promise.all(promises);
			return parsedEmails;
		} catch (error) {
			logger.error(`${this.jobName}: ${JSON.stringify(error)}`);
			throw error;
		}
	}

	public async getEmailsWithSource() {
		const emails = await emailService.updateIndexerProcessing(true, this.EMAIL_PROCESS_LIMIT);

		const promises = emails.map(async (email) => {
			let emailSourceData;
			if (email.has_source) {
				emailSourceData = await s3Service.getS3Data(email.user_id, email.folder_id, email.id);
			}
			return {
				id: email.id,
				account_id: email.account_id,
				folder_id: email.folder_id,
				user_id: email.user_id,
				sourceData: emailSourceData ?? undefined
			};
		});

		try {
			const emailsWithData = await Promise.all(promises);
			return emailsWithData;
		} catch (error) {
			logger.error(`${this.jobName}: ${JSON.stringify(error)}`);
			throw error;
		}
	}
}
