import type { Processor } from 'bullmq';
import { BaseQueue } from './baseQueue';
import { indexEmail } from '$lib/server/jobs/handlers/indexEmail';

export class indexEmailQueue extends BaseQueue {
	private name = 'IndexEmail';
	private jobName = 'indexEmail';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return indexEmail;
	}
}
