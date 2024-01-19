import * as userRepository from '$lib/server/repositories/userRepository';
import * as userService from '$lib/server/services/userService';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { UserDeletedException } from '../../../exceptions/auth';
import { NoResultError } from 'kysely';
import { RecordNotFoundException } from '../../../exceptions/database';

describe('userService', () => {
	describe('findUserByEmail', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should return user', async () => {
			// arrange
			const email = 'registered@email.com';
			const user = {
				id: '1',
				name: 'testUser',
				email,
				password: 'password',
				email_verified_at: null,
				email_notified_at: null,
				deleted: false
			};
			const findUserByEmailSpy = vi
				.spyOn(userRepository, 'findUserByEmail')
				.mockImplementationOnce(() => {
					return Promise.resolve(user);
				});

			// act
			const result = await userService.findUserByEmail(email);

			// assert
			expect(result).toBe(user);
			expect(findUserByEmailSpy).toBeCalledWith(email);
		});

		it('should throw UserDeletedException for user marked for deletion', async () => {
			// arrange
			const email = 'registered@email.com';
			const user = {
				id: '1',
				name: 'testUser',
				email,
				password: 'password',
				email_verified_at: null,
				email_notified_at: null,
				deleted: true
			};
			vi.spyOn(userRepository, 'findUserByEmail').mockImplementationOnce(() => {
				return Promise.resolve(user);
			});

			// act & assert
			await expect(userService.findUserByEmail(email)).rejects.toThrow(UserDeletedException);
		});

		it('should throw RecordNotFoundException for invalid user', async () => {
			// arrange
			const email = 'invalid@email.com';
			vi.spyOn(userRepository, 'findUserByEmail').mockImplementationOnce(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore Don't want to build entire error object
				throw new NoResultError();
			});

			// act & assert
			await expect(userService.findUserByEmail(email)).rejects.toThrow(RecordNotFoundException);
		});
	});
});
