import { findAccountsCountByUserId } from '$lib/server/database/repositories/accountRepository';
import * as accountService from '$lib/server/services/accountService';
import { getAllEmailsCountByUserId, getAllFailedEmailsCountByUserId } from '../../models/emails';
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
				processed: getAllEmailsCountByUserId(userId),
				failure: getAllFailedEmailsCountByUserId(userId),
				quota: EMAIL_QUOTA
			}
		}
	};
};
