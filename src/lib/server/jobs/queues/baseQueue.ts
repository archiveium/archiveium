import { Queue, type DefaultJobOptions, type JobsOptions, type Processor, Worker, Job } from "bullmq";
import type { Redis } from "ioredis";

export abstract class BaseQueue {
  private queue!: Queue;

  abstract getName(): string;
  abstract getJobName(): string;
  abstract getProcessor(): Processor;

  async addJob(data: unknown = null): Promise<Job> {
    return this.queue.add(
      this.getJobName(),
      data,
      this.getJobOptions()
    );
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
		return new Worker(
			this.getName(),
			this.getProcessor(),
			{
				connection: redis
			}
		);
  }

  buildQueue(redis: Redis): void {
    this.queue = new Queue(this.getName(), {
      connection: redis,
      defaultJobOptions: this.getQueueOptions(),
    });
  }

  addJobByDefault(): boolean {
    return true;
  }
};