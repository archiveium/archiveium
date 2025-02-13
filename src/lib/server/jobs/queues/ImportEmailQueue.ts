import type { Job, JobsOptions, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { ImportEmailHandler } from '$lib/server/jobs/handlers/ImportEmailHandler';

export class ImportEmailQueue extends BaseQueue {
	static name = 'ImportEmail';
	private jobName = 'importEmail';

	getName(): string {
		return ImportEmailQueue.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new ImportEmailHandler(job);
			await handler.execute();
		};
	}

	getJobOptions(): JobsOptions {
		return {
			removeOnComplete: true,
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 60000 * 2 // 2 minutes
			}
		};
	}

	// jobs will be added by syncAccount job
	addJobByDefault(): boolean {
		return false;
	}
}
