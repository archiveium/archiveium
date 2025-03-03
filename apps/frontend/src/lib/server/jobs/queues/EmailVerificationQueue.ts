import type { Job, Processor } from 'bullmq';
import { BaseQueue } from './BaseQueue';
import { EmailVerificationHandler } from '$lib/server/jobs/handlers/EmailVerificationHandler';

export class EmailVerificationQueue extends BaseQueue {
	private name = 'EmailVerification';
	private jobName = 'emailVerification';

	getName(): string {
		return this.name;
	}

	getJobName(): string {
		return this.jobName;
	}

	getProcessor(): Processor {
		return async function (job: Job) {
			const handler = new EmailVerificationHandler(job);
			await handler.execute();
		};
	}
}
