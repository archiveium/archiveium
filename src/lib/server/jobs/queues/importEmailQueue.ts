import type { JobsOptions, Processor } from 'bullmq';
import { BaseQueue } from './baseQueue';
import { importEmail } from '$lib/server/jobs/handlers/importEmail';

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
		return importEmail;
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
