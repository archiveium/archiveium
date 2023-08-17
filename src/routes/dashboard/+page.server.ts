import { findAccountsCountByUserId } from '$lib/server/repositories/accountRepository';
import * as accountService from '$lib/server/services/accountService';
import * as emailService from '$lib/server/services/emailService';
import { requireUserId } from '../../utils/auth';

// TODO Save this in database
const EMAIL_QUOTA = 40000;

export const load = ({ locals }) => {
	const userId = requireUserId(false, locals.user);

	return {
		streamed: {
			accounts: {
				added: findAccountsCountByUserId(userId),
				syncing: accountService.findAllSyncingAccountCountByUserId(userId)
			},
			emails: {
				processed: emailService.findEmailCountByUserId(userId),
				failure: emailService.findFailedEmailCountByUserId(userId),
				quota: EMAIL_QUOTA
			}
		}
	};
};
