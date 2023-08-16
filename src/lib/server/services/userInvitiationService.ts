import * as userInvitationRepository from '$lib/server/repositories/userInvitationRepository';
import { NoResultError } from 'kysely';
import { UserNotInvitedException } from '../../../exceptions/auth';

export async function insertUserInvitation(username: string) {
    return userInvitationRepository.insertUserInvitation(username);
}

export async function findUserByEmail(email: string) {
    try {
        const user = userInvitationRepository.findUserByEmail(email);
        return  user;        
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new UserNotInvitedException(`${email} has not been invited`);
        }
        throw error;
    }
}