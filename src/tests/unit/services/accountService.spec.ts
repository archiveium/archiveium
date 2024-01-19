import * as accountService from '$lib/server/services/accountService';
import * as accountRepository from '$lib/server/repositories/accountRepository';
import { expect, describe, it, vi, afterEach } from 'vitest';
import config from 'config';
import { DecryptException } from '../../../exceptions/encrypter';
import { NoResultError } from 'kysely';
import { AccountNotFoundException } from '../../../exceptions/account';

describe('accountService', () => {
	describe('findAccountByUserIdAndAccountId', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

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
				created_at: null,
				updated_at: null
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
				created_at: null,
				updated_at: null
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
				created_at: null,
				updated_at: null
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
});
