import { z } from 'zod';
import { createUser, getUserByEmail, updatePasswordByUserEmail } from '../models/users';
import crypto from 'crypto';
import {
	InvalidPasswordException,
	PasswordResetRequestTokenExpiredException,
	UserNotAcceptedException,
	UserNotVerifiedException
} from '../exceptions/auth';
import type { User } from '../types/user';
import { getInvitedUser } from '../models/userInvitations';
import { RecordNotFoundException } from '../exceptions/database';
import {
	createPasswordResetRequest,
	deletePasswordResetRequestByEmail,
	deletePasswordResetRequestById,
	getPasswordResetRequestByEmail,
	getPasswordResetRequestByTokenAndEmail
} from '../models/passwordResets';
import { DateTime } from 'luxon';
import { deleteUserSession } from '../utils/auth';

const registerFormSchema = z
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
const loginFormSchema = z.object({
	email: z.string().trim().email('Must be a valid email address'),
	password: z.string().trim().min(8, 'Must be of at-least 8 characters')
});
const forgotPasswordFormSchema = z.object({
	email: z.string().trim().email('Must be a valid email address')
});
const passwordResetFormSchema = z
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

function verifyUserPassword(hashedPassword: string, password: string) {
	const [salt, key] = hashedPassword.split(':');
	const keyBuffer = Buffer.from(key, 'hex');
	const derivedKey = crypto.scryptSync(password, salt, 64);
	const isValid = crypto.timingSafeEqual(keyBuffer, derivedKey);

	if (!isValid) {
		throw new InvalidPasswordException('Invalid password');
	}
}

export async function CreatePasswordResetRequest(data: FormData): Promise<void> {
	const validatedData = forgotPasswordFormSchema.parse({ email: data.get('email') });
	let user: User;

	// validate if email exists in users table and has a verified email
	try {
		user = await getUserByEmail(validatedData.email);
		if (!user.email_verified_at) {
			throw new UserNotVerifiedException(
				'Please verify your email before attempting to reset password'
			);
		}
	} catch (error) {
		// if it doesn't do nothing
		if (error instanceof RecordNotFoundException) {
			console.warn(`Invalid password request for: ${validatedData.email}`);
		}
		throw error;
	}

	// if there's an existing token, delete that and generate new one
	try {
		const passwordResetRequest = await getPasswordResetRequestByEmail(user.email);
		await deletePasswordResetRequestById(passwordResetRequest.id);
	} catch (error) {
		if (!(error instanceof RecordNotFoundException)) {
			throw error;
		}
	}

	// insert password_reset_token and expiry in users table
	const resetToken = crypto.randomBytes(32).toString('hex');
	const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	await createPasswordResetRequest({ email: user.email, password_reset_token: hashedResetToken });
}

export async function LoginUser(credentials: FormData): Promise<User> {
	const validatedData = loginFormSchema.parse({
		email: credentials.get('email'),
		password: credentials.get('password')
	});
	const user = await getUserByEmail(validatedData.email);

	if (user.email_verified_at) {
		verifyUserPassword(user.password, validatedData.password);
		return user;
	}
	throw new UserNotVerifiedException('Please verify your email address before logging in.');
}

export async function LogoutUser(sessionId: string): Promise<void> {
	await deleteUserSession(sessionId);
}

export async function RegisterUser(data: FormData) {
	const validatedData = registerFormSchema.parse({
		name: data.get('name'),
		email: data.get('email'),
		password: data.get('password'),
		passwordConfirm: data.get('passwordConfirm')
	});
	const invitedUser = await getInvitedUser(validatedData.email);
	if (!invitedUser.accepted) {
		throw new UserNotAcceptedException(
			`${validatedData.email} has not been chosen for registration yet.`
		);
	}

	await createUser(validatedData);
}

export async function ValidatePasswordResetToken(token: string, email: string): Promise<void> {
	const passwordRequestRequest = await getPasswordResetRequestByTokenAndEmail(token, email);
	// check token expiry
	const currentDate = DateTime.now();
	const expiryDate = DateTime.fromJSDate(passwordRequestRequest.created_at).plus({ hours: 1 });
	if (expiryDate < currentDate) {
		throw new PasswordResetRequestTokenExpiredException(
			`Password reset token has expired for email: ${email}`
		);
	}
}

export async function UpdatePassword(data: FormData): Promise<void> {
	const validatedData = passwordResetFormSchema.parse({
		token: data.get('token'),
		email: data.get('email'),
		password: data.get('password'),
		passwordConfirm: data.get('passwordConfirm')
	});
	await ValidatePasswordResetToken(validatedData.token, validatedData.email);
	await updatePasswordByUserEmail(validatedData.email, validatedData.password);

	// allow failure
	try {
		await deletePasswordResetRequestByEmail(validatedData.email);
	} catch (error) {
		console.error(error);
	}
}
