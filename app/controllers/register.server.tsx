import type { FormData } from '../types/form';
import { z } from 'zod';
import { insertUserInvitation } from '~/models/userInvitations';

const formSchema = z.object({
    email: z.string().email('The email must be a valid email address'),
});

export default async function RegisterForPreview(formData: FormData): Promise<void> {
    // TODO Throw error if email is present in users table
    // TODO Add honeypot spam protection 
    const validatedData = formSchema.parse(formData);
    await insertUserInvitation(validatedData.email);
}