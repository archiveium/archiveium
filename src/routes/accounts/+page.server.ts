import { fail, type Actions } from '@sveltejs/kit';
import { GetAllAccountsByUserId, GetAllFoldersByUserIdAndAccountId, UpdateAccountSyncingStatus } from '../../actions/account';
import { GetAllEmailsWithS3DataByFolderAndUserId } from '../../actions/email';
import { getAllEmailsCountByFolderAndUserId } from '../../models/emails';
import type { Account } from '../../types/account';
import type { Email } from '../../types/email';
import type { Folder } from '../../types/folder';
import { requireUserId } from '../../utils/auth';
import { GeneratePagination, type Paginator } from '../../utils/pagination';

export const load = async ({ locals, url }) => {
    const userId = requireUserId(false, locals.user);

    // TODO Syncing and not syncing accounts - similar to folders
    return {
        streamed: {
            data: buildPageData(userId, url),
        }
    };
}

export const actions = {
    default: async ({ request, locals, url }) => {
        const data = await request.formData();
        const userId = requireUserId(false, locals.user);
        const accountId = url.searchParams.get('accountId') ?? data.get('accountId')?.toString();
        const syncStatus = data.get('syncing');

        if (syncStatus && accountId) {
            const isAccountUpdated = await UpdateAccountSyncingStatus(userId, accountId, syncStatus === 'true');
            if (isAccountUpdated) {
                return {
                    success: 'Account syncing status updated successfully.'
                };
            }
        }

        return fail(400, {
            error: 'There was an error updating account syncing status.'
        });        
    }
} satisfies Actions;

async function buildPageData(userId: string, url: URL): Promise<{
    accounts: {
        all: Account[],
        selected: Account
    },
    folders: {
        syncing: Folder[],
        notSyncing: Folder[],
        selected: Folder
    },
    emails: Email[],
    paginator: Paginator
}> {
    const folderId = url.searchParams.get('folderId');
    const accountId = url.searchParams.get('accountId');
    const page = url.searchParams.get('page') ?? '1';

    const allAccounts = await GetAllAccountsByUserId(userId);
    const selectedAccount = allAccounts.find((account) => account.id == accountId) ?? allAccounts[0];

    const folders = await GetAllFoldersByUserIdAndAccountId(userId, selectedAccount.id);
    const syncingFolders = folders.filter((folder) => folder.syncing);
    const notSyncingFolders = folders.filter((folder) => !folder.syncing);
    const selectedFolder = folders.find((folder) => folder.id == folderId) ?? folders[0];

    const emailsWithS3Data = await GetAllEmailsWithS3DataByFolderAndUserId(userId, selectedFolder.id, page);
    const emailCount = await getAllEmailsCountByFolderAndUserId(userId, selectedFolder.id);
    const paginator = GeneratePagination(emailCount, 5, page, selectedFolder.id, selectedAccount.id);    

    return {
        accounts: {
            all: allAccounts,
            selected: selectedAccount
        },
        folders: {
            syncing: syncingFolders,
            notSyncing: notSyncingFolders,
            selected: selectedFolder
        },
        emails: emailsWithS3Data,
        paginator
    };
}