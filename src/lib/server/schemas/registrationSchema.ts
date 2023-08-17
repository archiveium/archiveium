import { z } from 'zod';

export const formSchema = z.object({
	email: z.string().email('The email must be a valid email address')
});

export const registrationSchema = z.object({
	id: z.string().min(1),
	hash: z.string().min(1),
	expires: z.string().min(1),
	signature: z.string().min(1)
});