interface BaseFolder {
	name: string;
	status_uidvalidity: number;
}

export interface RemoteFolder extends BaseFolder {
	status_messages: number;
	syncing?: boolean;
}

export interface FolderInsert extends BaseFolder {
	user_id: string;
	account_id: string;
	syncing: boolean | null;
}

export interface Folder extends FolderInsert {
	id: string;
	href?: string;
}
