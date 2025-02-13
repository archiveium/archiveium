import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { IndexEmailHandler } from '../handlers/IndexEmailHandler';

export class IndexEmailQueue extends BaseQueue {
	private name = 'IndexEmail';
	private jobName = 'indexEmail';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new IndexEmailHandler(job);
			await handler.execute();
		};
	}
}
