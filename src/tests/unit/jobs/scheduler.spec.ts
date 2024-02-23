import { scheduler } from '$lib/server/jobs';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { MockQueue } from '../../setup';
import * as bullmq from 'bullmq';
import { InvalidQueueException } from '../../../exceptions/scheduler';

describe('scheduler', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should add queue', async () => {
		// arrange
		const mockQueue = new MockQueue();
		mockQueue.defaultAddJob = false;

		// act
		await scheduler.addQueue(mockQueue);

		// assert
		expect(scheduler.queues.size).toBe(1);
		expect(Array.from(scheduler.queues.keys())).toStrictEqual(['MockQueue']);
		expect(scheduler.queues.has('MockQueue')).toBeTruthy();
	});

	it('should add multiple queues', async () => {
		// arrange
		const mockQueue = new MockQueue();
		mockQueue.defaultAddJob = false;

		// act
		await scheduler.addQueues([mockQueue]);

		// assert
		expect(scheduler.queues.size).toBe(1);
		expect(Array.from(scheduler.queues.keys())).toStrictEqual(['MockQueue']);
		expect(scheduler.queues.has('MockQueue')).toBeTruthy();
	});

	it('should start worker', async () => {
		// arrange
		const mockQueue = new MockQueue();
		mockQueue.defaultAddJob = false;
		scheduler.addQueue(mockQueue);
		const workerSpy = vi.spyOn(bullmq, 'Worker');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore return value of call
		workerSpy.mockResolvedValueOnce(undefined);

		// act
		scheduler.startWorker(mockQueue);

		// assert
		expect(workerSpy).toHaveBeenCalledOnce();
		expect(workerSpy.mock.lastCall?.[0]).toBe('MockQueue');
		expect(workerSpy.mock.lastCall?.[1]).toStrictEqual(mockQueue.getProcessor());
	});

	it('should start all workers', async () => {
		// arrange
		const mockQueue = new MockQueue();
		mockQueue.defaultAddJob = false;
		scheduler.addQueue(mockQueue);
		const workerSpy = vi.spyOn(bullmq, 'Worker');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore return value of call
		workerSpy.mockResolvedValueOnce(undefined);

		// act
		scheduler.startWorkers();

		// assert
		expect(workerSpy).toHaveBeenCalledOnce();
		expect(workerSpy.mock.lastCall?.[0]).toBe('MockQueue');
		expect(workerSpy.mock.lastCall?.[1]).toStrictEqual(mockQueue.getProcessor());
	});

	it('should add job by queue name', async () => {
		// arrange
		const mockQueue = new MockQueue();
		scheduler.addQueues([mockQueue]);
		const queueAddSpy = vi.spyOn(bullmq.Queue.prototype, 'add');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		queueAddSpy.mockResolvedValue(undefined);

		// act
		await scheduler.addJobByQueueName('MockQueue');

		// assert
		expect(scheduler.queues.size).toBe(1);
		expect(Array.from(scheduler.queues.keys())).toStrictEqual(['MockQueue']);
		expect(scheduler.queues.has('MockQueue')).toBeTruthy();
	});

	it('should throw exception for invalid queue name on adding job by queue name', async () => {
		// arrange
		const mockQueue = new MockQueue();
		scheduler.addQueues([mockQueue]);
		const queueSpy = vi.spyOn(bullmq, 'Queue');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		queueSpy.mockResolvedValue(undefined);

		// act & assert
		await expect(scheduler.addJobByQueueName('WrongQueue')).rejects.toThrow(InvalidQueueException);
	});

	it('should get all job counts', async () => {
		// arrange
		const mockQueue = new MockQueue();
		scheduler.addQueues([mockQueue]);
		const queueGetJobCountsSpy = vi.spyOn(bullmq.Queue.prototype, 'getJobCounts');
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		queueGetJobCountsSpy.mockResolvedValue({ failed: 1, delayed: 2 });

		// act
		const allJobCounts = await scheduler.getAllJobCounts();

		// assert
		expect(queueGetJobCountsSpy).toBeCalledWith('failed', 'delayed');
		expect(allJobCounts).toStrictEqual([
			{
				name: 'MockQueue',
				status: { failed: 1, delayed: 2 }
			}
		]);
	});
});
