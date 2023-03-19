import type { Count } from "~/types/db";
import { sql } from ".";

export async function getAllAccountsByUserIdCount(userId: string): Promise<number> {
    const result = await sql<Count[]>`SELECT COUNT(*) FROM accounts WHERE user_id = ${userId} AND deleted = false`;
    return result[0].count;
}

export async function getAllSyncingAccountsByUserIdCount(userId: string): Promise<number> {
    const result = await sql<Count[]>`SELECT COUNT(*) FROM accounts WHERE user_id = ${userId} AND syncing = true`;
    return result[0].count;
}