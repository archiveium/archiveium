import type { Processor } from 'bullmq';
import { BaseQueue } from './baseQueue';
import { userInvitation } from '$lib/server/jobs/handlers/userInvitation';

export class UserInvitationQueue extends BaseQueue {
	private name = 'UserInvitation';
	private jobName = 'processUserInvitation';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return userInvitation;
	}
}
