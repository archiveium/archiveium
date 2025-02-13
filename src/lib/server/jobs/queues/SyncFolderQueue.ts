import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { SyncFolderHandler } from '$lib/server/jobs/handlers/SyncFolderHandler';

export class SyncFolderQueue extends BaseQueue {
	private name = 'SyncFolder';
	private jobName = 'syncFolder';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new SyncFolderHandler(job);
			await handler.execute();
		};
	}
}
