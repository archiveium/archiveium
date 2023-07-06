import type { GetObjectCommandInput } from '@aws-sdk/client-s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import type { AddressObject } from 'mailparser';
import { getAllEmailsByFolderAndUserId, getEmailByIdAndUserId } from '../models/emails';
import { s3Client } from '../actions/s3';
import type { Email } from '../types/email';
import { parseEmail } from '../utils/emailParser';

const BUCKET_NAME = 'emails';

export async function GetAllEmailsWithS3DataByFolderAndUserId(
	userId: string,
	folderId: string,
	currentPage: string
): Promise<Email[]> {
	const emails = await getAllEmailsByFolderAndUserId(userId, folderId, currentPage);
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

export async function GetEmailWithS3DataByIdAndUserId(
	userId: string,
	emailId: string
): Promise<Email & { html: string }> {
	const email = await getEmailByIdAndUserId(userId, emailId);
	const params: GetObjectCommandInput = {
		Bucket: BUCKET_NAME,
		Key: `${userId}/${email.folder_id}/${email.message_number}.eml`
	};
	const s3Data = await s3Client.send(new GetObjectCommand(params));
	const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
	const html = parsedEmail.html ? parsedEmail.html : '';
	return { ...email, html };
}

function getFromNameOrAddress(address?: AddressObject): string {
	const addressValues = address?.value;
	if (addressValues && addressValues[0].name != '') {
		return addressValues[0].name;
	} else if (addressValues && addressValues[0].address) {
		return addressValues[0].address;
	}
	return 'Not Available';
}