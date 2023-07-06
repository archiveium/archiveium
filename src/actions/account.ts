import { z } from 'zod';
import { AccountExistsException } from '../exceptions/account';
import { CacheKeyNotFoundException } from '../exceptions/cache';
import { getAllIMAPFolders, buildClient } from '../actions/imap';
import { redis } from '../models';
import {
	deleteAccountByAccountIdAndUserId,
	getAccountByUserIdAndAccountId,
	getAllAccountsByUserId,
	getAllFoldersByAccountAndUserId,
	isAccountUnique,
	updateAccountSyncingStatus
} from '../models/accounts';
import { insertFoldersAndAccount, updateFoldersAndAccount } from '../models/folders';
import { getProviderById } from '../models/providers';
import type { Account, ValidatedAccount, ValidatedExistingAccount } from '../types/account';
import type { Folder } from '../types/folder';

const addAccountSchema = z.object({
	name: z.string().trim().min(4, 'Must be of at-least 4 characters'),
	email: z.string().trim().email('Must be a valid email address'),
	password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
	provider_id: z.string().trim().min(1)
});

const editAccountSchema = z.object({
	name: z.string().trim().min(4, 'Must be of at-least 4 characters').optional().or(z.literal('')),
	password: z
		.string()
		.trim()
		.min(8, 'Must be of at-least 8 characters')
		.optional()
		.or(z.literal(''))
});

export async function ValidateExistingAccount(
	data: FormData,
	account: Account,
	userId: string
): Promise<ValidatedAccount> {
	const validatedData = editAccountSchema.parse({
		name: data.get('name'),
		password: data.get('password')
	});
	const provider = await getProviderById(account.provider_id);
	const updatedPassword =
		validatedData.password && validatedData.password != ''
			? validatedData.password
			: account.password;
	const imapClient = await buildClient(account.email, updatedPassword, provider.host);
	const remoteFolders = await getAllIMAPFolders(imapClient);
	const selectedFolders = await getAllFoldersByAccountAndUserId(userId, account.id);

	const validatedProvider = {
		account: {
			name: validatedData.name ?? account.name,
			password: validatedData.password ?? account.password,
			account_id: account.id,
			email: account.email,
			provider_id: account.provider_id,
			user_id: userId
		},
		remoteFolders: remoteFolders.map((remoteFolder) => {
			return {
				name: remoteFolder.path,
				status_uidvalidity: Number(remoteFolder.status?.uidValidity),
				status_messages: remoteFolder.status?.messages,
				syncing: selectedFolders.some(
					(selectedFolder) => selectedFolder.name === remoteFolder.path && selectedFolder.syncing
				)
			};
		})
	};

	await cacheValidatedAccount(userId, account.email, validatedProvider);

	return validatedProvider;
}

export async function ValidateAccount(data: FormData, userId: string): Promise<ValidatedAccount> {
	const validatedData = addAccountSchema.parse({
		name: data.get('name'),
		email: data.get('email'),
		password: data.get('password'),
		provider_id: data.get('provider_id')
	});
	const accountUnique = await isAccountUnique(validatedData.email, userId);
	if (!accountUnique) {
		throw new AccountExistsException(`${validatedData.email} has already been added.`);
	}

	const provider = await getProviderById(validatedData.provider_id);
	const imapClient = await buildClient(validatedData.email, validatedData.password, provider.host);
	const remoteFolders = await getAllIMAPFolders(imapClient);

	const validatedProvider = {
		account: { ...validatedData, user_id: userId },
		remoteFolders: remoteFolders.map((remoteFolder) => {
			return {
				name: remoteFolder.path,
				status_uidvalidity: Number(remoteFolder.status?.uidValidity),
				status_messages: remoteFolder.status?.messages
			};
		})
	};

	await cacheValidatedAccount(userId, validatedData.email, validatedProvider);

	return validatedProvider;
}

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

export async function SaveAccount(
	userId: string,
	formDataEmail: FormDataEntryValue | null,
	formDataSelectedRemoteFolders: FormDataEntryValue[] | null
): Promise<void> {
	const email = formDataEmail?.toString() ?? '';
	const cachedProvider = await getCachedValidatedAccount<ValidatedAccount>(userId, email);
	const selectedRemoteFolders = formDataSelectedRemoteFolders ?? [];

	await insertFoldersAndAccount(userId, cachedProvider, selectedRemoteFolders);
	//TODO Delete cachedProvider
}

export async function UpdateAccount(
	userId: string,
	email: string,
	accountId: string,
	formDataSelectedRemoteFolders: FormDataEntryValue[]
): Promise<void> {
	const cachedProvider = await getCachedValidatedAccount<ValidatedExistingAccount>(userId, email);
	const selectedRemoteFolders = formDataSelectedRemoteFolders ?? [];
	const existingFolders = await getAllFoldersByAccountAndUserId(userId, accountId);

	await updateFoldersAndAccount(userId, cachedProvider, selectedRemoteFolders, existingFolders);
}

export async function DeleteAccountByAccountIdAndUserId(
	accountId: string,
	userId: string
): Promise<void> {
	await deleteAccountByAccountIdAndUserId(userId, accountId);
}

export async function UpdateAccountSyncingStatus(
	userId: string,
	accountId: string,
	syncing: boolean
): Promise<boolean> {
	return updateAccountSyncingStatus(userId, accountId, syncing);
}

export function GetAllAccountsByUserId(userId: string): Promise<Account[]> {
	return getAllAccountsByUserId(userId);
}

export function GetAccountByUserIdAndAccountId(
	userId: string,
	accountId: string
): Promise<Account> {
	return getAccountByUserIdAndAccountId(userId, accountId);
}

export async function GetAllFoldersByUserIdAndAccountId(
	userId: string,
	accountId: string
): Promise<Folder[]> {
	const folders = await getAllFoldersByAccountAndUserId(userId, accountId);
	return folders.map((folder) => {
		const query = new URLSearchParams({ accountId, folderId: folder.id });
		folder.href = `?${query.toString()}`;
		return folder;
	});
}
