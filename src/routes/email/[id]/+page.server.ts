import { GetEmailWithS3DataByIdAndUserId } from '../../../actions/email.js';
import { requireUserId } from '../../../utils/auth.js';

export const load = async ({ locals, params }) => {
    const userId = requireUserId(false, locals.user);
    // TODO Validate that params.id is a number
    // redirect otherwise with flash message
    const email = await GetEmailWithS3DataByIdAndUserId(userId, params.id);

    return { email };
}