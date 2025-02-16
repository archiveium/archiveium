import { BaseHandler } from './BaseHandler';
import * as userService from '$lib/server/services/userService';
import { logger } from '../../../../utils/logger';

export class EmailVerificationHandler extends BaseHandler {
	async handle(): Promise<void> {
		const allUnverifiedUsers = await userService.findUnverifiedUsers();
		for (const unverifiedUser of allUnverifiedUsers) {
			logger.info(`${this.jobName}: Processing user ${unverifiedUser.email}`);
			await userService.sendUserVerificationEmail(unverifiedUser.email, unverifiedUser.id);
			await userService.setUserNotificationDate(unverifiedUser.id, 'NOW()');
			logger.info(`${this.jobName}: Finished processing user ${unverifiedUser.email}`);
		}
	}
}
