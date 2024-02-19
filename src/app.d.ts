// See https://kit.svelte.dev/docs/types#app

import type { UserSelect } from '$lib/server/database/wrappers';
import type { FlashMessage } from './types/session';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			sessionId: string;
			user?: UserSelect;
			flashMessage?: FlashMessage;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
