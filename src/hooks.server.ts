import type { Handle } from '@sveltejs/kit';
import { redis } from '$lib/server/redis/connection';
import { buildSessionCacheKey, createGuestSession, deleteFlashMessage } from './utils/auth';
import { runMigrations } from '$lib/server/database/migration';
import { createAdminUser, seedDatabase } from '$lib/server/database/seed';
import { building } from '$app/environment';
import { scheduler } from '$lib/server/jobs';
import { UserInvitationQueue } from '$lib/server/jobs/queues/UserInvitationQueue';
import { PasswordResetQueue } from '$lib/server/jobs/queues/PasswordResetQueue';
import { EmailVerificationQueue } from '$lib/server/jobs/queues/EmailVerificationQueue';
import { SyncAccountQueue } from '$lib/server/jobs/queues/SyncAccountQueue';
import { SyncFolderQueue } from '$lib/server/jobs/queues/SyncFolderQueue';
import { DeleteAccountQueue } from '$lib/server/jobs/queues/DeleteAccountQueue';
import { DeleteUserQueue } from '$lib/server/jobs/queues/DeleteUserQueue';
import config from 'config';
import { logger } from './utils/logger';
import { ImportEmailQueue } from '$lib/server/jobs/queues/ImportEmailQueue';
import { IndexEmailQueue } from '$lib/server/jobs/queues/IndexEmailQueue';

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

async function gracefulShutdown(signal: string) {
	logger.info(`Received ${signal}, shutting down.`);
	await scheduler.stopWorkers();
	// Exit successfully for other asynchronous closings
	process.exit(0);
}

async function initQueues() {
	await scheduler.addQueues([
		new UserInvitationQueue(),
		new PasswordResetQueue(),
		new EmailVerificationQueue(),
		new SyncAccountQueue(),
		new SyncFolderQueue(),
		new DeleteAccountQueue(),
		new DeleteUserQueue(),
		new ImportEmailQueue(),
		new IndexEmailQueue()
	]);
	if (!config.get<boolean>('app.useAsCronProcessor')) {
		logger.warn('Skipping initialization of workers for queues');
		return;
	}
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

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', function (err) {
	logger.error(err, 'Uncaught exception');
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error({ promise, reason }, 'Unhandled Rejection at: Promise');
});
