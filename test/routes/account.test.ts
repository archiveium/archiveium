import { FormData, Headers, Request } from '@remix-run/node';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as accountEdit from '~/routes/accounts/edit/$id';
import * as accountController from '~/controllers/account.server';
import { commitAppSession, getSession } from '~/utils/session';

vi.mock('~/controllers/account.server.tsx', () => {
  const UpdateAccountSyncingStatus = vi.fn();
  const DeleteAccountByAccountIdAndUserId = vi.fn();
  UpdateAccountSyncingStatus.mockResolvedValue(true);
  DeleteAccountByAccountIdAndUserId.mockResolvedValue(null);
  return {
    UpdateAccountSyncingStatus,
    DeleteAccountByAccountIdAndUserId
  }
});

describe('account route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enable account syncing status', async () => {
    // arrange
    const UpdateAccountSyncingStatusSpy = vi.spyOn(accountController, 'UpdateAccountSyncingStatus');
    const formData = new FormData();
    formData.append('formName', accountEdit.formNames.UPDATE_ACCOUNT_SYNC);
    formData.append('syncing', 'true');

    const session = await getSession();
    session.set('userId', '1');

    const headers = new Headers();
    headers.append('cookie', await commitAppSession(session));

    const request = new Request('http://localhost/account/edit/1', {
      method: "POST",
      body: formData,
      headers
    });

    // act
    const response = await accountEdit.action({ request, params: {}, context: {} });
    const updatedSession = await getSession(request.headers.get('Cookie'));
    const flashMessage = await updatedSession.get('globalMessage');

    // assert
    expect(response.status).toEqual(302);
    expect(response.headers.get('location')).toEqual('/dashboard');
    expect(flashMessage).toEqual('Account syncing status updated successfully.');
    expect(UpdateAccountSyncingStatusSpy).toBeCalledTimes(1);
    expect(UpdateAccountSyncingStatusSpy).toBeCalledWith('1', '', true);
  });

  it('should disable account syncing status', async () => {
    // arrange
    const UpdateAccountSyncingStatusSpy = vi.spyOn(accountController, 'UpdateAccountSyncingStatus');
    const formData = new FormData();
    formData.append('formName', accountEdit.formNames.UPDATE_ACCOUNT_SYNC);
    formData.append('syncing', 'false');

    const session = await getSession();
    session.set('userId', '1');

    const headers = new Headers();
    headers.append('cookie', await commitAppSession(session));

    const request = new Request('http://localhost/account/edit/1', {
      method: "POST",
      body: formData,
      headers
    });

    // act
    const response = await accountEdit.action({ request, params: {}, context: {} });
    const updatedSession = await getSession(request.headers.get('Cookie'));
    const flashMessage = await updatedSession.get('globalMessage');

    // assert
    expect(response.status).toEqual(302);
    expect(response.headers.get('location')).toEqual('/dashboard');
    expect(flashMessage).toEqual('Account syncing status updated successfully.');
    expect(UpdateAccountSyncingStatusSpy).toBeCalledTimes(1);
    expect(UpdateAccountSyncingStatusSpy).toBeCalledWith('1', '', false);
  });
});
