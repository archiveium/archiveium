import { BaseHandler } from "./BaseHandler";
import * as accountService from '../../services/accountService';
import * as folderService from '../../services/folderService';
import * as s3Service from '../../services/s3Service';
import { logger } from "../../../../utils/logger";
import { meilisearch } from "$lib/server/search/connection";
// import timersPromises from "node:timers/promises";

export class DeleteAccountHandler extends BaseHandler {
    async handle(): Promise<void> {
		const index = meilisearch.index('emails');
		const allDeletedAccounts = await accountService.findDeletedAccounts();
		for (const deletedAccount of allDeletedAccounts) {
			logger.info(`${this.jobName}: Started deleting indexed documents`);

			let estimatedTotalHits = 0;
			do {
				const enqueuedTask = await index.deleteDocuments({
					filter: `userId = ${deletedAccount.user_id} AND accountId = ${deletedAccount.id}`
				});
				const task = await index.waitForTask(enqueuedTask.taskUid, {
					timeOutMs: 10 * 1000, // 10 seconds
					intervalMs: 100 // time to wait before checking status of task 
				});
				logger.info(`${this.jobName}: Completed task info ${JSON.stringify(task)}`);

				const searchRes = await index.search('', {
					limit: 0,
					filter: `userId = ${deletedAccount.user_id} AND accountId = ${deletedAccount.id}`
				});
				estimatedTotalHits = searchRes.estimatedTotalHits;
			} while (estimatedTotalHits > 0);
			logger.info(`${this.jobName}: Finished deleting indexed documents`);

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
        // await timersPromises.setTimeout(2000, null);
    }
}