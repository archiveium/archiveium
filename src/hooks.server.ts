import type { Handle } from '@sveltejs/kit';
import { redis } from '$lib/server/redis/connection';
import { buildSessionCacheKey, createGuestSession, deleteFlashMessage } from './utils/auth';
import { JobScheduler } from '$lib/server/jobs';
import { runMigrations } from '$lib/server/database/migration';
import { seedDatabase } from '$lib/server/database/seed';
import { building } from '$app/environment';

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

async function initScheduler() {
	const jobScheduler = new JobScheduler();
	await jobScheduler.initialize();
}

if (!building) {
	// Run migrations
	await runMigrations();
	// Seed database
	await seedDatabase();
	// Initialize cron jobs
	await initScheduler();
}