interface BaseFolder {
    name: string;
    status_uidvalidity: number | undefined;
    status_messages: number | undefined;
}

export interface RemoteFolder extends BaseFolder {
    // Placeholder for future updates
}

export interface FolderInsert extends BaseFolder {
    user_id: string;
    account_id: string;
}

export interface Folder extends FolderInsert {
    id: string;
    href?: string;
}