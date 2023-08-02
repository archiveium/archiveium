import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';
import {
	DeleteAccountByAccountIdAndUserId,
	GetAccountByUserIdAndAccountId,
	UpdateAccount,
	ValidateExistingAccount
} from '../../../../actions/account.js';
import { AccountExistsException } from '../../../../exceptions/account.js';
import { IMAPAuthenticationFailed } from '../../../../exceptions/imap.js';
import { getAllProviders } from '../../../../models/providers.js';
import { requireUserId, saveFlashMessage } from '../../../../utils/auth.js';

export const load = async ({ locals, params }) => {
	const userId = requireUserId(false, locals.user);

	const availableProviders = await getAllProviders();
	const selectedAccount = await GetAccountByUserIdAndAccountId(userId, params.id);
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

		const selectedAccount = await GetAccountByUserIdAndAccountId(userId, params.id);

		try {
			switch (data.get('step')) {
				case 'addAccountStep1': {
					const validatedProvider = await ValidateExistingAccount(data, selectedAccount, userId);
					return {
						remoteFolders: validatedProvider.remoteFolders,
						steps: {
							current: 2
						}
					};
				}
				case 'addAccountStep2':
					await UpdateAccount(
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
					await DeleteAccountByAccountIdAndUserId(selectedAccount.id, userId);
					await saveFlashMessage(locals.sessionId, {
						type: 'success',
						message: 'Account has been deleted successfully.'
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

			console.log(error);
			return fail(400, {
				error: 'There was an error editing account.',
				fieldErrors: undefined
			});
		}

		throw redirect(302, '/dashboard');
	}
} satisfies Actions;
