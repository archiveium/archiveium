import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { DeleteUserHandler } from '$lib/server/jobs/handlers/DeleteUserHandler';

export class DeleteUserQueue extends BaseQueue {
	private name = 'DeleteUser';
	private jobName = 'deleteUser';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new DeleteUserHandler(job);
			await handler.execute();
		};
	}
}
