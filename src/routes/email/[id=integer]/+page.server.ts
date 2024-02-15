import * as s3Service from '$lib/server/services/s3Service';
import { requireUserId } from '../../../utils/auth.js';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

export const load = async ({ locals, params }) => {
	const userId = requireUserId(false, locals.user);
	// TODO Validate that params.id is a number
	// redirect otherwise with flash message
	const email = await s3Service.findEmailByIdAndUserId(userId, params.id);

	const window = new JSDOM('').window;
	const purify = DOMPurify(window);
	email.html = purify.sanitize(email.html);

	return { email };
};
