import * as passwordResetRepository from '$lib/server/repositories/passwordResetRepository';
import { NoResultError } from 'kysely';
import { RecordDeleteFailedException, RecordNotFoundException } from '../../../exceptions/database';
import type { NewPasswordRequestRequest } from '../../../types/passwordReset';
import config from 'config';
import type { AppConfig, MailConfig } from '../../../types/config';
import { readFile } from 'fs/promises';
import { mailTransporter } from '$lib/mailTransport';
import { logger } from '../../../utils/logger';
import Handlebars from 'handlebars';

export async function findPasswordResetRequestByEmail(email: string) {
    try {
        const resetRequest = await passwordResetRepository.findPasswordResetRequestByEmail(email); 
        return resetRequest;       
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new RecordNotFoundException(`No password reset token exists for email: ${email}`);
        }
        throw error;
    }
}

export async function deletePasswordResetRequestById(id: string) {
    const deleteResult = await passwordResetRepository.deletePasswordResetRequestById(id);
    if (deleteResult.numDeletedRows < 1) {
        throw new RecordDeleteFailedException(`Failed to delete password request id: ${id}`);
    }
}

export async function createPasswordResetRequest(passwordResetRequest: NewPasswordRequestRequest) {
    return passwordResetRepository.createPasswordResetRequest(passwordResetRequest);
}

export async function deletePasswordResetRequestByEmail(email: string) {
    return passwordResetRepository.deletePasswordResetRequestByEmail(email);
}

export async function findPasswordResetRequestByTokenAndEmail(token: string, email: string) {
    try {
        const passwordRequest = await passwordResetRepository.findPasswordResetRequestByTokenAndEmail(token, email);        
        return passwordRequest;
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new RecordNotFoundException(`No password reset request found for token: ${token} and email: ${email}`);
        }
        throw error;
    }
}

export function findPendingPasswordResetRequests() {
    return passwordResetRepository.findPendingPasswordResetRequests();
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const appConfig = config.get<AppConfig>('app');
    const mailConfig = config.get<MailConfig>('mail');

    const htmlTemplate = await readFile('./src/lib/mailTransport/templates/passwordReset.html', 'utf8');
    const compiledTemplate = Handlebars.compile(htmlTemplate);

    const templateDate = {
        appName: appConfig.name,
        appUrl: appConfig.url,
        passwordResetUrl: `${appConfig.url}/reset-password?token=${token}&email=${email}`,
    };

    const info = await mailTransporter.sendMail({
        from: `"${appConfig.name}" <${mailConfig.fromAddress}>`,
        to: email,
        subject: 'Reset Password Notification',
        html: compiledTemplate(templateDate),
    });

    logger.info(`Sent email, message id: ${info.messageId}`);
}

export function updatePasswordResetRequestNotifiedDate(id: string) {
    return passwordResetRepository.updatePasswordResetRequestNotifiedDate(id);
}