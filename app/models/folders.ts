import { sql } from ".";
import type { Folder } from "~/types/folder";
import type { Account, NewAccount, ValidatedAccount } from "~/types/account";

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
        const [insertedAccount] = await sql<Account[]>`INSERT INTO accounts ${ sql(newAccount) } RETURNING *`;

        let foldersToSave: Folder[] = [];
        selectedRemoteFolders.forEach((selectedFolder) => {
            const remoteFolder = validatedAccount.remoteFolders.find(({ name }) => name === selectedFolder);
            if (remoteFolder) {
                foldersToSave.push({
                    ...remoteFolder,
                    user_id: userId,
                    account_id: insertedAccount.id,
                });
            }
        });

        await sql`INSERT INTO folders 
        ${ sql(foldersToSave, 'user_id', 'account_id', 'name', 'status_messages', 'status_uidvalidity') }`;
      });
}