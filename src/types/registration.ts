export interface VerifyEmailParams {
	id?: string;
	hash?: string;
	expires?: string;
	signature?: string;
}

export interface RegistrationVerificationUrl {
	userId: string;
	hasExpired: boolean;
	signatureValid: boolean;
}