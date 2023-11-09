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

async function initScheduler() {
	const jobScheduler = new JobScheduler();
    await jobScheduler.initialize();
}

await initScheduler();