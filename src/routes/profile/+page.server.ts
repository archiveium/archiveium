import { fail, type Actions } from '@sveltejs/kit';
import { requireUserId } from '../../utils/auth';
import { PageInvalidFormException } from '../../exceptions/page';
import * as profileService from '$lib/server/services/profileService';
import { ZodError } from 'zod';
import { InvalidPasswordException } from '../../exceptions/auth';

export const load = async ({ locals }) => {
	requireUserId(false, locals.user);
};

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const userId = requireUserId(false, locals.user);

		try {
			switch (data.get('buttonProfileUpdate')) {
				case 'password':
					await profileService.updatePassword(userId, data);
					break;
				default:
					throw new PageInvalidFormException('Invalid profile update button');
			}
		} catch (error) {
			if (error instanceof ZodError) {
				return fail(400, {
					formMessage: undefined,
					fieldErrors: error.flatten().fieldErrors
				});
			} else if (error instanceof InvalidPasswordException) {
				return fail(400, {
					formMessage: {
						type: 'error',
						message: 'Invalid current password'
					},
					fieldErrors: undefined
				});
			}
			throw error;
		}

		return {
			formMessage: {
				type: 'success',
				message: 'Updated profile successfully'
			}
		};
	}
} satisfies Actions;
