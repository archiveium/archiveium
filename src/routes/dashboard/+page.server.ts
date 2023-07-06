import {
	getAllAccountsByUserIdCount,
	getAllSyncingAccountsByUserIdCount
} from '../../models/accounts';
import { getAllEmailsCountByUserId, getAllFailedEmailsCountByUserId } from '../../models/emails';
import { requireUserId } from '../../utils/auth';

// TODO Save this in database
const EMAIL_QUOTA = 40000;

export const load = ({ locals }) => {
	const userId = requireUserId(false, locals.user);

	return {
		streamed: {
			accounts: {
				added: getAllAccountsByUserIdCount(userId),
				syncing: getAllSyncingAccountsByUserIdCount(userId)
			},
			emails: {
				processed: getAllEmailsCountByUserId(userId),
				failure: getAllFailedEmailsCountByUserId(userId),
				quota: EMAIL_QUOTA
			}
		}
	};
};
