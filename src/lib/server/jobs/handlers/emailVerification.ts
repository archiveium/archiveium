import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';
import * as userService from '$lib/server/services/userService';

let jobName: string;

export async function emailVerification(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	// set max execution time of 10 minutes
	setTimeout(() => new Error(`${jobName}: Timed out`), 10 * 60 * 1000);

	const allUnverifiedUsers = await userService.findUnverifiedUsers();
	for (const unverifiedUser of allUnverifiedUsers) {
		logger.info(`${jobName}: Processing user ${unverifiedUser.email}`);
		await userService.sendUserVerificationEmail(unverifiedUser.email, unverifiedUser.id);
		await userService.setUserNotificationDate(unverifiedUser.id, 'NOW()');
		logger.info(`${jobName}: Finished processing user ${unverifiedUser.email}`);
	}
	logger.info(`${jobName}: Finished running job`);
}
