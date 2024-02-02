import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { AccountDeletedException, AccountExistsException } from '../../../exceptions/account.js';
import * as providerService from '$lib/server/services/providerService.js';
import * as accountService from '$lib/server/services/accountService.js';
import { requireUserId, saveFlashMessage } from '../../../utils/auth.js';
import { IMAPAuthenticationFailedException } from '../../../exceptions/imap.js';

export const load = async ({ locals }) => {
	requireUserId(false, locals.user);

	const availableProviders = await providerService.findAllProviders();
	const defaultProvider = availableProviders.find((provider) => provider.is_default);
	return {
		availableProviders,
		defaultProvider,
		steps: {
			current: 1
		}
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const userId = requireUserId(false, locals.user);

		try {
			switch (data.get('step')) {
				case 'addAccountStep1':
					{
						const validatedProvider = await accountService.validateAccount(data, userId);
						return {
							email: validatedProvider.account.email,
							remoteFolders: validatedProvider.remoteFolders,
							steps: {
								current: 2
							}
						};
					}
					break;
				case 'addAccountStep2':
					await accountService.saveAccount(userId, data.get('email'), data.getAll('folders'));
					await saveFlashMessage(locals.sessionId, {
						type: 'success',
						message: 'Account has been saved successfully!'
					});
					break;
			}
		} catch (error) {
			console.log(error);
			if (error instanceof ZodError) {
				return fail(400, {
					error: undefined,
					fieldErrors: error.flatten().fieldErrors
				});
			} else if (error instanceof IMAPAuthenticationFailedException) {
				return fail(400, {
					error: 'Provided credentials are invalid.',
					fieldErrors: undefined
				});
			} else if (error instanceof AccountExistsException || error instanceof AccountDeletedException) {
				return fail(400, {
					error: error.message,
					fieldErrors: undefined
				});
			}

			return fail(400, {
				error: 'There was an error adding account.',
				fieldErrors: undefined
			});
		}

		throw redirect(302, '/dashboard');
	}
} satisfies Actions;
