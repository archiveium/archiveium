import { z } from 'zod';
import { AccountExistsException } from '~/exceptions/account';
import { CacheKeyNotFoundException } from '~/exceptions/cache';
import { getAllIMAPFolders } from '~/imap';
import { buildClient } from '~/imap/builder';
import { redis } from '~/models';
import { isAccountUnique } from '~/models/accounts';
import { insertFoldersAndAccount } from '~/models/folders';
import { getProviderById } from '~/models/providers';
import type { ValidatedAccount } from '~/types/account';
import type { FormData } from '~/types/form';

const addAccountSchema = z.object({
    name: z.string().trim().min(4, 'Must be of at-least 4 characters'),
    email: z.string().trim().email('Must be a valid email address'),
    password: z.string().trim().min(8, 'Must be of at-least 8 characters'),
    provider_id: z.string().trim().min(1),
});

export async function ValidateAccount(formData: FormData, userId: string): Promise<ValidatedAccount> {
    const validatedData = addAccountSchema.parse(formData);
    const accountUnique = await isAccountUnique(validatedData.email, userId);
    if (!accountUnique) {
        throw new AccountExistsException(`${validatedData.email} has already been added.`);
    }

    const provider = await getProviderById(validatedData.provider_id);
    const imapClient = await buildClient(validatedData.email, validatedData.password, provider.host);
    const remoteFolders = await getAllIMAPFolders(imapClient);

    const validatedProvider = {
        account: { ...validatedData, user_id: userId },
        remoteFolders: remoteFolders.map((remoteFolder) => {
            return {
                name: remoteFolder.path,
                status_uidvalidity: Number(remoteFolder.status?.uidValidity),
                status_messages: remoteFolder.status?.messages,
            };
        })
    };

    await cacheValidatedAccount(userId, validatedProvider);

    return validatedProvider;
}

async function cacheValidatedAccount(userId: string, validatedAccount: ValidatedAccount): Promise<boolean> {
    const result = await redis.set(
        `${userId}:${validatedAccount.account.email}`,
        JSON.stringify(validatedAccount),
        'EX',
        10 * 60
    );
    return result === 'OK';
}

async function getCachedValidatedAccount(userId: string, email: string): Promise<ValidatedAccount> {
    const result = await redis.get(`${userId}:${email}`);
    if (result) {
        return JSON.parse(result);
    }
    throw new CacheKeyNotFoundException('Key does not exist');
}

export async function SaveAccount(
    userId: string, 
    formDataEmail: FormDataEntryValue | null, 
    formDataSelectedRemoteFolders: FormDataEntryValue[] | null
): Promise<void> {
    const email = formDataEmail?.toString() ?? '';
    const cachedProvider = await getCachedValidatedAccount(userId, email);
    const selectedRemoteFolders = formDataSelectedRemoteFolders ?? [];

    await insertFoldersAndAccount(userId, cachedProvider, selectedRemoteFolders);
    //TODO Delete cachedProvider
}