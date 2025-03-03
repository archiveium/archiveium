import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { SyncAccountHandler } from '$lib/server/jobs/handlers/SyncAccountHandler';

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
		return async function (job: Job) {
			const handler = new SyncAccountHandler(job);
			await handler.execute();
		};
	}
}
