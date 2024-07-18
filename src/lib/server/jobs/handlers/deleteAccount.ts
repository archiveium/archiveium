import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';
import * as accountService from '$lib/server/services/accountService';
import * as folderService from '$lib/server/services/folderService';
import * as s3Service from '$lib/server/services/s3Service';

let jobName: string;

export async function deleteAccount(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	// set max execution time of 10 minutes
	setTimeout(() => new Error(`${jobName}: Timed out`), 10 * 60 * 1000);

	const allDeletedAccounts = await accountService.findDeletedAccounts();
	for (const deletedAccount of allDeletedAccounts) {
		// TODO Can there be a case wherein account is flagged for deletion
		// folders are flagged as well but new one's still get added?
		const folders = await folderService.findDeletedFoldersByUserAndAccount(
			deletedAccount.user_id,
			deletedAccount.id
		);

		logger.info(`${jobName}: Started deleting S3 objects`);
		const promises = folders.map((folder) => {
			logger.info(`${jobName}: Deleting S3 objects in folder ${folder.id}`);
			return s3Service.deleteS3Objects(`${folder.user_id}/${folder.id}`);
		});

		try {
			await Promise.all(promises);
		} catch (error) {
			logger.error(`${jobName}: ${JSON.stringify(error)}`);
			throw error;
		}

		logger.info(`${jobName}: Finished deleting S3 objects`);

		logger.info(`${jobName}: Started deleting account, folder & emails`);
		await accountService.deleteAccount(deletedAccount.id);
		logger.info(`${jobName}: Finished deleting account, folder & emails`);
	}

	logger.info(`${jobName}: Finished running job`);
}
