import { redirect } from '@sveltejs/kit';
import { requireUserId, saveFlashMessage } from '../../utils/auth';
import { scheduler } from '$lib/server/jobs';

export const load = async ({ locals }) => {
	const user = locals.user;
	requireUserId(false, user);
	if (!user?.admin) {
		await saveFlashMessage(locals.sessionId, {
			type: 'error',
			message: 'You do not have permission to access that page.'
		});
		throw redirect(302, '/dashboard');
	}

	const queueJobCounts = await scheduler.getAllJobCounts();
	return {
		queueJobCounts
	};
};