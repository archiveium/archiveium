import type { Handle } from '@sveltejs/kit';
import { redis } from '$lib/server/redis/connection';
import { createUserSession, deleteFlashMessage } from './utils/auth';
import { JobScheduler } from '$lib/server/jobs';

export const handle = (async ({ event, resolve }) => {
	const sessionId = event.cookies.get('sessionId');
	if (sessionId) {
		const result = await redis.get(`session:${sessionId}`);
		if (result) {
			const sessionData = JSON.parse(result);
			if (sessionData.flashMessage) {
				await deleteFlashMessage(sessionId);
			}
			event.locals = sessionData;
		}
		event.locals.sessionId = sessionId;
	} else {
		// temporary session
		event.locals.sessionId = await createUserSession(event.cookies);
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

await initScheduler();