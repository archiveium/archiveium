import type { RemoteFolder } from "./folder";

export interface Account {
    id: string;
    name: string;
    username: string;
    syncing: boolean;
    deleted: boolean;
    searchable: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface NewAccount {
    name: string;
    email: string;
    password: string;
    user_id: string;
    provider_id: string;
}

export interface ValidatedAccount {
    account: NewAccount,
    remoteFolders: RemoteFolder[];
}