import { redirect } from '@sveltejs/kit';
import { getUserId } from '../utils/auth.js';

export const load = async ({ locals }) => {
	const userId = getUserId(locals.user);
	if (userId) {
		throw redirect(302, '/dashboard');
	}

	throw redirect(302, '/login');
};
