import type { Processor } from 'bullmq';
import { BaseQueue } from './baseQueue';
import { syncAccount } from '$lib/server/jobs/handlers/syncAccount';

export class SyncAccountQueue extends BaseQueue {
	private name = 'SyncAccount';
	private jobName = 'syncAccount';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return syncAccount;
	}
}
