import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { SaveAccount, ValidateAccount } from '../../../actions/account.js';
import { AccountExistsException } from '../../../exceptions/account.js';
import { IMAPAuthenticationFailed } from '../../../exceptions/imap.js';
import * as providerService from '$lib/server/services/providerService.js';
import { requireUserId, saveFlashMessage } from '../../../utils/auth.js';

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
						const validatedProvider = await ValidateAccount(data, userId);
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
					await SaveAccount(userId, data.get('email'), data.getAll('folders'));
					await saveFlashMessage(locals.sessionId, {
						type: 'success',
						message: 'Account has been saved successfully!'
					});
					break;
			}
		} catch (error: any) {
			// TODO Log error
			if (error instanceof ZodError) {
				return fail(400, {
					error: undefined,
					fieldErrors: error.flatten().fieldErrors
				});
			} else if (error instanceof IMAPAuthenticationFailed) {
				return fail(400, {
					error: 'Provided credentials are invalid.',
					fieldErrors: undefined
				});
			} else if (error instanceof AccountExistsException) {
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
