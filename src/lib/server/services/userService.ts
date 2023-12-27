import * as userRepository from '$lib/server/repositories/userRepository';
import { NoResultError, type InsertResult } from 'kysely';
import type { CreateUser } from '../../../types/user';
import { hashPassword } from '../../../utils/auth';
import { RecordNotFoundException } from '../../../exceptions/database';
import type { AppConfig, MailConfig } from '../../../types/config';
import config from 'config';
import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import crypto from 'crypto';
import { mailTransporter } from '$lib/mailTransport';
import { logger } from '../../../utils/logger';
import SignUrl from '../../../utils/signedUrl';
import { buildHtmlTemplatePath } from '../../../utils/emailHelper';
import { UserDeletedException } from '../../../exceptions/auth';

export async function createUser(user: CreateUser): Promise<InsertResult> {
    return userRepository.createUser({
        name: user.name,
        email: user.email,
        password: hashPassword(user.password)
    });
}

export async function findUserById(id: string) {
	try {
        const user = await userRepository.findUserById(id);
        return user;
    } catch (error) {
        if (error instanceof NoResultError) {
            // TODO Handle case when user is logged in and account is deleted
            throw new RecordNotFoundException(`User ${id} not found in database`);
        }
        throw error;
    }
}

export async function findUserByEmail(email: string) {
    try {
        const user = await userRepository.findUserByEmail(email);
        if (user.deleted) {
            throw new UserDeletedException(`Account has been marked for deletion`);
        }
        return user;
    } catch (error) {
        if (error instanceof NoResultError) {
            throw new RecordNotFoundException(`User ${email} not found in database`);
        }
        throw error;
    }
}

export async function verifyUser(id: string) {
    return userRepository.verifyUser(id);
}

export async function setUserNotificationDate(id: string, date: string | undefined) {
    return userRepository.setUserNotificationDate(id, date);
}

export async function updatePasswordByUserEmail(email: string, rawPassword: string) {
	const hashedPassword = hashPassword(rawPassword);
    return userRepository.updatePasswordByUserEmail(email, hashedPassword);
}

export async function findUnverifiedUsers() {
    return userRepository.findUnverifiedUsers();
}

export async function sendUserVerificationEmail(email: string, id: string): Promise<void> {
    const appConfig = config.get<AppConfig>('app');
    const mailConfig = config.get<MailConfig>('mail');

    const htmlTemplate = await readFile(buildHtmlTemplatePath('userVerification.html'), 'utf8');
    const compiledTemplate = Handlebars.compile(htmlTemplate);

    const hashedEmail = crypto.createHash('sha1').update(email).digest('hex');
    const signedUrlObj = new SignUrl(appConfig.url, `verify-email/${id}/${hashedEmail}`, 60);
    const verifyUrl = signedUrlObj.getSigned();

    const templateDate = {
        appName: appConfig.name,
        appUrl: appConfig.url,
        verifyUrl,
    };

    const info = await mailTransporter.sendMail({
        from: `"${appConfig.name}" <${mailConfig.fromAddress}>`,
        to: email,
        subject: 'Verify Email Address',
        html: compiledTemplate(templateDate),
    });

    logger.info(`Sent email, message id: ${info.messageId}`);
}