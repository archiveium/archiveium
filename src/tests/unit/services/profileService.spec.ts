import * as profileService from '$lib/server/services/profileService';
import * as userService from '$lib/server/services/userService';
import * as authService from '$lib/server/services/authService';
import * as userRepository from '$lib/server/repositories/userRepository';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { InvalidPasswordException } from '../../../exceptions/auth';
import { ZodError } from 'zod';

describe('profileService', () => {
	describe('updatePassword', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should update password successfully', async () => {
			// arrange
			const hashedPassword = '1e3a7c3cece7f5cc58e5dcf1fcc6a1b4:7b01211c3acd31b68507414cd14f5b0170005293934f708dbd01b26c6e1c425213b993abf94c7de4f2a22604240195e0a3ee26f1776aab4218b322d77a89f591';
            const userId = 'user-id';
            const findUserByIdSpy = vi.spyOn(userService, 'findUserById');
            const updatePasswordByUserEmailSpy = vi.spyOn(userService, 'updatePasswordByUserEmail');
            const verifyUserPasswordSpy = vi.spyOn(authService, 'verifyUserPassword');
            const formData = new FormData();
            formData.set('currentPassword', 'password');
            formData.set('password', 'password-new');
            formData.set('passwordConfirm', 'password-new');
            vi.spyOn(userRepository, 'findUserById').mockResolvedValue({
                id: userId,
                name: 'test',
                password: hashedPassword,
                email: 'test@email.com',
                email_notified_at: null,
                email_verified_at: null,
            });
            vi.spyOn(userRepository, 'updatePasswordByUserEmail').mockResolvedValue([{
                numUpdatedRows: 1n,
            }]);

			// act
			const result = await profileService.updatePassword(userId, formData);

			// assert
			expect(result).toStrictEqual([{ numUpdatedRows: 1n }]);
            expect(findUserByIdSpy).toHaveBeenCalledWith(userId);
            expect(verifyUserPasswordSpy).toHaveBeenCalledWith(hashedPassword, 'password');
            expect(updatePasswordByUserEmailSpy).toHaveBeenCalledWith('test@email.com', 'password-new');
		});

		it('should throw error if passwords do not match', async () => {
			// arrange
			const hashedPassword = '1e3a7c3cece7f5cc58e5dcf1fcc6a1b4:7b01211c3acd31b68507414cd14f5b0170005293934f708dbd01b26c6e1c425213b993abf94c7de4f2a22604240195e0a3ee26f1776aab4218b322d77a89f590';
            const userId = 'user-id';
            const findUserByIdSpy = vi.spyOn(userService, 'findUserById');
            const updatePasswordByUserEmailSpy = vi.spyOn(userService, 'updatePasswordByUserEmail');
            const verifyUserPasswordSpy = vi.spyOn(authService, 'verifyUserPassword');
            const formData = new FormData();
            formData.set('currentPassword', 'password');
            formData.set('password', 'password-new');
            formData.set('passwordConfirm', 'password-new');
            vi.spyOn(userRepository, 'findUserById').mockResolvedValue({
                id: userId,
                name: 'test',
                password: hashedPassword,
                email: 'test@email.com',
                email_notified_at: null,
                email_verified_at: null,
            });
            vi.spyOn(userRepository, 'updatePasswordByUserEmail').mockResolvedValue([{
                numUpdatedRows: 1n,
            }]);

			// act & assert
			await expect(profileService.updatePassword(userId, formData)).rejects.toThrow(InvalidPasswordException);
            expect(findUserByIdSpy).toHaveBeenCalledWith(userId);
            expect(verifyUserPasswordSpy).toHaveBeenCalledWith(hashedPassword, 'password');
            expect(updatePasswordByUserEmailSpy).not.toHaveBeenCalled();
        });

		it('should throw error if current password does not match', async () => {
			// arrange
			const hashedPassword = '1e3a7c3cece7f5cc58e5dcf1fcc6a1b4:7b01211c3acd31b68507414cd14f5b0170005293934f708dbd01b26c6e1c425213b993abf94c7de4f2a22604240195e0a3ee26f1776aab4218b322d77a89f591';
            const userId = 'user-id';
            const findUserByIdSpy = vi.spyOn(userService, 'findUserById');
            const updatePasswordByUserEmailSpy = vi.spyOn(userService, 'updatePasswordByUserEmail');
            const verifyUserPasswordSpy = vi.spyOn(authService, 'verifyUserPassword');
            const formData = new FormData();
            formData.set('currentPassword', 'password');
            formData.set('password', 'password-new');
            formData.set('passwordConfirm', 'password-news');
            vi.spyOn(userRepository, 'findUserById').mockResolvedValue({
                id: userId,
                name: 'test',
                password: hashedPassword,
                email: 'test@email.com',
                email_notified_at: null,
                email_verified_at: null,
            });
            vi.spyOn(userRepository, 'updatePasswordByUserEmail').mockResolvedValue([{
                numUpdatedRows: 1n,
            }]);

			// act & assert
			await expect(profileService.updatePassword(userId, formData)).rejects.toThrow(ZodError);
            expect(findUserByIdSpy).not.toHaveBeenCalled();
            expect(verifyUserPasswordSpy).not.toHaveBeenCalled();
            expect(updatePasswordByUserEmailSpy).not.toHaveBeenCalled();
		});
	});
});
