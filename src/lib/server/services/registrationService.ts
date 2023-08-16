import type { AppConfig } from "../../../types/config";
import SignUrl from "../../../utils/signedUrl";
import config from 'config';
import { formSchema, registrationSchema } from "../schemas/registrationSchema";
import * as userInvitationService from '$lib/server/services/userInvitiationService';
import type { RegistrationVerificationUrl, VerifyEmailParams } from "../../../types/registration";

export async function RegisterForPreview(data: FormData): Promise<void> {
	// TODO Throw error if email is present in users table
	// TODO Add honeypot spam protection
	const validatedData = formSchema.parse({
		email: data.get('email')
	});
	await userInvitationService.insertUserInvitation(validatedData.email);
}

export async function VerifyRegistrationUrl(params: VerifyEmailParams): Promise<RegistrationVerificationUrl> {
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