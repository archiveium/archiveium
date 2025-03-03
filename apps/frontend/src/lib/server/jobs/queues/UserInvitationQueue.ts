import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { UserInvitationHandler } from '../handlers/UserInvitationHandler';

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
		return async function (job: Job) {
			const handler = new UserInvitationHandler(job);
			await handler.execute();
		};
	}
}
