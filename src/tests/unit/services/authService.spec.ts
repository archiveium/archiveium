import * as authService from '$lib/server/services/authService';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { MockCookie } from '../../setup';
import * as authUtil from '../../../utils/auth';
import crypto from 'crypto';
import { InvalidPasswordException } from '../../../exceptions/auth';

const mocks = vi.hoisted(() => {
	return {
		del: vi.fn()
	};
});

vi.mock('$lib/server/redis/connection', () => {
	return {
		redis: {
			del: mocks.del
		}
	};
});

describe('authService', () => {
	describe('verifyUserPassword', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should validate password', async () => {
			// arrange
			const hashedPassword =
				'1e3a7c3cece7f5cc58e5dcf1fcc6a1b4:7b01211c3acd31b68507414cd14f5b0170005293934f708dbd01b26c6e1c425213b993abf94c7de4f2a22604240195e0a3ee26f1776aab4218b322d77a89f591';
			const password = 'password';

			// act
			const res = authService.verifyUserPassword(hashedPassword, password);

			// assert
			expect(res).toBeUndefined();
		});

		it('should throw error code ERR_INVALID_ARG_TYPE if Buffer.from fails', async () => {
			// arrange
			const hashedPassword = 'invalid-hash';
			const password = 'password';

			// act & assert
			expect(() => authService.verifyUserPassword(hashedPassword, password)).toThrow(TypeError);
		});

		it('should throw InvalidPasswordException for invalid password', async () => {
			// arrange
			const hashedPassword =
				'1e3a7c3cece7f5cc58e5dcf1fcc6a1b4:7b01211c3acd31b68507414cd14f5b0170005293934f708dbd01b26c6e1c425213b993abf94c7de4f2a22604240195e0a3ee26f1776aab4218b322d77a89f591';
			const password = 'passwords';

			// act & assert
			expect(() => authService.verifyUserPassword(hashedPassword, password)).toThrow(
				InvalidPasswordException
			);
		});

		it('should throw error code ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH if crypto.timingSafeEqual fails', async () => {
			// arrange
			const hashedPassword = ':1e3a7c3cece7f5cc58e5dcf1fcc6a1b4';
			const password = 'passwords';

			// act & assert
			expect(() => authService.verifyUserPassword(hashedPassword, password)).toThrow(
				'Input buffers must have the same byte length'
			);
		});

		it('should throw error code ERR_INVALID_ARG_TYPE if crypto.scryptSync fails', async () => {
			// arrange
			const hashedPassword = '1e3a7c3cece7f5cc58e5dcf1fcc6a1b4:1';
			const password = undefined;

			// act & assert
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore because we want to force error
			expect(() => authService.verifyUserPassword(hashedPassword, password)).toThrow(
				'The "password" argument must be of type string or an instance of ArrayBuffer, Buffer, TypedArray, or DataView. Received undefined'
			);
		});
	});

	describe('logoutUser', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should delete user session', async () => {
			// arrange
			const sessionId = 'session:1:random-uuid';
			const mockCookie = new MockCookie();
			const deleteUserSessionSpy = vi.spyOn(authUtil, 'deleteUserSession');
			mocks.del.mockResolvedValue(1);

			// act
			await authService.logoutUser(sessionId, mockCookie);

			// assert
			expect(deleteUserSessionSpy).toHaveBeenCalledWith(sessionId);
		});

		it('should set session cookie', async () => {
			// arrange
			const randomUUID = '3b9705e3-b7aa-4bc2-82f4-1a2e4c74c053';
			const sessionId = 'session:1:random-uuid';
			const mockCookie = new MockCookie();
			mocks.del.mockResolvedValue(1);
			const cookieSetSpy = vi.spyOn(mockCookie, 'set');
			vi.spyOn(crypto, 'randomUUID').mockImplementationOnce((options) => {
				return randomUUID;
			});

			// act
			await authService.logoutUser(sessionId, mockCookie);

			// assert
			expect(cookieSetSpy).toHaveBeenCalledWith('sessionId', randomUUID);
		});

		it('should return guest session id', async () => {
			// arrange
			const randomUUID = '3b9705e3-b7aa-4bc2-82f4-1a2e4c74c053';
			const sessionId = 'session:1:random-uuid';
			const mockCookie = new MockCookie();
			mocks.del.mockResolvedValue(1);
			vi.spyOn(crypto, 'randomUUID').mockImplementationOnce((options) => {
				return randomUUID;
			});

			// act
			const guestSessionId = await authService.logoutUser(sessionId, mockCookie);

			// assert
			expect(guestSessionId).toBe(randomUUID);
		});
	});
});
