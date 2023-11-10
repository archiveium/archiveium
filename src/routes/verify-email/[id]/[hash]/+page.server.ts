import { redirect, type Actions } from '@sveltejs/kit';
import * as registrationService from '$lib/server/services/registrationService';
import * as userService from '$lib/server/services/userService';
import { getUserId, saveFlashMessage } from '../../../../utils/auth.js';

export const load = async ({ locals, params, url }) => {
	const userId = getUserId(locals.user);
	if (userId) {
		throw redirect(302, '/dashboard');
	}

	const verificationUrl = await registrationService.verifyRegistrationUrl({
		id: params.id,
		hash: params.hash,
		expires: url.searchParams.get('expires') ?? '',
		signature: url.searchParams.get('signature') ?? ''
	});

	const user = await userService.findUserById(verificationUrl.userId);
	if (user.email_verified_at) {
		await saveFlashMessage(locals.sessionId, {
			type: 'success',
			message: 'Email has already been verified. You can now login.'
		});
		throw redirect(302, '/login');
	}

	if (!verificationUrl.hasExpired && verificationUrl.signatureValid) {
		await userService.verifyUser(verificationUrl.userId);
		await saveFlashMessage(locals.sessionId, {
			type: 'success',
			message: 'Email verified successfully! You can now login.'
		});
		throw redirect(302, '/login');
	} else if (!verificationUrl.signatureValid) {
		await saveFlashMessage(locals.sessionId, {
			type: 'error',
			message: 'Invalid verification url. Please try again.'
		});
		throw redirect(302, '/login');
	}
};

export const actions = {
	default: async ({ url, locals, params }) => {
		const userId = getUserId(locals.user);
		if (userId) {
			throw redirect(302, '/dashboard');
		}

		const verificationUrl = await registrationService.verifyRegistrationUrl({
			id: params.id,
			hash: params.hash,
			expires: url.searchParams.get('expires') ?? '',
			signature: url.searchParams.get('signature') ?? ''
		});
		const user = await userService.findUserById(verificationUrl.userId);

		if (user.email_verified_at) {
			await saveFlashMessage(locals.sessionId, {
				type: 'success',
				message: 'Email has already been verified. You can now login.'
			});
		} else if (verificationUrl.hasExpired && verificationUrl.signatureValid) {
			await userService.setUserNotificationDate(verificationUrl.userId, undefined);
			await saveFlashMessage(locals.sessionId, {
				type: 'success',
				message: 'Verification email has been sent.'
			});
		}

		throw redirect(302, '/login');
	}
} satisfies Actions;
