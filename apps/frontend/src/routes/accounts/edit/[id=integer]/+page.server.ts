import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';
import * as accountService from '$lib/server/services/accountService.js';
import { AccountExistsException } from '../../../../exceptions/account.js';
import { IMAPAuthenticationFailedException } from '../../../../exceptions/imap.js';
import * as providerService from '$lib/server/services/providerService.js';
import { requireUserId, saveFlashMessage } from '../../../../utils/auth.js';
import { logger } from '../../../../utils/logger.js';

export const load = async ({ locals, params }) => {
	const userId = requireUserId(false, locals.user);

	const availableProviders = await providerService.findAllProviders();
	const selectedAccount = await accountService.findAccountByUserIdAndAccountId(userId, params.id);
	const defaultProvider = availableProviders.find(
		(provider) => provider.id === selectedAccount.provider_id
	);

	return {
		availableProviders,
		defaultProvider,
		selectedAccount,
		steps: {
			current: 1
		}
	};
};

export const actions = {
	default: async ({ request, locals, params }) => {
		const data = await request.formData();
		const userId = requireUserId(false, locals.user);
		if (!params.id) {
			await saveFlashMessage(locals.sessionId, {
				type: 'error',
				message: 'Trying to edit invalid account.'
			});
			throw redirect(302, '/dashboard');
		}

		const selectedAccount = await accountService.findAccountByUserIdAndAccountId(userId, params.id);

		try {
			switch (data.get('step')) {
				case 'addAccountStep1': {
					const validatedProvider = await accountService.validateExistingAccount(
						data,
						selectedAccount,
						userId
					);
					return {
						remoteFolders: validatedProvider.remoteFolders,
						steps: {
							current: 2
						},
						email: undefined,
					};
				}
				case 'addAccountStep2':
					await accountService.updateAccount(
						userId,
						selectedAccount.email,
						selectedAccount.id,
						data.getAll('folders')
					);
					await saveFlashMessage(locals.sessionId, {
						type: 'success',
						message: 'Account has been updated successfully!'
					});
					break;
				case 'deleteAccount':
					await accountService.softDeleteAccountByUserId(userId, selectedAccount.id);
					await saveFlashMessage(locals.sessionId, {
						type: 'success',
						message: 'Account has been deleted successfully.'
					});
					break;
			}
		} catch (error) {
			// TODO Log error
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
			} else if (error instanceof AccountExistsException) {
				return fail(400, {
					error: error.message,
					fieldErrors: undefined
				});
			}

			logger.error(JSON.stringify(error));
			await saveFlashMessage(locals.sessionId, {
				type: 'error',
				message: 'There was an error editing account.'
			});
		}

		throw redirect(302, '/dashboard');
	}
} satisfies Actions;
