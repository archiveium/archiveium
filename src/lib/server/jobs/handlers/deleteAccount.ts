import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';
import * as accountService from '$lib/server/services/accountService';
import * as folderService from '$lib/server/services/folderService';
import * as s3Service from '$lib/server/services/s3Service';

export async function deleteAccount(job: Job): Promise<void> {
	logger.info(`Running ${job.name} job`);

	const allDeletedAccounts = await accountService.findDeletedAccounts();
	for (const deletedAccount of allDeletedAccounts) {
		// TODO Can there be a case wherein account is flagged for deletion
		// folders are flagged as well but new one's still get added?
		const folders = await folderService.findDeletedFoldersByUserAndAccount(
			deletedAccount.user_id,
			deletedAccount.id
		);

		logger.info('Started deleting S3 objects');
		const promises = folders.map((folder) => {
			logger.info(`Deleting S3 objects in folder ${folder.id}`);
			return s3Service.deleteS3Objects(`${folder.user_id}/${folder.id}`);
		});
		await Promise.all(promises);
		logger.info('Finished deleting S3 objects');

		logger.info('Started deleting account, folder & emails');
		await accountService.deleteAccount(deletedAccount.id);
		logger.info('Finished deleting account, folder & emails');
	}

	logger.info(`Finished running ${job.name} job`);
}
