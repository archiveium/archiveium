import type { MessageNumber } from './imap';

export type ImportEmailJobPayload = {
	userId: string;
	accountId: string;
	folderId: string;
	messageNumbers: MessageNumber[];
};
