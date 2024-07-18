import type { Job, Worker } from 'bullmq';
import { InvalidQueueException } from '../../../exceptions/scheduler';
import { logger } from '../../../utils/logger';
import { redis } from '../redis/connection';
import type { BaseQueue } from './queues/baseQueue';
import type { Redis } from 'ioredis';
import type { JobCount } from '../../../types/scheduler';
import _ from 'lodash';

class Scheduler {
	queues = new Map<string, BaseQueue>();
	workers = new Map<string, Worker>();

	constructor(public readonly redis: Redis) {
		// Do nothing
	}

	startWorkers() {
		this.queues.forEach((queue) => {
			this.startWorker(queue);
		});
	}

	async stopWorkers() {
		for (const [name, worker] of this.workers) {
			logger.info(`Stopping worker ${name}`);
			await worker.close();
			logger.info(`Stopped worker ${name}`);
		}
	}

	startWorker(queue: BaseQueue) {
		logger.info(`Starting worker for queue ${queue.getJobName()}`);

		const worker = queue.startWorker(this.getRedisConnection());
		this.workers.set(worker.id, worker);

		worker.on('error', (err) => {
			logger.error(`Worker Error: ` + JSON.stringify(err));
		});
		logger.info(`Started worker ${worker.name} (${worker.id})`);
	}

	async addQueues(queues: BaseQueue[]): Promise<void> {
		const promises = queues.map((queue) => {
			this.buildQueue(queue);
			return this.addQueue(queue);
		});

		try {
			await Promise.all(promises);
		} catch (error) {
			logger.error(`[Scheduler][addQueues]: ${JSON.stringify(error)}`);
			throw error;
		}
	}

	async addQueue(queue: BaseQueue): Promise<void> {
		this.queues.set(queue.getName(), queue);
		if (queue.addJobByDefault()) {
			await queue.addJob();
		}
	}

	async addJobByQueueName(queueName: string, data: unknown = null): Promise<Job> {
		const queue = this.getQueueByName(queueName);
		return queue.addJob(data);
	}

	async getAllJobCounts(): Promise<JobCount[]> {
		const jobCounts: JobCount[] = [];
		for await (const queue of this.queues.values()) {
			const jobCount = await queue.getQueue().getJobCounts();
			jobCounts.push({
				jobName: queue.getName(),
				displayName: _.startCase(queue.getName()),
				status: jobCount
			});
		}
		return jobCounts;
	}

	retryFailedJobs(queueName: string): Promise<void> {
		const queue = this.getQueueByName(queueName);
		return queue.getQueue().retryJobs();
	}

	private getQueueByName(queueName: string): BaseQueue {
		const queue = this.queues.get(queueName);
		if (!queue) {
			throw new InvalidQueueException(queueName);
		}
		return queue;
	}

	private getRedisConnection(): Redis {
		return this.redis;
	}

	private buildQueue(queue: BaseQueue): void {
		queue.buildQueue(this.getRedisConnection());
	}
}

export const scheduler = new Scheduler(redis);
