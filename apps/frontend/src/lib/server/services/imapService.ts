import ImapFlow from 'imapflow';
import type { ListResponse } from 'imapflow';
import {
	IMAPAuthenticationFailedException,
	IMAPGenericException,
	IMAPTooManyRequestsException,
	IMAPUserAuthenticatedNotConnectedException
} from '../../../exceptions/imap';
import type { ImapEmail, ImapFolderStatus, MessageNumber } from '../../../types/imap';
import { logger } from '../../../utils/logger';
import type { Folder } from '../../../types/folder';

export async function buildClient(imapConfig: {
	username: string;
	password: string;
	host: string;
	port: number;
	secure: boolean;
}): Promise<ImapFlow.ImapFlow> {
	const client = new ImapFlow.ImapFlow({
		emitLogs: true,
		logger: false,
		host: imapConfig.host,
		port: imapConfig.port,
		secure: imapConfig.secure,
		disableAutoIdle: true,
		auth: {
			user: imapConfig.username,
			pass: imapConfig.password
		}
	});

	try {
		// Wait until client connects and authorizes
		await client.connect();
	} catch (error: any) {
		if (error.response && error.response.includes('Too many simultaneous connections')) {
			throw new IMAPTooManyRequestsException(error.response);
		} else if (
			error.response &&
			error.response.includes('User is authenticated but not connected')
		) {
			throw new IMAPUserAuthenticatedNotConnectedException(error.response);
		} else if (error.authenticationFailed) {
			throw new IMAPAuthenticationFailedException(error.response);
		} else if (error instanceof Error) {
			logger.error(error.message);
			throw new IMAPGenericException(error.message);
		}
		throw error;
	}

	client.on('error', (error) => {
		logger.error(`[buildClient] ${JSON.stringify(error)}`);
	});

	client.on('close', () => {
		logger.debug('[buildClient] Connection closed');
	});

	client.on('log', (entry) => {
		logger.debug(`[buildClient] ${JSON.stringify(entry)}`);
	});

	return client;
}

export async function getAllIMAPFolders(client: ImapFlow.ImapFlow): Promise<ListResponse[]> {
	const options = {
		statusQuery: {
			uidValidity: true,
			messages: true
		}
	};

	const folders = await client.list(options);
	return folders.filter((folder) => {
		return !folder.flags.has('\\NonExistent');
	});
}

export async function getFolderStatusByName(
	client: ImapFlow.ImapFlow,
	name: string
): Promise<ImapFolderStatus> {
	let status: ImapFolderStatus;
	const lock = await client.getMailboxLock(name, { readonly: true });
	try {
		logger.info(`[getFolderStatusByName] Fetching folder status`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore since type definitions have the parameters wrong
		status = await client.status(name, { messages: true, uidNext: true, uidValidity: true });
		logger.info(`[getFolderStatusByName] Fetched folder status`);
	} catch (e) {
		logger.error(`[getFolderStatusByName] ${JSON.stringify(e)}`);
		throw e;
	} finally {
		logger.info(`[getFolderStatusByName] Lock released`);
		lock.release();
	}

	return {
		path: status.path,
		messages: status.messages,
		uidNext: status.uidNext,
		uidValidity: status.uidValidity
	};
}

export async function getMessageNumbers(
	client: ImapFlow.ImapFlow,
	folderName: string,
	startSeq: number,
	endSeq: number
): Promise<MessageNumber[]> {
	const messageNumbers: MessageNumber[] = [];

	const lock = await client.getMailboxLock(folderName, { readonly: true });
	try {
		logger.info(`[getMessageNumbers] Fetching message numbers`);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore since type definitions have the parameters wrong
		const messages = client.fetch(`${startSeq}:${endSeq}`, { size: true }, { uid: true });
		for await (const message of messages) {
			messageNumbers.push({
				uid: message.uid,
				size: message.size
			});
		}
		logger.info(`[getMessageNumbers] Fetched message numbers`);
	} catch (error) {
		logger.error(`[getMessageNumbers] ${JSON.stringify(error)}`);
		if (error instanceof Error) {
			throw new IMAPGenericException(error.message);
		}
	} finally {
		logger.info(`[getMessageNumbers] Lock released`);
		lock.release();
	}

	return messageNumbers;
}

export async function getEmails(
	client: ImapFlow.ImapFlow,
	folder: Folder,
	startSeq: number,
	endSeq: number
): Promise<ImapEmail[]> {
	const imapEmails: ImapEmail[] = [];

	const lock = await client.getMailboxLock(folder.name);
	try {
		const messages = client.fetch(
			`${startSeq}:${endSeq}`,
			{ envelope: true, source: true, bodyStructure: true, internalDate: true, size: true },
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore since type definitions have the parameters wrong
			{ uid: true }
		);

		for await (const message of messages) {
			let hasAttachments = false;
			const sizeTotal = message.size;
			let attachmentSize = 0;
			if (message.bodyStructure.childNodes?.length) {
				message.bodyStructure.childNodes.forEach((node) => {
					if (node.disposition === 'attachment') {
						hasAttachments = true;
						attachmentSize += node.size;
					}
				});
			}
			const sizeWithoutAttachment = sizeTotal - attachmentSize;

			imapEmails.push({
				uid: message.uid,
				internalDate: message.internalDate,
				emailId: message.emailId,
				subject: message.envelope.subject,
				source: message.source.toString(),
				hasAttachments,
				size_total: sizeTotal, // includes attachments size
				size_without_attachments: sizeWithoutAttachment
			});
		}
	} finally {
		lock.release();
	}

	return imapEmails;
}
