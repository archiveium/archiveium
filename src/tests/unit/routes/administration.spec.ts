import { load } from '../../../routes/administration/+page.server';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { scheduler } from '$lib/server/jobs';
import { Redirect } from '@sveltejs/kit';
import * as authUtils from '../../../utils/auth';

const mocks = vi.hoisted(() => {
	return {
		get: vi.fn(),
		setex: vi.fn()
	};
});

vi.mock('ioredis', () => {
	return {
		Redis: vi.fn().mockImplementation(() => {
			return {
				get: mocks.get,
				setex: mocks.setex
			};
		})
	};
});

describe('administration', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('load', () => {
		it('should return job counts', async () => {
			// arrange
			vi.spyOn(scheduler, 'getAllJobCounts').mockResolvedValue([
				{
					name: 'JobName',
					status: {
						failed: 1,
						delayed: 2
					}
				}
			]);
			const saveFlashMessageSpy = vi.spyOn(authUtils, 'saveFlashMessage');

			// act
			const res = await load({ locals: { user: { id: 'user-id', admin: true } } });

			// assert
			expect(res).toStrictEqual({
				queueJobCounts: [{ name: 'JobName', status: { failed: 1, delayed: 2 } }]
			});
			expect(saveFlashMessageSpy).not.toBeCalled();
		});

		it('should throw exception if user is not logged in', async () => {
			// arrange
			const schedulerSpy = vi.spyOn(scheduler, 'getAllJobCounts');
			const saveFlashMessageSpy = vi.spyOn(authUtils, 'saveFlashMessage');

			// act & assert
			await expect(load({ locals: { user: undefined } })).rejects.toThrow(Redirect);
			expect(saveFlashMessageSpy).not.toBeCalled();
			expect(schedulerSpy).not.toBeCalled();
		});

		it('should throw exception if user is not admin', async () => {
			// arrange
			const schedulerSpy = vi.spyOn(scheduler, 'getAllJobCounts');
			const saveFlashMessageSpy = vi.spyOn(authUtils, 'saveFlashMessage');
			mocks.get.mockResolvedValue(JSON.stringify({ flashMessage: undefined }));
			mocks.setex.mockResolvedValue('OK');

			// act & assert
			await expect(
				load({ locals: { sessionId: 'session-id', user: { id: 'user-id', admin: false } } })
			).rejects.toThrow(Redirect);
			expect(saveFlashMessageSpy).toBeCalledWith('session-id', {
				type: 'error',
				message: 'You do not have permission to access that page.'
			});
			expect(schedulerSpy).not.toBeCalled();
		});
	});
});
