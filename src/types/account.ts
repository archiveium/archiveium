import type { RemoteFolder } from './folder';

export interface Account {
	id: string;
	name: string;
	email: string;
	password: string;
	syncing: boolean;
	deleted: boolean;
	searchable: boolean;
	provider_id: string;
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

export interface ExistingAccount extends NewAccount {
	account_id: string;
}

export interface ValidatedAccount {
	account: NewAccount;
	remoteFolders: RemoteFolder[];
}

export interface ValidatedExistingAccount {
	account: ExistingAccount;
	remoteFolders: RemoteFolder[];
}
