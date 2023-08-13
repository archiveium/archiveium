interface BaseFolder {
	name: string;
	status_uidvalidity: number;
	status_messages: number;
}

export interface RemoteFolder extends BaseFolder {
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
