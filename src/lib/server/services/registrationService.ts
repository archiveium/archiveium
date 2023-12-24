import type { AppConfig, MailConfig } from "../../../types/config";
import SignUrl from "../../../utils/signedUrl";
import config from 'config';
import { formSchema, registrationSchema } from "../schemas/registrationSchema";
import * as userInvitationService from '$lib/server/services/userInvitiationService';
import * as userService from '$lib/server/services/userService';
import type { RegistrationVerificationUrl, VerifyEmailParams } from "../../../types/registration";
import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import { mailTransporter } from "$lib/mailTransport";
import { logger } from "../../../utils/logger";
import { buildHtmlTemplatePath } from "../../../utils/emailHelper";
import { RecordNotFoundException } from "../../../exceptions/database";
import { UserAlreadyRegisteredException } from "../../../exceptions/auth";

export async function registerForPreview(data: FormData): Promise<void> {
	// TODO Add honeypot spam protection
	const validatedData = formSchema.parse({
		email: data.get('email')
	});

	// make sure user isn't already registered
	try {
		await userService.findUserByEmail(validatedData.email);
	} catch (error) {
		if (error instanceof RecordNotFoundException) {
			await userInvitationService.insertUserInvitation(validatedData.email);
			return;
		}
	}
	throw new UserAlreadyRegisteredException(`Email ${validatedData.email} is already registered`);
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


    const htmlTemplate = await readFile(buildHtmlTemplatePath('userInvitation.html'), 'utf8');
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