import { z } from 'zod';

export const registerFormSchema = z
	.object({
		name: z.string().trim().min(4, 'Must be of at-least 4 characters'),
		email: z.string().email('Must be a valid email address'),
		password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
		passwordConfirm: z.string().trim()
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	});

export const loginFormSchema = z.object({
	email: z.string().trim().email('Must be a valid email address'),
	password: z.string().trim().min(8, 'Must be of at-least 8 characters')
});

export const forgotPasswordFormSchema = z.object({
	email: z.string().trim().email('Must be a valid email address')
});

export const passwordResetFormSchema = z
	.object({
		token: z.string().trim(),
		email: z.string().email('Must be a valid email address'),
		password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
		passwordConfirm: z.string().trim()
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	});
