import { z } from 'zod';
import { insertUserInvitation } from '../models/userInvitations';
import SignUrl from '../utils/signedUrl';
import config from 'config';
import type { AppConfig } from '../types/config';

const formSchema = z.object({
    email: z.string().email('The email must be a valid email address'),
});
const registrationSchema = z.object({
    id: z.string().min(1),
    hash: z.string().min(1),
    expires: z.string().min(1),
    signature: z.string().min(1),
});

interface VerifyEmailParams {
    id?: string;
    hash?: string;
    expires?: string;
    signature?: string;
};

interface RegistrationVerificationUrl {
    userId: string;
    hasExpired: boolean;
    signatureValid: boolean;
};

export async function RegisterForPreview(data: FormData): Promise<void> {
    // TODO Throw error if email is present in users table
    // TODO Add honeypot spam protection 
    const validatedData = formSchema.parse({
        email: data.get('email')
    });
    await insertUserInvitation(validatedData.email);
}

export async function VerifyRegistrationUrl(params: VerifyEmailParams): Promise<RegistrationVerificationUrl> {
    const appConfig = config.get<AppConfig>('app');
    const validatedData = registrationSchema.parse(params);
    const signUrlObj = new SignUrl(
        appConfig.url,
        `verify-email/${validatedData.id}/${validatedData.hash}`,
        60,
    );

    return {
        userId: validatedData.id,
        hasExpired: signUrlObj.hasExpired(Number(validatedData.expires)),
        signatureValid: signUrlObj.hasCorrectSignature(validatedData.signature, Number(validatedData.expires)),
    };
}