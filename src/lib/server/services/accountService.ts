import * as accountRepository from '$lib/server/repositories/accountRepository';
import * as folderRepository from '$lib/server/repositories/folderRepository';
import { NoResultError } from 'kysely';
import {
	AccountDeletedException,
	AccountExistsException,
	AccountNotFoundException,
	AccountSyncingPausedException
} from '../../../exceptions/account';
import type { Account, ValidatedAccount, ValidatedExistingAccount } from '../../../types/account';
import { addAccountSchema, editAccountSchema } from '../schemas/accountSchemas';
import * as folderService from '$lib/server/services/folderService';
import * as providerService from '$lib/server/services/providerService';
import * as imapService from '$lib/server/services/imapService';
import { CacheKeyNotFoundException } from '../../../exceptions/cache';
import { redis } from '../redis/connection';
import { RecordDeleteFailedException } from '../../../exceptions/database';
import { db } from '../database/connection';
import { decrypt } from '../../../utils/encrypter';

export async function updateAccountSyncingStatus(
	userId: string,
	accountId: string,
	syncing: boolean
): Promise<boolean> {
	return accountRepository.updateAccountSyncingStatus(userId, accountId, syncing);
}

export async function findAccountsByUserId(userId: string) {
	return accountRepository.findAccountsByUserId(userId);
}

export async function findAccountByUserIdAndAccountId(userId: string, accountId: string) {
	try {
		const account = await accountRepository.findAccountByUserIdAndAccountId(userId, accountId);
		account.password = decrypt(account.password);
		return account;
	} catch (error) {
		if (error instanceof NoResultError) {
			throw new AccountNotFoundException(`Account ${accountId} for user ${userId} does not exist`);
		}
		throw error;
	}
}

export async function findAccountWithProviderByUserIdAndAccountId(
	userId: string,
	accountId: string
) {
	try {
		const account = await accountRepository.findAccountWithProviderByUserIdAndAccountId(
			userId,
			accountId
		);
		if (account.deleted) {
			throw new AccountDeletedException(`Account ${accountId} was deleted`);
		} else if (!account.syncing) {
			throw new AccountSyncingPausedException(`Account syncing ${accountId} was paused`);
		}
		return account;
	} catch (error) {
		if (error instanceof NoResultError) {
			throw new AccountNotFoundException(`Account ${accountId} for user ${userId} does not exist`);
		}
		throw error;
	}
}

export async function findAllSyncingAccountCountByUserId(userId: string) {
	return accountRepository.findAllSyncingAccountCountByUserId(userId);
}

export async function findAllSyncingAccounts() {
	return accountRepository.findAllSyncingAccounts();
}

export async function isAccountUnique(email: string, userId: string) {
	const account = await accountRepository.findAccountByUserIdAndEmail(email, userId);
	if (account) {
		if (account.deleted) {
			throw new AccountDeletedException(
				`${email} is pending deletion. Please add once account has been deleted.`
			);
		}
		throw new AccountExistsException(`${email} has already been added.`);
	}
}

export async function softDeleteAccountByUserId(userId: string, accountId: string): Promise<void> {
	return db.transaction().execute(async (trx) => {
		const deleteAccountResult = await accountRepository.softDeleteAccountByUserId(
			userId,
			accountId,
			trx
		);
		if (Number(deleteAccountResult.numUpdatedRows) !== 1) {
			throw new RecordDeleteFailedException(
				`Failed to delete account ${accountId} for user ${userId}`
			);
		}

		const deleteFolderResult = await folderRepository.softDeleteFolderByAccountId(
			userId,
			accountId,
			trx
		);
		if (Number(deleteFolderResult.numUpdatedRows) === 0) {
			throw new RecordDeleteFailedException(
				`Failed to delete folders for account ${accountId} & user ${userId}`
			);
		}
	});
}

