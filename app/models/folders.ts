import { sql } from ".";
import type { Folder, FolderInsert } from "~/types/folder";
import type { Account, NewAccount, ValidatedAccount, ValidatedExistingAccount } from "~/types/account";

export async function insertFoldersAndAccount(
    userId: string,
    validatedAccount: ValidatedAccount,
    selectedRemoteFolders: FormDataEntryValue[]
): Promise<void> {
    await sql.begin(async sql => {
        const account = validatedAccount.account;
        const newAccount: NewAccount = {
            name: account.name,
            email: account.email,
            password: account.password,
            provider_id: account.provider_id,
            user_id: userId,
        };
        const [insertedAccount] = await sql<Account[]>`INSERT INTO accounts ${sql(newAccount)} RETURNING *`;

        let foldersToSave: FolderInsert[] = [];
        selectedRemoteFolders.forEach((selectedFolder) => {
            const remoteFolder = validatedAccount.remoteFolders.find(({ name }) => name === selectedFolder);
            if (remoteFolder) {
                foldersToSave.push({
                    ...remoteFolder,
                    user_id: userId,
                    account_id: insertedAccount.id,
                    syncing: true,
                });
            }
        });

        await sql`INSERT INTO folders 
        ${sql(foldersToSave, 'user_id', 'account_id', 'name', 'status_messages', 'status_uidvalidity', 'syncing')}`;
    });
}

export async function updateFoldersAndAccount(
    userId: string,
    validatedExistingAccount: ValidatedExistingAccount,
    selectedRemoteFolders: FormDataEntryValue[],
    existingFolders: Folder[],
): Promise<void> {
    await sql.begin(async sql => {
        // update account
        await sql`UPDATE accounts 
            SET name = ${validatedExistingAccount.account.name}, password = ${validatedExistingAccount.account.password}
            WHERE id = ${validatedExistingAccount.account.account_id}`;

        let folderIdsToUpdate: string[] = [];
        let foldersToSave: FolderInsert[] = [];
        selectedRemoteFolders.forEach((selectedFolder) => {
            const remoteFolder = validatedExistingAccount.remoteFolders.find(({ name }) => name === selectedFolder);
            if (remoteFolder) {
                const existingFolder = existingFolders.find((folder) => folder.name === remoteFolder.name);
                if (existingFolder) {
                    // existing folder that needs to be updated
                    folderIdsToUpdate.push(existingFolder.id);
                } else {
                    // new folder that needs to be added
                    foldersToSave.push({
                        ...remoteFolder,
                        user_id: userId,
                        account_id: validatedExistingAccount.account.account_id,
                        syncing: true,
                    });
                }
            }
        });

        // disable syncing for all existing folders
        await sql`UPDATE folders
            SET syncing = false
            WHERE user_id = ${userId} AND account_id = ${validatedExistingAccount.account.account_id}`;

        // enable syncing for all selected folders
        if (folderIdsToUpdate.length > 0) {
            await sql`UPDATE folders
            SET syncing = true
            WHERE user_id = ${userId} AND account_id = ${validatedExistingAccount.account.account_id} AND id IN ${sql(folderIdsToUpdate)}`;
        }

        // insert new folders not present in database
        if (foldersToSave.length > 0) {
            await sql`INSERT INTO folders 
            ${sql(foldersToSave, 'user_id', 'account_id', 'name', 'status_messages', 'status_uidvalidity', 'syncing')}`;
        }
    });
}

export async function getFoldersByUserIdAndAccountId(userId: string, accountId: string): Promise<Folder[]> {
    return sql<Folder[]>`SELECT * FROM folders 
        WHERE user_id = ${userId} AND account_id = ${accountId} AND deleted = false AND deleted_remote = false`;
}