import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getUserId, saveFlashMessage } from '../../utils/auth';
import { ZodError } from 'zod';
import { RegisterForPreview } from '../../actions/register';

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
			await RegisterForPreview(data);
		} catch (error: any) {
			if (error instanceof ZodError) {
				return fail(400, { error: error.message });
			}

			return fail(400, {
				error:
					error.code && error.code == 23505
						? 'Email is already enrolled.'
						: 'There was an error enrolling your account. Please try again.'
			});
		}

		await saveFlashMessage(locals.sessionId, {
			type: 'success',
			message: 'Thank you for showing interest. Keep an eye on your mailbox!'
		});

		throw redirect(302, '/login');
	}
} satisfies Actions;
