import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import * as authAction from '../../actions/auth';
import { UserNotVerifiedException } from '../../exceptions/auth';
import { createUserSession, getUserId } from '../../utils/auth';

export const load = ({ locals }) => {
    const userId = getUserId(locals.user);
    if (userId) {
        throw redirect(302, '/dashboard');
    }

    return {
        flashMessage: locals.flashMessage
    };
}

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();

        try {
            const user = await authAction.LoginUser(data);
            await createUserSession(cookies, user);
        } catch (error) {
            if (error instanceof UserNotVerifiedException) {
                return fail(400, { error: error.message });
            }

            return fail(400, { error: 'Invalid credentials. Please check email and password.' });
        }

        throw redirect(302, '/dashboard');
    }
} satisfies Actions;