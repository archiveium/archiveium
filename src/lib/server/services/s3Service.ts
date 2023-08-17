import type { GetObjectCommandInput } from '@aws-sdk/client-s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import type { AddressObject } from 'mailparser';
import type { Email } from '../../../types/email';
import { BUCKET_NAME } from '../constants/s3';
import { parseEmail } from '../../../utils/emailParser';
import * as emailService from '$lib/server/services/emailService';
import { s3Client } from '../s3/connection';

export async function findEmailsByFolderIdAndUserId(
	userId: string,
	folderId: string,
	currentPage: string,
	resultsPerPage: number,
): Promise<Email[]> {
	const emails = await emailService.findEmailByFolderIdAndUserId(userId, folderId, currentPage, resultsPerPage);
	const promises = emails.map(async (email) => {
		const params: GetObjectCommandInput = {
			Bucket: BUCKET_NAME,
			Key: `${userId}/${folderId}/${email.message_number}.eml`
		};
		const s3Data = await s3Client.send(new GetObjectCommand(params));
		const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
		email.s3Data = {
			subject: parsedEmail.subject ?? 'Not Available',
			from: getFromNameOrAddress(parsedEmail.from)
		};
		return email;
	});

	return await Promise.all(promises);
}

export async function findEmailByIdAndUserId(
	userId: string,
	emailId: string
): Promise<Email & { html: string }> {
	const email = await emailService.findEmailByIdAndUserId(userId, emailId);
	const params: GetObjectCommandInput = {
		Bucket: BUCKET_NAME,
		Key: `${userId}/${email.folder_id}/${email.message_number}.eml`
	};
	const s3Data = await s3Client.send(new GetObjectCommand(params));
	const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
	const html = parsedEmail.html ? parsedEmail.html : '';
	return { ...email, html };
}

// Private functions

function getFromNameOrAddress(address?: AddressObject): string {
	const addressValues = address?.value;
	if (addressValues && addressValues[0].name != '') {
		return addressValues[0].name;
	} else if (addressValues && addressValues[0].address) {
		return addressValues[0].address;
	}
	return 'Not Available';
}