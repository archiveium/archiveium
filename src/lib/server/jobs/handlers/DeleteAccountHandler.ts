import { BaseHandler } from './BaseHandler';
import * as accountService from '../../services/accountService';
import * as folderService from '../../services/folderService';
import * as s3Service from '../../services/s3Service';
import { logger } from '../../../../utils/logger';
import { searchService } from '$lib/server/services/searchService';
import timersPromises from 'node:timers/promises';

export class DeleteAccountHandler extends BaseHandler {
	async handle(): Promise<void> {
		const allDeletedAccounts = await accountService.findDeletedAccounts();
		for (const deletedAccount of allDeletedAccounts) {
			let estimatedTotalHits = 0;
			do {
				logger.info(`${this.jobName}: Deleting indexed documents`);
				await searchService.deleteDocuments({
					filter: `userId = ${deletedAccount.user_id} AND accountId = ${deletedAccount.id}`
				});
				logger.info(`${this.jobName}: Finished deleting indexed documents`);

				// wait before checking count
				// this allows any on-going IndexEmail job to finish running
				await timersPromises.setTimeout(5 * 1000);
				estimatedTotalHits = await searchService.count(
					`userId = ${deletedAccount.user_id} AND accountId = ${deletedAccount.id}`
				);
				logger.info(`${this.jobName}: Found additional ${estimatedTotalHits} indexed documents`);
			} while (estimatedTotalHits > 0);

			// TODO Can there be a case wherein account is flagged for deletion
			// folders are flagged as well but new one's still get added?
			const folders = await folderService.findDeletedFoldersByUserAndAccount(
				deletedAccount.user_id,
				deletedAccount.id
			);

			logger.info(`${this.jobName}: Started deleting S3 objects`);
			const promises = folders.map((folder) => {
				logger.info(`${this.jobName}: Deleting S3 objects in folder ${folder.id}`);
				return s3Service.deleteS3Objects(`${folder.user_id}/${folder.id}`);
			});

			try {
				await Promise.all(promises);
			} catch (error) {
				logger.error(`${this.jobName}: ${JSON.stringify(error)}`);
				throw error;
			}

			logger.info(`${this.jobName}: Finished deleting S3 objects`);

			logger.info(`${this.jobName}: Started deleting account, folder & emails`);
			await accountService.deleteAccount(deletedAccount.id);
			logger.info(`${this.jobName}: Finished deleting account, folder & emails`);
		}
	}
}
