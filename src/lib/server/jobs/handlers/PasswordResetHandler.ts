import { BaseHandler } from "./BaseHandler";
import * as passwordResetService from '$lib/server/services/passwordResetService';
import { logger } from "../../../../utils/logger";

export class PasswordResetHandler extends BaseHandler {
    async handle(): Promise<void> {
        const allPasswordRequests = await passwordResetService.findPendingPasswordResetRequests();
        for (const passwordReset of allPasswordRequests) {
            logger.info(`${this.jobName}: Processing user ${passwordReset.email}`);
            await passwordResetService.sendPasswordResetEmail(
                passwordReset.email,
                passwordReset.password_reset_token
            );
            await passwordResetService.updatePasswordResetRequestNotifiedDate(passwordReset.id);
            logger.info(`${this.jobName}: Finished processing user ${passwordReset.email}`);
        }
    }
}