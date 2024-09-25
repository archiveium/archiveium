import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';
import * as emailService from '$lib/server/services/emailService';
import * as s3Service from '$lib/server/services/s3Service';
import { parseEmail } from '../../../../utils/emailHelper';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { meilisearch } from '$lib/server/search/connection';
import { SearchTaskTimedOutException } from '../../../../exceptions/search';

let jobName: string;
const EMAIL_PROCESS_LIMIT = 20;

export async function indexEmail(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	// TODO on account delete, delete index

	const emailsWithSource = await getEmailsWithSource();
	if (emailsWithSource.length === 0) {
		logger.info(`${jobName}: Found no emails to process.`);
		return;
	}

	const parsedEmails = await parseEmails(emailsWithSource);

	const emailIds: string[] = [];
	const documentsToIndex: { id: string, accountId: string, folderId: string, userId: string, subject?: string }[] = [];
	parsedEmails.map((parsedEmail) => {
		emailIds.push(parsedEmail.id);
		documentsToIndex.push({
			id: parsedEmail.id,
			accountId: parsedEmail.account_id,
			folderId: parsedEmail.folder_id,
			userId: parsedEmail.user_id,
			subject: parsedEmail.parsedEmail.subject,
		});
	});

	const index = meilisearch.index('emails');
	const enqueuedTask = await index.addDocuments(documentsToIndex);
	logger.info(`${jobName}: Enqueued task info ${JSON.stringify(enqueuedTask)}`);

	// wait for task to complete before flagging job as success
	const task = await index.waitForTask(enqueuedTask.taskUid, {
		timeOutMs: 10 * 1000, // 10 seconds
		intervalMs: 100 // time to wait before checking status of task 
	});
	logger.info(`${jobName}: Completed task info ${JSON.stringify(task)}`);
	logger.info(`${jobName}: Email Ids to process ${JSON.stringify(emailIds)}`);

	if (task.status !== 'succeeded' || task.error) {
		await emailService.updateIndexingStatus(emailIds, { indexed: false, indexerProcessing: false });
		throw new SearchTaskTimedOutException(JSON.stringify(task));
	}

	await emailService.updateIndexingStatus(emailIds, { indexed: true, indexerProcessing: false });

	logger.info(`${jobName}: Finished running job`);
}

async function parseEmails(
	emailsWithSource: { id: string, account_id: string, folder_id: string, user_id: string, sourceData: GetObjectCommandOutput }[]
) {
	const promises = emailsWithSource.map(async (emailWithSource) => {
		const stringSource = await emailWithSource.sourceData.Body?.transformToString();
		const parsedEmail = await parseEmail(stringSource);
		return {
			id: emailWithSource.id,
			account_id: emailWithSource.account_id,
			folder_id: emailWithSource.folder_id,
			user_id: emailWithSource.user_id,
			parsedEmail,
		};
	});

	try {
		const parsedEmails = await Promise.all(promises);
		return parsedEmails;
	} catch (error) {
		logger.error(`${jobName}: ${JSON.stringify(error)}`);
		throw error;
	}
}

async function getEmailsWithSource() {
	const emails = await emailService.updateIndexerProcessing(true, EMAIL_PROCESS_LIMIT);

	const promises = emails.map(async (email) => {
		const emailSourceData = await s3Service.getS3Data(email.user_id, email.folder_id, email.id); 
		return {
			id: email.id,
			account_id: email.account_id,
			folder_id: email.folder_id,
			user_id: email.user_id,
			sourceData: emailSourceData,
		};
	});

	try {
		const emailsWithData = await Promise.all(promises);
		return emailsWithData;
	} catch (error) {
		logger.error(`${jobName}: ${JSON.stringify(error)}`);
		throw error;
	}
}
