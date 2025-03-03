import type { ListResponse } from 'imapflow';
import _ from 'lodash';
import * as folderService from '$lib/server/services/folderService';
import type { FolderSelect } from '$lib/server/database/wrappers';

export class DefaultProvider {
	public async getAllLocalFolders(userId: string, accountId: string) {
		return folderService.findFoldersWithDeletedFilterByAccountIdAndUserId(userId, accountId, false);
	}

	public hasFolderNameChanged(savedFolderName: string, remoteFolderName: string): boolean {
		return savedFolderName.toLowerCase() !== remoteFolderName.toLowerCase();
	}

	public getMappedLocalFolder(
		localFolders: FolderSelect[],
		remoteFolder: ListResponse
	): FolderSelect | undefined {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore since type definations have the parameters wrong
		if (remoteFolder.status) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore since type definations have the parameters wrong
			return _.find(localFolders, function (o) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore since type definations have the parameters wrong
				return o.status_uidvalidity === Number(remoteFolder.status.uidValidity);
			});
		}
	}
}
