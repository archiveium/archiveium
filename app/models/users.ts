import type { CreateUser, User } from "~/types/user";
import { sql } from ".";
import { RecordNotFoundException } from "~/exceptions/database";
import * as authUtils from "~/utils/auth";

export async function createUser(user: CreateUser): Promise<void> {
    const hashedPassword = authUtils.hashPassword(user.password);
    await sql`INSERT INTO users (name, email, password)
    VALUES(${user.name}, ${user.email}, ${hashedPassword})`;
}

export async function getUserById(id: string): Promise<User> {
    const result = await sql<User[]>`SELECT id, name, email, password, email_notified_at, email_verified_at
    FROM users 
    WHERE id = ${id}
    LIMIT 1`;
    if (result.count > 0) {
        return result[0];
    }

    // TODO Handle case when user is logged in and account is deleted
    throw new RecordNotFoundException(`User ${id} not found in database`);
}

export async function getUserByEmail(email: string): Promise<User> {
    const result = await sql<User[]>`SELECT id, name, email, password, email_notified_at, email_verified_at
    FROM users
    WHERE email = ${email}
    LIMIT 1`;
    if (result.count > 0) {
        return result[0];
    }

    throw new RecordNotFoundException(`User ${email} not found in database`);
}

export async function verifyUser(id: string): Promise<void> {
    await sql`UPDATE users 
    SET email_verified_at = NOW()
    WHERE id = ${id}`;
}

export async function resetUserNotificationDate(id: string): Promise<void> {
    await sql`UPDATE users 
    SET email_notified_at = NULL 
    WHERE id = ${id}`;
}

export async function updatePasswordByUserEmail(email: string, rawPassword: string): Promise<void> {
    const hashedPassword = authUtils.hashPassword(rawPassword);
    await sql`UPDATE users 
    SET updated_at = NOW(), password = ${hashedPassword}
    WHERE email = ${email}`;
}