import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import * as authService from '$lib/server/services/authService';
import { saveFlashMessage } from '../../utils/auth';

export const actions = {
	default: async ({ locals }) => {
		try {
			await authService.logoutUser(locals.sessionId);
			await saveFlashMessage(locals.sessionId, {
				type: 'success',
				message: 'You have been logged out.'
			});
		} catch (error) {
			await saveFlashMessage(locals.sessionId, {
				type: 'error',
				message: 'There was an error logging out.'
			});
			throw redirect(302, '/dashboard');
		}

		throw redirect(302, '/login');
	}
} satisfies Actions;
