import type { CreateUser, User } from "~/types/user";
import { sql } from ".";
import { RecordNotFoundException } from "~/exceptions/database";
import crypto from 'crypto';

export async function createUser(user: CreateUser): Promise<void> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = (crypto.scryptSync(user.password, salt, 64) as Buffer).toString('hex');
    const hashedPassword = `${salt}:${derivedKey}`;

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