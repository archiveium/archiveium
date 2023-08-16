import * as userRepository from '$lib/server/repositories/userRepository';
import { NoResultError, type InsertResult } from 'kysely';
import type { CreateUser } from '../../../types/user';
import { hashPassword } from '../../../utils/auth';
import { RecordNotFoundException } from '../../../exceptions/database';

export async function createUser(user: CreateUser): Promise<InsertResult> {
    return userRepository.createUser({
        name: user.name,
        email: user.email,
        password: hashPassword(user.password)
    });
}

export async function findUserById(id: string) {
	try {
        const user = await userRepository.findUserById(id);
        return user;
    } catch (error) {
        if (error instanceof NoResultError) {
            // TODO Handle case when user is logged in and account is deleted
            throw new RecordNotFoundException(`User ${id} not found in database`);
        }
        throw error;
    }
}

export async function findUserByEmail(email: string) {
    try {
        const user = await userRepository.findUserByEmail(email);
        return user;
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new RecordNotFoundException(`User ${email} not found in database`);
        }
        throw error;
    }
}

export async function verifyUser(id: string) {
    return userRepository.verifyUser(id);
}

export async function resetUserNotificationDate(id: string) {
    return userRepository.resetUserNotificationDate(id);
}

export async function updatePasswordByUserEmail(email: string, rawPassword: string) {
	const hashedPassword = hashPassword(rawPassword);
    return userRepository.updatePasswordByUserEmail(email, hashedPassword);
}