import { fail, type Actions } from '@sveltejs/kit';
import * as accountService from '$lib/server/services/accountService';
import * as folderService from '$lib/server/services/folderService';
import * as emailService from '$lib/server/services/emailService';
import * as s3Service from '$lib/server/services/s3Service';
import type { Email } from '../../types/email';
import { requireUserId } from '../../utils/auth';
import { GeneratePagination } from '../../utils/pagination';

const RESULTS_PER_PAGE = 12;

export const load = async ({ locals, url }) => {
	const userId = requireUserId(false, locals.user);

	// TODO Syncing and not syncing accounts - similar to folders
	return {
		streamed: {
			data: buildPageData(userId, url)
		}
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const userId = requireUserId(false, locals.user);
		const accountId = data.get('accountId')?.toString();
		const syncStatus = data.get('syncing');

		if (syncStatus && accountId) {
			const isAccountUpdated = await accountService.updateAccountSyncingStatus(
				userId,
				accountId,
				syncStatus === 'true'
			);
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

async function buildPageData(
	userId: string,
	url: URL
) {
	const folderId = url.searchParams.get('folderId');
	const accountId = url.searchParams.get('accountId');
	const page = url.searchParams.get('page') ?? '1';

	const allAccounts = await accountService.findAccountsByUserId(userId);
	if (allAccounts.length === 0) {
		return undefined;
	}

	const selectedAccount = allAccounts.find((account) => account.id == accountId);

	let folders;
	if (selectedAccount) {
		folders = await folderService.findFoldersWithDeletedFilterByAccountIdAndUserId(userId, selectedAccount.id, false);
		// do not remove folders not syncing
		// we need them to be discoverable since they might have emails
		// that user might want to see
		// let user filter these out if they want to
		// folders = folders.filter((folder) => folder.syncing);
	}

	const selectedFolder = folders?.find((folder) => folder.id == folderId);

	let emailsWithS3Data: Email[];
	let emailCount: number;
	if (selectedFolder) {	
		emailsWithS3Data = await s3Service.findEmailsByFolderIdAndUserId(
			userId,
			selectedFolder.id,
			page,
			RESULTS_PER_PAGE,
		);
		emailCount = await emailService.findEmailCountByFolderAndUserId(userId, selectedFolder.id);
	} else {
		if (selectedAccount) {
			emailsWithS3Data = await s3Service.findEmailsByAccountIdAndUserId(
				userId,
				selectedAccount.id,
				page,
				RESULTS_PER_PAGE,
			);
			emailCount = await emailService.findEmailCountByAccountIdAndUserId(userId, selectedAccount.id);
		} else {
			emailsWithS3Data = await s3Service.findEmailsByUserId(
				userId,
				page,
				RESULTS_PER_PAGE,
			);
			emailCount = await emailService.findEmailCountByUserId(userId);
		}
	}

	const paginator = GeneratePagination(emailCount, RESULTS_PER_PAGE, page, selectedFolder?.id, selectedAccount?.id);

	return {
		accounts: {
			all: allAccounts,
			selected: selectedAccount
		},
		folders: {
			all: folders,
			selected: selectedFolder
		},
		emails: emailsWithS3Data,
		paginator
	};
}
