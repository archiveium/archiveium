import { createAdminUser } from '$lib/server/database/seed';
import * as userService from '$lib/server/services/userService';
import { expect, describe, it, vi, afterEach } from 'vitest';
import config from 'config';
import { ZodError } from 'zod';

describe('seed', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should create admin user if it does not exist', async () => {
		// arrange
		const createAdminUserSpy = vi.spyOn(userService, 'createAdminUser');
		vi.spyOn(config, 'get').mockReturnValueOnce('test@email.com').mockReturnValueOnce('password');
		vi.spyOn(userService, 'findAdminUserCount').mockResolvedValueOnce(0);
		createAdminUserSpy.mockResolvedValueOnce({
			insertId: BigInt(1234),
			numInsertedOrUpdatedRows: BigInt(1)
		});

		// act
		await createAdminUser();

		// assert
		expect(createAdminUserSpy).toHaveBeenCalledWith('test@email.com', 'password');
	});

	it('should not create admin user if one already exists', async () => {
		// arrange
		const createAdminUserSpy = vi.spyOn(userService, 'createAdminUser');
		vi.spyOn(userService, 'findAdminUserCount').mockResolvedValueOnce(1);

		// act
		await createAdminUser();

		// assert
		expect(createAdminUserSpy).not.toHaveBeenCalled();
	});

	it('should throw an exception if invalid email is given', async () => {
		// arrange
		vi.spyOn(config, 'get').mockReturnValueOnce('test@email').mockReturnValueOnce('password');
		vi.spyOn(userService, 'findAdminUserCount').mockResolvedValueOnce(0);

		// act & assert
		await expect(createAdminUser()).rejects.toThrow(ZodError);
	});

	it('should throw an exception if invalid password is given', async () => {
		// arrange
		vi.spyOn(config, 'get').mockReturnValueOnce('test@email.com').mockReturnValueOnce('pass');
		vi.spyOn(userService, 'findAdminUserCount').mockResolvedValueOnce(0);

		// act & assert
		await expect(createAdminUser()).rejects.toThrow(ZodError);
	});
});
