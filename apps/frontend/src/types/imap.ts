export type ImapFolderStatus = {
	path: string;
	messages: number;
	uidNext: number;
	uidValidity: number;
};

export type MessageNumber = {
	uid: number;
	size: number;
};

export type ImapEmail = {
	uid: number;
	internalDate: Date;
	emailId: string;
	subject: string;
	source: string;
	hasAttachments: boolean;
	size_total: number;
	size_without_attachments: number;
};
