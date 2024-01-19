import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';
import * as userService from '$lib/server/services/userService';

export async function emailVerification(job: Job): Promise<void> {
	logger.info(`Running ${job.name} job`);
	const allUnverifiedUsers = await userService.findUnverifiedUsers();
	for (const unverifiedUser of allUnverifiedUsers) {
		logger.info(`Processing user ${unverifiedUser.email}`);
		await userService.sendUserVerificationEmail(unverifiedUser.email, unverifiedUser.id);
		await userService.setUserNotificationDate(unverifiedUser.id, 'NOW()');
		logger.info(`Finished processing user ${unverifiedUser.email}`);
	}
	logger.info(`Finished running ${job.name} job`);
}
