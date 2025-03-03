import { z } from 'zod';

export const addAccountSchema = z.object({
	name: z.string().trim().min(4, 'Must be of at-least 4 characters'),
	email: z.string().trim().email('Must be a valid email address'),
	password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
	provider_id: z.string().trim().min(1)
});

export const editAccountSchema = z.object({
	name: z.string().trim().min(4, 'Must be of at-least 4 characters').optional().or(z.literal('')),
	password: z
		.string()
		.trim()
		.min(8, 'Must be of at-least 8 characters')
		.optional()
		.or(z.literal(''))
});
