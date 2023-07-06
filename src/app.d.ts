// See https://kit.svelte.dev/docs/types#app

import type { FlashMessage } from "./types/session";
import type { User } from "./types/user";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			sessionId: string;
			user?: User;
			flashMessage?: FlashMessage;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
