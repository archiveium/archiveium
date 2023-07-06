import { fail, redirect, type Actions } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { RegisterUser } from '../../actions/auth';
import { UserAlreadyRegisteredException, UserNotAcceptedException, UserNotInvitedException } from '../../exceptions/auth';
import { getUserId, saveFlashMessage } from '../../utils/auth';

export const load = async ({ locals }) => {
    const userId = getUserId(locals.user);
    if (userId) {
        throw redirect(302, '/dashboard');
    }
}

export const actions = {
    default: async ({ request, locals }) => {
        const userId = getUserId(locals.user);
        if (userId) {
            throw redirect(302, '/dashboard');
        }
    
        const body = await request.formData();
    
        try {
            await RegisterUser(body);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return fail(400, {
                    fieldErrors: error.flatten().fieldErrors,
                });
            } else if (
                error instanceof UserNotInvitedException || 
                error instanceof UserNotAcceptedException || 
                error instanceof UserAlreadyRegisteredException
            ) {
                return fail(400, {
                    error: error.message,
                });
            }
    
            return fail(400, {
                error: (error.code && (error.code == 23505)) ? 'Email is already registered.' : 'There was an error registering your account. Please try again.',
            });
        }
    
        await saveFlashMessage(locals.sessionId, {
            type: 'success',
            message: 'An email has been sent to your email address. Please verify before logging in.'
        });
        throw redirect(302, '/login');
    }
} satisfies Actions;