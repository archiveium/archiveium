import * as emailService from '$lib/server/services/emailService';
import * as emailRepository from '$lib/server/repositories/emailRepository';
import { expect, describe, it, vi, afterEach } from 'vitest';
import { MultipleEmailWithSameEmailIdException } from '../../../exceptions/email';

describe('emailsService', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('findEmailByEmailId', () => {
		it('should return email if no existing email - folder association exists', async () => {
			// arrange
			const emailId = '12345667890';
			const folderId = '1234';
			const findEmailByEmailIdSpy = vi.spyOn(emailRepository, 'findEmailByEmailId');
			const email = {
				id: '1',
				email_id: emailId,
				folder_id: '5678',
				has_source: true,
				imported: true,
				user_id: '1'
			};
			findEmailByEmailIdSpy.mockResolvedValueOnce([email]);

			// act
			const result = await emailService.findEmailByEmailId(emailId, folderId);

			// assert
			expect(result).toBe(email);
			expect(findEmailByEmailIdSpy).toBeCalledWith(emailId);
		});

		it('should return null if no existing email is found', async () => {
			// arrange
			const emailId = '12345667890';
			const folderId = '1234';
			const findEmailByEmailIdSpy = vi.spyOn(emailRepository, 'findEmailByEmailId');
			findEmailByEmailIdSpy.mockResolvedValueOnce([]);

			// act
			const result = await emailService.findEmailByEmailId(emailId, folderId);

			// assert
			expect(result).toBe(null);
			expect(findEmailByEmailIdSpy).toBeCalledWith(emailId);
		});

		it('should throw MultipleEmailWithSameEmailIdException exception if existing email folder association is found', async () => {
			// arrange
			const emailId = '12345667890';
			const folderId = '1234';
			const email = {
				id: '1',
				email_id: emailId,
				folder_id: folderId,
				has_source: true,
				imported: true,
				user_id: '1'
			};
			const findEmailByEmailIdSpy = vi.spyOn(emailRepository, 'findEmailByEmailId');
			findEmailByEmailIdSpy.mockResolvedValueOnce([email]);

			// act & assert
			await expect(emailService.findEmailByEmailId(emailId, folderId)).rejects.toThrow(
				MultipleEmailWithSameEmailIdException
			);
			expect(findEmailByEmailIdSpy).toBeCalledWith(emailId);
		});
	});
});
