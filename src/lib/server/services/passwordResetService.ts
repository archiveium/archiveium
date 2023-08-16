import * as passwordResetRepository from '$lib/server/repositories/passwordResetRepository';
import { NoResultError } from 'kysely';
import { RecordDeleteFailedException, RecordNotFoundException } from '../../../exceptions/database';
import type { NewPasswordRequestRequest } from '../../../types/passwordReset';

export async function findPasswordResetRequestByEmail(email: string) {
    try {
        const resetRequest = await passwordResetRepository.findPasswordResetRequestByEmail(email); 
        return resetRequest;       
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new RecordNotFoundException(`No password reset token exists for email: ${email}`);
        }
        throw error;
    }
}

export async function deletePasswordResetRequestById(id: string) {
    const deleteResult = await passwordResetRepository.deletePasswordResetRequestById(id);
    if (deleteResult.numDeletedRows < 1) {
        throw new RecordDeleteFailedException(`Failed to delete password request id: ${id}`);
    }
}

export async function createPasswordResetRequest(passwordResetRequest: NewPasswordRequestRequest) {
    return passwordResetRepository.createPasswordResetRequest(passwordResetRequest);
}

export async function deletePasswordResetRequestByEmail(email: string) {
    return passwordResetRepository.deletePasswordResetRequestByEmail(email);
}

export async function findPasswordResetRequestByTokenAndEmail(token: string, email: string) {
    try {
        const passwordRequest = await passwordResetRepository.findPasswordResetRequestByTokenAndEmail(token, email);        
        return passwordRequest;
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new RecordNotFoundException(`No password reset request found for token: ${token} and email: ${email}`);
        }
        throw error;
    }
}