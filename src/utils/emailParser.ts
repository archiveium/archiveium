import type { ParsedMail } from 'mailparser';
import { simpleParser } from 'mailparser';
import { EmailSourceUndefinedException } from '../exceptions/emailParser';

const MAX_SUBJECT_LENGTH = 60;

export async function parseEmail(source?: string): Promise<ParsedMail> {
	if (source) {
		const parsedEmail = await simpleParser(source);
		return parsedEmail;
	}

	throw new EmailSourceUndefinedException('Source is undefined');
}

export function parseEmailSubject(source?: string): string {
	let subject = 'Not Available';
	if (source) {
		subject = source.length > MAX_SUBJECT_LENGTH ? `${source.slice(0, MAX_SUBJECT_LENGTH - 3)}...` : source;
	}
	return subject;
}