import { z } from 'zod';

export const passwordUpdateFormSchema = z
	.object({
		currentPassword: z.string().trim().min(8, 'Must be of at-least 8 characters'),
		password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
		passwordConfirm: z.string().trim()
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	});
