import { db } from '$lib/server/database/connection';
import { sql, type InsertResult, DeleteResult } from 'kysely';
import type { CreateUser } from '../../../types/user';

export async function createUser(user: CreateUser): Promise<InsertResult> {
    return db.insertInto('users')
        .values(user)
        .executeTakeFirstOrThrow();
}

export async function deleteUser(userId: string): Promise<DeleteResult> {
    return db.deleteFrom('users')
        .where('id', '=', userId)
        .where('deleted', '=', true)
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
        .select(['id', 'name', 'email', 'password', 'deleted', 'email_notified_at', 'email_verified_at'])
        .where('email', '=', email)
        .executeTakeFirstOrThrow();
}

export async function verifyUser(id: string) {
    return db.updateTable('users')
        .set(() => ({
            email_verified_at: sql<string>`NOW()`
        }))
        .where('id', '=', id)
        .execute();
}

export async function setUserNotificationDate(id: string, date: string | undefined) {
    return db.updateTable('users')
        .set(() => ({
            email_notified_at: sql<string>`${date}` ?? null
        }))
        .where('id', '=', id)
        .execute();
}

export async function updatePasswordByUserEmail(email: string, password: string) {
    return db.updateTable('users')
        .set(() => ({
            updated_at: sql<string>`NOW()`,
            password: password
        }))
        .where('email', '=', email)
        .execute();
}

export async function findUnverifiedUsers() {
    return db.selectFrom('users')
        .select(['id', 'email'])
        .where('email_notified_at', 'is', null)
        .where('deleted', '=', false)
        .execute();
}

export async function findDeletedUsers() {
    return db.selectFrom('users')
        .select(['id'])
        .where('deleted', '=', true)
        .execute();
}

export async function findAdminUserCount() {
    return db.selectFrom('users')
        .select((eb) => eb.fn('count', ['id']).as('count'))
        .where('admin', '=', true)
        .executeTakeFirstOrThrow();
}

export async function createAdminUser(name: string, adminEmail: string, hashedAdminPassword: string) {
    return db.insertInto('users')
        .values({
            name,
            email: adminEmail,
            password: hashedAdminPassword,
            admin: true,
            email_verified_at: sql<string>`NOW()`,
        })
        .onConflict((oc) => oc.columns(['email']).doUpdateSet({ admin: true }))
        .executeTakeFirstOrThrow();
}