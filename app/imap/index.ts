import type { ListResponse } from 'imapflow';
import type ImapFlow from 'imapflow';

export async function getAllIMAPFolders(client: ImapFlow.ImapFlow): Promise<ListResponse[]> {
    const options = {
        statusQuery: {
            uidValidity: true,
            messages: true,
        }
    };

    const folders = await client.list(options);
    return folders.filter((folder) => {
        return !folder.flags.has('\\NonExistent');
    });
}