import { AccountNotFoundException } from "~/exceptions/account";
import type { Account } from "~/types/account";
import type { Count } from "~/types/db";
import { sql } from ".";
import { getFoldersByUserIdAndAccountId } from "./folders";

export async function getAllAccountsByUserIdCount(userId: string): Promise<number> {
    const result = await sql<Count[]>`SELECT COUNT(*) FROM accounts WHERE user_id = ${userId} AND deleted = false`;
    return result[0].count;
}

export async function getAllAccountsByUserId(userId: string): Promise<Account[]> {
    return sql<Account[]>`SELECT * FROM accounts WHERE user_id = ${userId} AND deleted = false`;
}

export async function getAccountByUserIdAndAccountId(userId: string, accountId: string): Promise<Account> {
    const results = await sql<Account[]>`SELECT * FROM accounts 
        WHERE user_id = ${userId} AND id = ${accountId} AND deleted = false`;
    if (results.count > 0) {
        return results[0];
    }
    throw new AccountNotFoundException(`Account ${accountId} for user ${userId} does not exist`);
}

export async function getAllFoldersByAccountAndUserId(userId: string, accountId: string) {
    return getFoldersByUserIdAndAccountId(userId, accountId);
}

export async function getAllSyncingAccountsByUserIdCount(userId: string): Promise<number> {
    const result = await sql<Count[]>`SELECT COUNT(*) FROM accounts WHERE user_id = ${userId} AND syncing = true`;
    return result[0].count;
}

export async function isAccountUnique(email: string, userId: string): Promise<boolean> {
    const result = await sql<Count[]>`SELECT COUNT(*) 
    FROM accounts 
    WHERE email = ${email} AND deleted = false AND user_id = ${userId}`;
    return result[0].count == 0;
}