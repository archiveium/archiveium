// TODO Pull this and the same implemention in jobber to a separate library
// for reduced duplication
import ImapFlow from 'imapflow';
import type { ListResponse } from 'imapflow';
import {
    IMAPAuthenticationFailed,
    IMAPGenericException,
    IMAPTooManyRequests,
    IMAPUserAuthenticatedNotConnected,
} from '../exceptions/imap';

export async function buildClient(username: string, password: string, host: string): Promise<ImapFlow.ImapFlow> {
    const client = new ImapFlow.ImapFlow({
        emitLogs: true,
        logger: false,
        host,
        port: 993,
        secure: true,
        auth: {
            user: username,
            pass: password
        }
    });

    try {
        // Wait until client connects and authorizes
        await client.connect();
    } catch (error: any) {
        if (error.response && error.response.includes('Too many simultaneous connections')) {
            throw new IMAPTooManyRequests(error.response);
        } else if (error.response && error.response.includes('User is authenticated but not connected')) {
            throw new IMAPUserAuthenticatedNotConnected(error.response);
        } else if (error.authenticationFailed) {
            throw new IMAPAuthenticationFailed(error.response);
        } else if (error instanceof Error) {
            throw new IMAPGenericException(error.message);
        }
        throw error;
    }

    client.on('error', (error) => {
        console.error(JSON.stringify(error));
    });

    return client;
}

export async function getAllIMAPFolders(client: ImapFlow.ImapFlow): Promise<ListResponse[]> {
    const options = {
        statusQuery: {
            uidValidity: true,
            messages: true,
        }
    };

    const folders = await client.list(options);
    return folders.filter((folder) => {
        return !folder.flags.has('\\NonExistent');
    });
}