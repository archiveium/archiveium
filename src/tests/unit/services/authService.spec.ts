import * as authService from '$lib/server/services/authService';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { MockCookie } from '../../setup';
import * as authUtil from '../../../utils/auth';
import crypto from 'crypto';

const mocks = vi.hoisted(() => {
    return {
        del: vi.fn(),
    }
});

vi.mock('$lib/server/redis/connection', () => {
    return {
        redis: {
            del: mocks.del,
        },
    };
});

describe('authService', () => {
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