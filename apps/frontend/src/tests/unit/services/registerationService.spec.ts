import { registerForPreview } from '$lib/server/services/registrationService';
import { NoResultError } from 'kysely';
import { expect, describe, it, vi, afterEach } from 'vitest';

vi.mock('$lib/server/repositories/userRepository', () => {
	return {
		findUserByEmail: (email: string) => {
			switch (email) {
				case 'registered@email.com':
					return {};
				case 'unregistered@email.com':
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore Don't want to build entire error object
					throw new NoResultError();
			}
		}
	};
});

vi.mock('$lib/server/repositories/userInvitationRepository', () => {
	return {
		insertUserInvitation: () => null
	};
});

describe('registrationService', () => {
	describe('registerForPreview', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it('should not allow already registered user to register again', async () => {
			// arrange
			const email = 'registered@email.com';
			const FormDataMock = vi.fn(() => ({
				append: vi.fn(),
				get: () => {
					return email;
				}
			}));
			vi.stubGlobal('FormData', FormDataMock);

			// act & assert
			await expect(() => registerForPreview(new FormData())).rejects.toThrow(
				`Email ${email} is already registered`
			);
		});

		it('should allow new user to register', async () => {
			// arrange
			const email = 'unregistered@email.com';
			const FormDataMock = vi.fn(() => ({
				append: vi.fn(),
				get: () => {
					return email;
				}
			}));
			vi.stubGlobal('FormData', FormDataMock);

			// act & assert
			await expect(registerForPreview(new FormData())).resolves.toBeUndefined();
		});
	});
});
