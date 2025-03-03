import { redirect } from '@sveltejs/kit';
import { requireUserId, saveFlashMessage } from '../../utils/auth';
import { scheduler } from '$lib/server/jobs';
import type { Actions } from '../$types';

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

export const actions = {
	updateJob: async ({ request }) => {
		const data = await request.formData();
		await scheduler.retryFailedJobs(data.get('jobName')?.toString() ?? '');
	}
} satisfies Actions;
