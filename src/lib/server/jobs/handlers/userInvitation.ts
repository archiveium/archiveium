import * as userInvitationService from '$lib/server/services/userInvitiationService';
import * as registrationService from '$lib/server/services/registrationService';
import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';

let jobName: string;

export async function userInvitation(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	// set max execution time of 10 minutes
	setTimeout(() => new Error(`${jobName}: Timed out`), 10 * 60 * 1000);

	try {
		const allInvitedUsers = await userInvitationService.findAllInvitedUsers();
		const promises = allInvitedUsers.map(async (invitedUser) => {
			logger.info(`${jobName}: Processing user ${invitedUser.username}`);
			await registrationService.sendUserInvitation(invitedUser.username);
			await userInvitationService.updateInvitedUser(invitedUser.id);
			logger.info(`${jobName}: Finished processing user ${invitedUser.username}`);
		});
		await Promise.all(promises);
	} catch (error) {
		logger.error(`${jobName}: ` + JSON.stringify(error));
		throw error;
	}

	logger.info(`${jobName}: Finished running ${job.name} job`);
}
