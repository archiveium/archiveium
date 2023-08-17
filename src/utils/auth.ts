import { redirect, type Cookies } from '@sveltejs/kit';
import crypto from 'crypto';
import { CacheDeleteFailedException, CacheSaveFailedException } from '../exceptions/cache';
import { redis } from '$lib/server/redis/connection';
import type { FlashMessage, SessionData } from '../types/session';
import type { User } from '../types/user';

export function hashPassword(rawPassword: string): string {
	const salt = crypto.randomBytes(16).toString('hex');
	const derivedKey = (crypto.scryptSync(rawPassword, salt, 64) as Buffer).toString('hex');
	return `${salt}:${derivedKey}`;
}

export async function createUserSession(cookies: Cookies, user?: User): Promise<string> {
	const sessionId = cookies.get('sessionId') ?? crypto.randomUUID();
	const sessionExpiry = 60 * 60 * 24 * 7; // one week
	const sessionData: SessionData = user
		? { user: { id: user.id, name: user.name, email: user.email } }
		: {};
	const result = await redis.setex(
		`session:${sessionId}`,
		sessionExpiry,
		JSON.stringify(sessionData)
	);
	if (result === 'OK') {
		cookies.set('sessionId', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			// TODO Enable it
			// secure: !dev,
			maxAge: sessionExpiry
		});
	} else {
		throw new CacheSaveFailedException(`Failed to save session`);
	}
	return sessionId;
}

export async function deleteUserSession(sessionId: string): Promise<void> {
	const result = await redis.del(`session:${sessionId}`);
	if (result < 1) {
		throw new CacheDeleteFailedException(`Failed to delete session`);
	}
}

export async function saveFlashMessage(
	sessionId: string,
	flashMessage: FlashMessage
): Promise<void> {
	const sessionExpiry = 60 * 60 * 24 * 7; // one week
	const savedSessionData = await getSessionData(sessionId);
	savedSessionData.flashMessage = flashMessage;
	const result = await redis.setex(
		`session:${sessionId}`,
		sessionExpiry,
		JSON.stringify(savedSessionData)
	);
	if (result !== 'OK') {
		throw new CacheSaveFailedException(`Failed to save session`);
	}
}

export async function deleteFlashMessage(sessionId: string): Promise<void> {
	const sessionExpiry = 60 * 60 * 24 * 7; // one week
	const savedSessionData = await getSessionData(sessionId);
	delete savedSessionData.flashMessage;
	const result = await redis.setex(
		`session:${sessionId}`,
		sessionExpiry,
		JSON.stringify(savedSessionData)
	);
	if (result !== 'OK') {
		throw new CacheSaveFailedException(`Failed to save session`);
	}
}

export function requireUserId(redirectIfLoggedIn: boolean, user?: User): string {
	if (!user) {
		throw redirect(302, '/login');
	}

	if (user && redirectIfLoggedIn) {
		throw redirect(302, '/dashboard');
	}

	return user.id.toString();
}

export function getUserId(user?: User): string | undefined {
	return user?.id.toString();
}

async function getSessionData(sessionId: string): Promise<SessionData> {
	const result = await redis.get(`session:${sessionId}`);
	if (result) {
		return JSON.parse(result);
	}
	return {};
}
