import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';
import * as userService from '$lib/server/services/userService';
import * as accountService from '$lib/server/services/accountService';
import pLimit from 'p-limit';
import { deleteAllUserSessions } from '../../../../utils/auth';

let jobName: string;

export async function deleteUser(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	// set max execution time of 10 minutes
	setTimeout(() => new Error(`${jobName}: Timed out`), 10 * 60 * 1000);

	const deletedUsers = await userService.findDeletedUsers();
	for (const deletedUser of deletedUsers) {
		logger.info(`${jobName}: Processing user id ${deletedUser.id} for deletion`);

		// Delete all user sessions (if any)
		await deleteAllUserSessions(deletedUser.id);

		const accounts = await accountService.findAccountsByUserId(deletedUser.id);

		// delete user if user has not account(s) configured
		if (accounts.length === 0) {
			logger.info(`${jobName}: Deleting user id ${deletedUser.id}`);
			const result = await userService.deleteUser(deletedUser.id);
			if (result.numDeletedRows < 1) {
				logger.error(`${jobName}: Failed to delete user id ${deletedUser.id}`);
			}
		} else {
			// Flag all active accounts as deleted
			const accountsActive = accounts.filter((account) => !account.deleted);
			if (accountsActive.length > 0) {
				const promisesLimit = pLimit(10);
				const promises: Promise<void>[] = [];
				accountsActive.forEach((account) => {
					logger.warn(`${jobName}: Soft deleting account id ${account.id}`);
					promises.push(
						promisesLimit(() =>
							accountService.softDeleteAccountByUserId(deletedUser.id, account.id)
						)
					);
				});

				try {
					await Promise.all(promises);
				} catch (error) {
					logger.error(`${jobName}: ${JSON.stringify(error)}`);
					throw error;
				}
			}

			const accountsPendingDeletion = accounts.filter((account) => account.deleted);
			if (accountsPendingDeletion.length > 0) {
				// warn and do nothing
				const accountPendingDeletionIds = accountsPendingDeletion.map((account) => {
					return account.id;
				});
				logger.warn(
					`${jobName}: Waiting for account ids ${accountPendingDeletionIds.toString()} to be deleted`
				);
			}
		}
	}

	logger.info(`${jobName}: Finished running job`);
}
