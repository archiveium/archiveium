import {
	Queue,
	type DefaultJobOptions,
	type JobsOptions,
	type Processor,
	Worker,
	Job
} from 'bullmq';
import type { Redis } from 'ioredis';
import { logger } from '../../../../utils/logger';

export abstract class BaseQueue {
	private queue!: Queue;
	defaultAddJob = true;

	abstract getName(): string;
	abstract getJobName(): string;
	abstract getProcessor(): Processor;

	async addJob(data: unknown = null): Promise<Job> {
		return this.queue.add(this.getJobName(), data, this.getJobOptions());
	}

	getJobOptions(): JobsOptions {
		return {
			repeat: {
				every: 60000 // 60 seconds
			},
			removeOnComplete: true
		};
	}

	getQueueOptions(): DefaultJobOptions | undefined {
		return undefined;
	}

	getQueue(): Queue {
		return this.queue;
	}

	startWorker(redis: Redis): Worker {
		return new Worker(this.getName(), this.getProcessor(), {
			connection: redis.options
		});
	}

	buildQueue(redis: Redis): void {
		this.queue = new Queue(this.getName(), {
			connection: {
				...redis.options,
				enableOfflineQueue: false // disable command queueing for Queue instance
			},
			defaultJobOptions: this.getQueueOptions()
		});

		this.queue.on('error', (err) => {
			logger.error(`Queue Error: ` + JSON.stringify(err));
		});
	}

	addJobByDefault(): boolean {
		return this.defaultAddJob;
	}
}
