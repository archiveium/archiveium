import * as accountService from '$lib/server/services/accountService';
import * as accountRepository from '$lib/server/repositories/accountRepository';
import { expect, describe, it, vi, afterEach } from 'vitest';
import config from 'config';
import { DecryptException } from '../../../exceptions/encrypter';
import { NoResultError } from 'kysely';
import {
	AccountDeletedException,
	AccountExistsException,
	AccountNotFoundException
} from '../../../exceptions/account';

describe('accountService', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('findAccountByUserIdAndAccountId', () => {
		it('should return account with decrypted password', async () => {
			// arrange
			vi.spyOn(config, 'get').mockReturnValueOnce('encryptionKey');
			const findAccountByUserIdAndAccountIdSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndAccountId'
			);
			findAccountByUserIdAndAccountIdSpy.mockResolvedValueOnce({
				email: 'test@email.com',
				id: '1234',
				name: 'test',
				password:
					'8ef92b4761339b98d692a2dd590f798199618bdcb5affee480c5156158f96ad6|35efeb854bc73c7f1e0802229175b2c8',
				provider_id: '1',
				user_id: '1',
				syncing: true,
				deleted: false,
				searchable: true,
				created_at: new Date(),
				updated_at: new Date()
			});

			// act
			const account = await accountService.findAccountByUserIdAndAccountId('1', '2');

			// assert
			expect(account.password).toBe('encrypted-password');
			expect(findAccountByUserIdAndAccountIdSpy).toHaveBeenCalledWith('1', '2');
		});

		it('should throw an exception if decryption fails because of missing IV', async () => {
			// arrange
			vi.spyOn(config, 'get').mockReturnValueOnce('incorrectKey');
			const findAccountByUserIdAndAccountIdSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndAccountId'
			);
			findAccountByUserIdAndAccountIdSpy.mockResolvedValueOnce({
				email: 'test@email.com',
				id: '1234',
				name: 'test',
				password: '8ef92b4761339b98d692a2dd590f798199618bdcb5affee480c5156158f96ad6',
				provider_id: '1',
				user_id: '1',
				syncing: true,
				deleted: false,
				searchable: true,
				created_at: new Date(),
				updated_at: new Date()
			});

			// act & assert
			await expect(accountService.findAccountByUserIdAndAccountId('1', '2')).rejects.toThrow(
				DecryptException
			);
		});

		it('should throw exception if decryption fails because of invalid key', async () => {
			// arrange
			vi.spyOn(config, 'get').mockReturnValueOnce('incorrectKey');
			const findAccountByUserIdAndAccountIdSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndAccountId'
			);
			findAccountByUserIdAndAccountIdSpy.mockResolvedValueOnce({
				email: 'test@email.com',
				id: '1234',
				name: 'test',
				password:
					'8ef92b4761339b98d692a2dd590f798199618bdcb5affee480c5156158f96ad6|35efeb854bc73c7f1e0802229175b2c8',
				provider_id: '1',
				user_id: '1',
				syncing: true,
				deleted: false,
				searchable: true,
				created_at: new Date(),
				updated_at: new Date()
			});

			// act & assert
			await expect(accountService.findAccountByUserIdAndAccountId('1', '2')).rejects.toThrow(
				DecryptException
			);
		});

		it('should throw exception if no results are found', async () => {
			// arrange
			const findAccountByUserIdAndAccountIdSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndAccountId'
			);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore Don't want to build entire error object);
			findAccountByUserIdAndAccountIdSpy.mockRejectedValueOnce(new NoResultError());

			// act & assert
			await expect(accountService.findAccountByUserIdAndAccountId('1', '2')).rejects.toThrow(
				AccountNotFoundException
			);
		});
	});

	describe('isAccountUnique', () => {
		it('should not throw exception if no account exists', async () => {
			// arrange
			const userEmail = 'test@email.com';
			const userId = '1234';
			const findAccountByUserIdAndEmailSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndEmail'
			);
			findAccountByUserIdAndEmailSpy.mockResolvedValueOnce(undefined);

			// act
			const result = await accountService.isAccountUnique(userEmail, userId);

			// assert
			expect(result).toBeUndefined();
			expect(findAccountByUserIdAndEmailSpy).toBeCalledWith(userEmail, userId);
		});

		it('should throw AccountDeletedException exception if account is flagged for deletion', async () => {
			// arrange
			const userEmail = 'test@email.com';
			const userId = '1234';
			const findAccountByUserIdAndEmailSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndEmail'
			);
			findAccountByUserIdAndEmailSpy.mockResolvedValueOnce({ id: userId, deleted: true });

			// act & assert
			await expect(accountService.isAccountUnique(userEmail, userId)).rejects.toThrow(
				AccountDeletedException
			);
		});

		it('should throw AccountExistsException exception if account is not flagged for deletion', async () => {
			// arrange
			const userEmail = 'test@email.com';
			const userId = '1234';
			const findAccountByUserIdAndEmailSpy = vi.spyOn(
				accountRepository,
				'findAccountByUserIdAndEmail'
			);
			findAccountByUserIdAndEmailSpy.mockResolvedValueOnce({ id: userId, deleted: false });

			// act & assert
			await expect(accountService.isAccountUnique(userEmail, userId)).rejects.toThrow(
				AccountExistsException
			);
		});
	});
});
