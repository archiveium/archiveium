import { db } from '$lib/server/database/connection';
import { sql, type InsertResult } from 'kysely';
import type { CreateUser } from '../../../types/user';

export async function createUser(user: CreateUser): Promise<InsertResult> {
    return db.insertInto('users')
        .values(user)
        .executeTakeFirstOrThrow();
}

export async function findUserById(id: string) {
    return db.selectFrom('users')
        .select(['id', 'name', 'email', 'password', 'email_notified_at', 'email_verified_at'])
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
}

export async function findUserByEmail(email: string) {
    return db.selectFrom('users')
        .select(['id', 'name', 'email', 'password', 'email_notified_at', 'email_verified_at'])
        .where('email', '=', email)
        .executeTakeFirstOrThrow();
}

export async function verifyUser(id: string) {
    return db.updateTable('users')
        .set((eb) => ({
            email_verified_at: sql<string>`NOW()`
        }))
        .where('id', '=', id)
        .execute();
}

export async function resetUserNotificationDate(id: string) {
    return db.updateTable('users')
        .set({
            email_notified_at: null
        })
        .where('id', '=', id)
        .execute();
}

export async function updatePasswordByUserEmail(email: string, password: string) {
    return db.updateTable('users')
        .set((eb) => ({
            updated_at: sql<string>`NOW()`,
            password: password
        }))
        .where('email', '=', email)
        .execute();
}
