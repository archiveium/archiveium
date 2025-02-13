import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { DeleteAccountHandler } from '../handlers/DeleteAccountHandler';

export class DeleteAccountQueue extends BaseQueue {
	private name = 'DeleteAccount';
	private jobName = 'deleteAccount';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new DeleteAccountHandler(job);
			await handler.execute();
		};
	}
}
