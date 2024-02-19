import type { Handle } from '@sveltejs/kit';
import { redis } from '$lib/server/redis/connection';
import { buildSessionCacheKey, createGuestSession, deleteFlashMessage } from './utils/auth';
import { runMigrations } from '$lib/server/database/migration';
import { createAdminUser, seedDatabase } from '$lib/server/database/seed';
import { building } from '$app/environment';
import { scheduler } from '$lib/server/jobs';
import { UserInvitationQueue } from '$lib/server/jobs/queues/userInvitationQueue';
import { PasswordResetQueue } from '$lib/server/jobs/queues/passwordResetQueue';
import { EmailVerificationQueue } from '$lib/server/jobs/queues/emailVerificationQueue';
import { SyncAccountQueue } from '$lib/server/jobs/queues/syncAccountQueue';
import { SyncFolderQueue } from '$lib/server/jobs/queues/syncFolder';
import { deleteAccountQueue } from '$lib/server/jobs/queues/deleteAccountQueue';
import { deleteUserQueue } from '$lib/server/jobs/queues/deleteUserQueue';
import { ImportEmailQueue } from '$lib/server/jobs/queues/importEmailQueue';
import config from 'config';
import { logger } from './utils/logger';

export const handle = (async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sessionId');
	if (sessionId) {
		const result = await redis.get(buildSessionCacheKey(sessionId));
		if (result) {
			const sessionData = JSON.parse(result);
			if (sessionData.flashMessage) {
				await deleteFlashMessage(sessionId);
			}
			event.locals = { ...sessionData, sessionId };
		}
		// if sessionId represents a logged in user's session
		// and redis has no session data, replace it with guest session
		else if (sessionId.includes(':')) {
			event.locals.sessionId = await createGuestSession(event.cookies);
		} else {
			event.locals.sessionId = sessionId;
		}
	} else {
		event.locals.sessionId = await createGuestSession(event.cookies);
	}

	const response = await resolve(event);

	return response;
}) satisfies Handle;

// Monkey patch
// As per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

async function initQueues() {
	if (!config.get<boolean>('app.useAsCronProcessor')) {
		logger.warn('Skipping initialization of queues');
		return;
	}
	await scheduler.addQueues([
		new UserInvitationQueue(),
		new PasswordResetQueue(),
		new EmailVerificationQueue(),
		new SyncAccountQueue(),
		new SyncFolderQueue(),
		new deleteAccountQueue(),
		new deleteUserQueue(),
		new ImportEmailQueue(),
	]);
	scheduler.startWorkers();
}

if (!building) {
	// Run migrations
	await runMigrations();
	// Seed database
	await seedDatabase();
	// Create admin user
	await createAdminUser();
	// Initialize queues
	await initQueues();
}
