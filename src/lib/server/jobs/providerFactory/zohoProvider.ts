import { DefaultProvider } from "./defaultProvider";
import type { ListResponse } from "imapflow";
import * as folderService from '$lib/server/services/folderService';
import type { FolderSelect } from "$lib/server/database/wrappers";
import { find } from "lodash";

export class ZohoProvider extends DefaultProvider {
    public async getAllLocalFolders(userId: string, accountId: string) {
        return folderService.findFoldersWithoutDeletedFilterByAccountIdAndUserId(userId, accountId);
    }

    public getMappedLocalFolder(localFolders: FolderSelect[], remoteFolder: ListResponse): FolderSelect | undefined {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore since type definations have the parameters wrong
        if (remoteFolder.status) {
            return find(localFolders, function(o) {
                return o.name === remoteFolder.path;
            });
        }
    }
}