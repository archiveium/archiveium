import type { Job } from 'bullmq';
import { logger } from '../../../../utils/logger';
import * as passwordResetService from '$lib/server/services/passwordResetService';

let jobName: string;

export async function passwordReset(job: Job): Promise<void> {
	jobName = job.name;
	logger.info(`${jobName}: Running job`);

	const allPasswordRequests = await passwordResetService.findPendingPasswordResetRequests();
	for (const passwordReset of allPasswordRequests) {
		logger.info(`${jobName}: Processing user ${passwordReset.email}`);
		await passwordResetService.sendPasswordResetEmail(
			passwordReset.email,
			passwordReset.password_reset_token
		);
		await passwordResetService.updatePasswordResetRequestNotifiedDate(passwordReset.id);
		logger.info(`${jobName}: Finished processing user ${passwordReset.email}`);
	}
	logger.info(`${jobName}: Finished running job`);
}
