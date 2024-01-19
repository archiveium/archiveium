import * as userInvitationService from '$lib/server/services/userInvitiationService';
import * as registrationService from '$lib/server/services/registrationService';
import { logger } from '../../../../utils/logger';
import type { Job } from 'bullmq';

export async function userInvitation(job: Job): Promise<void> {
	logger.info(`Running ${job.name} job`);
	try {
		const allInvitedUsers = await userInvitationService.findAllInvitedUsers();
		const promises = allInvitedUsers.map(async (invitedUser) => {
			logger.info(`Processing user ${invitedUser.username}`);
			await registrationService.sendUserInvitation(invitedUser.username);
			await userInvitationService.updateInvitedUser(invitedUser.id);
			logger.info(`Finished processing user ${invitedUser.username}`);
		});
		await Promise.all(promises);
	} catch (error) {
		logger.error(error);
		throw error;
	}

	logger.info(`Finished running ${job.name} job`);
}
