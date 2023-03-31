export interface RemoteFolder {
    name: string;
    status_uidvalidity: number | undefined;
    status_messages: number | undefined;
}

export interface Folder {
    user_id: string;
    account_id: string;
    name: string;
    status_uidvalidity: number | undefined;
    status_messages: number | undefined;
}