import type { AppConfig, MailConfig } from "../../../types/config";
import SignUrl from "../../../utils/signedUrl";
import config from 'config';
import { formSchema, registrationSchema } from "../schemas/registrationSchema";
import * as userInvitationService from '$lib/server/services/userInvitiationService';
import type { RegistrationVerificationUrl, VerifyEmailParams } from "../../../types/registration";
import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import { mailTransporter } from "$lib/mailTransport";
import { logger } from "../../../utils/logger";

export async function registerForPreview(data: FormData): Promise<void> {
	// TODO Throw error if email is present in users table
	// TODO Add honeypot spam protection
	const validatedData = formSchema.parse({
		email: data.get('email')
	});
	await userInvitationService.insertUserInvitation(validatedData.email);
}

export async function verifyRegistrationUrl(params: VerifyEmailParams): Promise<RegistrationVerificationUrl> {
	const appConfig = config.get<AppConfig>('app');
	const validatedData = registrationSchema.parse(params);
	const signUrlObj = new SignUrl(
		appConfig.url,
		`verify-email/${validatedData.id}/${validatedData.hash}`,
		60
	);

	return {
		userId: validatedData.id,
		hasExpired: signUrlObj.hasExpired(Number(validatedData.expires)),
		signatureValid: signUrlObj.hasCorrectSignature(
			validatedData.signature,
			Number(validatedData.expires)
		)
	};
}

export async function sendUserInvitation(toEmail: string): Promise<void> {
    const appConfig = config.get<AppConfig>('app');
    const mailConfig = config.get<MailConfig>('mail');

    const htmlTemplate = await readFile('./src/lib/mailTransport/templates/userInvitation.html', 'utf8');
    const compiledTemplate = Handlebars.compile(htmlTemplate);
    const templateDate = {
        appName: appConfig.name,
        appUrl: appConfig.url,
        registerUrl: `${appConfig.url}/register`
    };

    const info = await mailTransporter.sendMail({
        from: `"${appConfig.name}" <${mailConfig.fromAddress}>`,
        to: toEmail,
        subject: 'Invitation To Register For Closed Preview of Archiveium',
        html: compiledTemplate(templateDate),
    });

    logger.info(`Sent email, message id: ${info.messageId}`);
}