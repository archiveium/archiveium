import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getUserId, saveFlashMessage } from '../../utils/auth';
import { ZodError } from 'zod';
import { UserNotVerifiedException } from '../../exceptions/auth';
import * as authService from '$lib/server/services/authService';

export const load = ({ locals }) => {
	const userId = getUserId(locals.user);
	if (userId) {
		throw redirect(302, '/dashboard');
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		try {
			await authService.createPasswordResetRequest(data);
			saveFlashMessage(locals.sessionId, {
				type: 'success',
				message: 'A password reset email has been sent.'
			});
		} catch (error) {
			if (error instanceof ZodError) {
				return fail(400, { error: error.message });
			} else if (error instanceof UserNotVerifiedException) {
				return fail(400, { error: error.message });
			}
			console.log(error);
			return fail(400, { error: 'There was an error processing your request. Please try again.' });
		}

		throw redirect(302, '/login');
	}
} satisfies Actions;
