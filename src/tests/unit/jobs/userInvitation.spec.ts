import { userInvitation } from '$lib/server/jobs/handlers/userInvitation';
import * as registrationService from '$lib/server/services/registrationService';
import * as userInvitationService from '$lib/server/services/userInvitiationService';
import { expect, describe, it, vi, afterEach } from 'vitest';

const mocks = vi.hoisted(() => {
	return {
		findAllInvitedUsers: vi.fn()
	};
});

vi.mock('$lib/server/repositories/userInvitationRepository', () => {
	return {
		findAllInvitedUsers: mocks.findAllInvitedUsers,
		updateInvitedUser: () => null
	};
});

vi.mock('$lib/server/services/registrationService', () => {
	return {
		sendUserInvitation: () => null
	};
});

describe('userInvitation', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should not send invitation email for user already registered', async () => {
		// arrange
		mocks.findAllInvitedUsers.mockResolvedValue([]);
		const registrationServiceSpy = vi.spyOn(registrationService, 'sendUserInvitation');
		const userInvitationServiceSpy = vi.spyOn(userInvitationService, 'updateInvitedUser');

		// act
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await userInvitation({ name: 'some-job' });

		// assert
		expect(registrationServiceSpy).not.toHaveBeenCalled();
		expect(userInvitationServiceSpy).not.toHaveBeenCalled();
	});

	it('should send invitation email for invited user', async () => {
		// arrange
		const invitedUser = { id: '1', username: 'registered@email.com' };
		mocks.findAllInvitedUsers.mockResolvedValue([invitedUser]);
		const registrationServiceSpy = vi.spyOn(registrationService, 'sendUserInvitation');
		const userInvitationServiceSpy = vi.spyOn(userInvitationService, 'updateInvitedUser');

		// act
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await userInvitation({ name: 'some-job' });

		// assert
		expect(registrationServiceSpy).toHaveBeenCalledWith(invitedUser.username);
		expect(userInvitationServiceSpy).toHaveBeenCalledWith(invitedUser.id);
	});
});
