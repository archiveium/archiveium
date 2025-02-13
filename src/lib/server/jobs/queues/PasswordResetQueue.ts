import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { PasswordResetHandler } from '../handlers/PasswordResetHandler';

export class PasswordResetQueue extends BaseQueue {
	private name = 'PasswordReset';
	private jobName = 'passwordReset';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new PasswordResetHandler(job);
			await handler.execute();
		};
	}
}