export async function validateExistingAccount(
	data: FormData,
	account: Account,
	userId: string
): Promise<ValidatedAccount> {
	const validatedData = editAccountSchema.parse({
		name: data.get('name'),
		password: data.get('password')
	});
	const provider = await providerService.findProviderById(account.provider_id);
	const updatedPassword =
		validatedData.password && validatedData.password != ''
			? validatedData.password
			: account.password;
	const imapClient = await imapService.buildClient({
		username: account.email,
		password: updatedPassword,
		host: provider.host,
		port: provider.port,
		secure: provider.secure,
	});
	const remoteFolders = await imapService.getAllIMAPFolders(imapClient);
	const selectedFolders = await folderService.findFoldersWithDeletedFilterByAccountIdAndUserId(
		userId,
		account.id,
		false
	);

	const validatedProvider = {
		account: {
			name: validatedData.name ?? account.name,
			password: updatedPassword,
			account_id: account.id,
			email: account.email,
			provider_id: account.provider_id,
			user_id: userId
		},
		remoteFolders: remoteFolders.map((remoteFolder) => {
			return {
				name: remoteFolder.path,
				status_uidvalidity: Number(remoteFolder.status?.uidValidity),
				status_messages: remoteFolder.status?.messages ?? 0,
				syncing: selectedFolders.some(
					(selectedFolder) => selectedFolder.name === remoteFolder.path && selectedFolder.syncing
				)
			};
		})
	};

	await cacheValidatedAccount(userId, account.email, validatedProvider);

	return validatedProvider;
}

export async function validateAccount(data: FormData, userId: string): Promise<ValidatedAccount> {
	const validatedData = addAccountSchema.parse({
		name: data.get('name'),
		email: data.get('email'),
		password: data.get('password'),
		provider_id: data.get('provider_id')
	});
	await isAccountUnique(validatedData.email, userId);

	const provider = await providerService.findProviderById(validatedData.provider_id);
	const imapClient = await imapService.buildClient({
		username: validatedData.email,
		password: validatedData.password,
		host: provider.host,
		port: provider.port,
		secure: provider.secure
	});
	const remoteFolders = await imapService.getAllIMAPFolders(imapClient);

	const validatedProvider = {
		account: { ...validatedData, user_id: userId },
		remoteFolders: remoteFolders.map((remoteFolder) => {
			return {
				name: remoteFolder.path,
				status_uidvalidity: Number(remoteFolder.status?.uidValidity),
				status_messages: remoteFolder.status?.messages ?? 0
			};
		})
	};

	await cacheValidatedAccount(userId, validatedData.email, validatedProvider);

	return validatedProvider;
}

export async function saveAccount(
	userId: string,
	formDataEmail: FormDataEntryValue | null,
	formDataSelectedRemoteFolders: FormDataEntryValue[] | null
): Promise<void> {
	const email = formDataEmail?.toString() ?? '';
	const cachedProvider = await getCachedValidatedAccount<ValidatedAccount>(userId, email);
	const selectedRemoteFolders = formDataSelectedRemoteFolders ?? [];

	await folderService.insertFoldersAndAccount(userId, cachedProvider, selectedRemoteFolders);
	//TODO Delete cachedProvider
}

export async function updateAccount(
	userId: string,
	email: string,
	accountId: string,
	formDataSelectedRemoteFolders: FormDataEntryValue[]
): Promise<void> {
	const cachedProvider = await getCachedValidatedAccount<ValidatedExistingAccount>(userId, email);
	const selectedRemoteFolders = formDataSelectedRemoteFolders ?? [];
	const existingFolders = await folderService.findFoldersWithDeletedFilterByAccountIdAndUserId(
		userId,
		accountId,
		false
	);

	await folderService.updateFoldersAndAccount(
		userId,
		cachedProvider,
		selectedRemoteFolders,
		existingFolders
	);
}

// Private functions

async function cacheValidatedAccount(
	userId: string,
	email: string,
	validatedAccount: ValidatedAccount
): Promise<boolean> {
	const result = await redis.set(
		`${userId}:${email}`,
		JSON.stringify(validatedAccount),
		'EX',
		10 * 60
	);
	return result === 'OK';
}

async function getCachedValidatedAccount<T>(userId: string, email: string): Promise<T> {
	const result = await redis.get(`${userId}:${email}`);
	if (result) {
		return JSON.parse(result);
	}
	throw new CacheKeyNotFoundException('Key does not exist');
}

export async function findDeletedAccounts() {
	return accountRepository.findDeletedAccounts();
}

export async function deleteAccount(id: string) {
	const deleteResult = await accountRepository.deleteAccount(id);
	if (deleteResult.numDeletedRows < 1) {
		throw new RecordDeleteFailedException(`Failed to delete account id: ${id}`);
	}
}
