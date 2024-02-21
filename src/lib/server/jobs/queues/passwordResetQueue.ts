import type { Processor } from 'bullmq';
import { BaseQueue } from './baseQueue';
import { passwordReset } from '$lib/server/jobs/handlers/passwordReset';

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
		return passwordReset;
	}
}
