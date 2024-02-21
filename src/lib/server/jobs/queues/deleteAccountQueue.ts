import type { Processor } from 'bullmq';
import { BaseQueue } from './baseQueue';
import { deleteAccount } from '$lib/server/jobs/handlers/deleteAccount';

export class deleteAccountQueue extends BaseQueue {
	private name = 'DeleteAccount';
	private jobName = 'deleteAccount';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return deleteAccount;
	}
}
