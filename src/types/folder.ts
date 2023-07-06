interface BaseFolder {
	name: string;
	status_uidvalidity: number | undefined;
	status_messages: number | undefined;
}

export interface RemoteFolder extends BaseFolder {
	syncing?: boolean;
}

export interface FolderInsert extends BaseFolder {
	user_id: string;
	account_id: string;
	syncing: boolean;
}

export interface Folder extends FolderInsert {
	id: string;
	href?: string;
}
