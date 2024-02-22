import { BaseQueue } from "$lib/server/jobs/queues/baseQueue";
import type { Job, Processor } from "bullmq";

async function mockProcessor(job: Job): Promise<void> {
	// do nothing
}

export class MockCookie {
	private cookieData;

	constructor(cookieData = {}) {
		this.cookieData = cookieData;
	}

	set(key: string) {
		// Do nothing
	}

	get(key: string) {
		return '';
	}

	getAll() {
		return [];
	}

	delete(key: string) {
		// return '';
	}

	serialize() {
		return '';
	}
}

export class MockQueue extends BaseQueue {
	getName(): string {
		return 'MockQueue';
	}

	getJobName(): string {
		return 'mockQueue';
	}

	getProcessor(): Processor {
		return mockProcessor;
	}
}