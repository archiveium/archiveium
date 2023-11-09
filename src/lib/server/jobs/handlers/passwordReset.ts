import type { Job } from 'bullmq';
import { logger } from '../../../../utils/logger';
import * as passwordResetService from '$lib/server/services/passwordResetService';

export async function passwordReset(job: Job): Promise<void> {
    logger.info(`Running ${job.name} job`);
    const allPendingRequests = await passwordResetService.findPendingPasswordResetRequests();
    allPendingRequests.forEach(async (passwordReset) => {
        logger.info(`Processing user ${passwordReset.email}`);
        await passwordResetService.sendPasswordResetEmail(passwordReset.email, passwordReset.password_reset_token);
        await passwordResetService.updatePasswordResetRequestNotifiedDate(passwordReset.id);
        logger.info(`Finished processing user ${passwordReset.email}`);
    });
    logger.info(`Finished running ${job.name} job`);
}