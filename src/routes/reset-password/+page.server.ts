import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { UpdatePassword, ValidatePasswordResetToken } from '../../actions/auth';
import { PasswordResetRequestTokenExpiredException } from '../../exceptions/auth';
import { getUserId, saveFlashMessage } from '../../utils/auth';

export const load = async ({ locals, url }) => {
	const userId = getUserId(locals.user);
	if (userId) {
		throw redirect(302, '/dashboard');
	}

	const passwordResetToken = url.searchParams.get('token') ?? '';
	const email = url.searchParams.get('email') ?? '';

	// validate token and email
	try {
		await ValidatePasswordResetToken(passwordResetToken, email);
	} catch (error) {
		if (error instanceof PasswordResetRequestTokenExpiredException) {
			await saveFlashMessage(locals.sessionId, {
				type: 'error',
				message: 'Password reset token has expired. Please try again.'
			});
		} else {
			// if invalid, redirect to login page with an error
			await saveFlashMessage(locals.sessionId, {
				type: 'error',
				message: 'Invalid password reset token.'
			});
		}
		throw redirect(302, '/login');
	}

	return {
		token: passwordResetToken,
		email
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const userId = getUserId(locals.user);
		if (userId) {
			throw redirect(302, '/dashboard');
		}

		const body = await request.formData();

		try {
			await UpdatePassword(body);
		} catch (error: any) {
			if (error instanceof PasswordResetRequestTokenExpiredException) {
				await saveFlashMessage(locals.sessionId, {
					type: 'error',
					message: 'Password reset token has expired. Please try again.'
				});
				throw redirect(302, '/login');
			}

			if (error instanceof ZodError) {
				return fail(400, {
					fieldErrors: error.flatten().fieldErrors
				});
			}

			return fail(400, {
				error: 'There was an error updating your password'
			});
		}

		await saveFlashMessage(locals.sessionId, {
			type: 'success',
			message: 'Password has been updated successfully.'
		});
		throw redirect(302, '/login');
	}
} satisfies Actions;
