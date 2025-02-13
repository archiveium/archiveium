import { BaseHandler } from "./BaseHandler";
import { logger } from '../../../../utils/logger';
import * as userService from '$lib/server/services/userService';
import * as accountService from '$lib/server/services/accountService';
import pLimit from 'p-limit';
import { deleteAllUserSessions } from '../../../../utils/auth';

export class DeleteUserHandler extends BaseHandler {
    async handle(): Promise<void> {
        const deletedUsers = await userService.findDeletedUsers();
        for (const deletedUser of deletedUsers) {
            logger.info(`${this.jobName}: Processing user id ${deletedUser.id} for deletion`);
    
            // Delete all user sessions (if any)
            await deleteAllUserSessions(deletedUser.id);
    
            const accounts = await accountService.findAccountsByUserId(deletedUser.id);
    
            // delete user if user has not account(s) configured
            if (accounts.length === 0) {
                logger.info(`${this.jobName}: Deleting user id ${deletedUser.id}`);
                const result = await userService.deleteUser(deletedUser.id);
                if (result.numDeletedRows < 1) {
                    logger.error(`${this.jobName}: Failed to delete user id ${deletedUser.id}`);
                }
            } else {
                // Flag all active accounts as deleted
                const accountsActive = accounts.filter((account) => !account.deleted);
                if (accountsActive.length > 0) {
                    const promisesLimit = pLimit(10);
                    const promises: Promise<void>[] = [];
                    accountsActive.forEach((account) => {
                        logger.warn(`${this.jobName}: Soft deleting account id ${account.id}`);
                        promises.push(
                            promisesLimit(() =>
                                accountService.softDeleteAccountByUserId(deletedUser.id, account.id)
                            )
                        );
                    });
    
                    try {
                        await Promise.all(promises);
                    } catch (error) {
                        logger.error(`${this.jobName}: ${JSON.stringify(error)}`);
                        throw error;
                    }
                }
    
                const accountsPendingDeletion = accounts.filter((account) => account.deleted);
                if (accountsPendingDeletion.length > 0) {
                    // warn and do nothing
                    const accountPendingDeletionIds = accountsPendingDeletion.map((account) => {
                        return account.id;
                    });
                    logger.warn(
                        `${this.jobName}: Waiting for account ids ${accountPendingDeletionIds.toString()} to be deleted`
                    );
                }
            }
        }
    }
}