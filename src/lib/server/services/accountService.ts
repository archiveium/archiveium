import * as accountRepository from '$lib/server/database/repositories/accountRepository';
import { NoResultError } from 'kysely';
import { AccountNotFoundException } from '../../../exceptions/account';

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
        return await accountRepository.findAccountByUserIdAndAccountId(userId, accountId);
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new AccountNotFoundException(`Account ${accountId} for user ${userId} does not exist`);
        }
        console.error(error);
        throw error;
    }
}

export async function findAllSyncingAccountCountByUserId(userId: string) {
    return accountRepository.findAllSyncingAccountCountByUserId(userId);
}

export async function isAccountUnique(email: string, userId: string) {
    return accountRepository.isAccountUnique(email, userId);
}

export async function deleteAccountByUserId(userId: string, accountId: string): Promise<boolean> {
    const result = await accountRepository.deleteAccountByUserId(userId, accountId);
    return Number(result.numDeletedRows) === 1;
}