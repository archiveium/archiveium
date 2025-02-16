import { BaseHandler } from './BaseHandler';
import * as userInvitationService from '$lib/server/services/userInvitiationService';
import * as registrationService from '$lib/server/services/registrationService';
import { logger } from '../../../../utils/logger';

export class UserInvitationHandler extends BaseHandler {
	async handle(): Promise<void> {
		const allInvitedUsers = await userInvitationService.findAllInvitedUsers();
		const promises = allInvitedUsers.map(async (invitedUser) => {
			logger.info(`${this.jobName}: Processing user ${invitedUser.username}`);
			await registrationService.sendUserInvitation(invitedUser.username);
			await userInvitationService.updateInvitedUser(invitedUser.id);
			logger.info(`${this.jobName}: Finished processing user ${invitedUser.username}`);
		});
		await Promise.all(promises);
	}
}
