import type { DeleteObjectCommandInput, GetObjectCommandInput, ListObjectsV2CommandInput, PutObjectCommandInput, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import type { AddressObject } from 'mailparser';
import { BUCKET_NAME } from '../constants/s3';
import { parseEmail, parseEmailSubject } from '../../../utils/emailHelper';
import * as emailService from '$lib/server/services/emailService';
import { s3Client } from '../s3/connection';
import { logger } from '../../../utils/logger';

const BUCKET = 'emails';

export async function findEmailsByFolderIdAndUserId(
	userId: string,
	folderId: string,
	currentPage: string,
	resultsPerPage: number,
) {
	const emails = await emailService.findEmailByFolderIdAndUserId(userId, folderId, currentPage, resultsPerPage);
	const promises = emails.map(async (email) => {
		const params: GetObjectCommandInput = {
			Bucket: BUCKET_NAME,
			Key: `${userId}/${folderId}/${email.id}.eml`
		};
		const s3Data = await s3Client.send(new GetObjectCommand(params));
		const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
		email.s3Data = {
			subject: parseEmailSubject(parsedEmail.subject),
			from: getFromNameOrAddress(parsedEmail.from)
		};
		return email;
	});

	return await Promise.all(promises);
}

export async function findEmailsByAccountIdAndUserId(
	userId: string,
	accountId: string,
	currentPage: string,
	resultsPerPage: number,
) {
	const emails = await emailService.findEmailByAccountIdAndUserId(userId, accountId, currentPage, resultsPerPage);
	const promises = emails.map(async (email) => {
		const params: GetObjectCommandInput = {
			Bucket: BUCKET_NAME,
			Key: `${userId}/${email.folder_id}/${email.id}.eml`
		};
		const s3Data = await s3Client.send(new GetObjectCommand(params));
		const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
		email.s3Data = {
			subject: parseEmailSubject(parsedEmail.subject),
			from: getFromNameOrAddress(parsedEmail.from)
		};
		return email;
	});

	return await Promise.all(promises);
}

export async function findEmailsByUserId(
	userId: string,
	currentPage: string,
	resultsPerPage: number,
) {
	const emails = await emailService.findEmailByUserId(userId, currentPage, resultsPerPage);
	const promises = emails.map(async (email) => {
		const params: GetObjectCommandInput = {
			Bucket: BUCKET_NAME,
			Key: `${userId}/${email.folder_id}/${email.id}.eml`
		};
		const s3Data = await s3Client.send(new GetObjectCommand(params));
		const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
		email.s3Data = {
			subject: parseEmailSubject(parsedEmail.subject),
			from: getFromNameOrAddress(parsedEmail.from)
		};
		return email;
	});

	return await Promise.all(promises);
}

export async function findEmailByIdAndUserId(
	userId: string,
	emailId: string
) {
	const email = await emailService.findEmailByIdAndUserId(userId, emailId);
	const params: GetObjectCommandInput = {
		Bucket: BUCKET_NAME,
		Key: `${userId}/${email.folder_id}/${email.id}.eml`
	};
	const s3Data = await s3Client.send(new GetObjectCommand(params));
	const parsedEmail = await parseEmail(await s3Data.Body?.transformToString());
	const html = parsedEmail.html ? parsedEmail.html : (parsedEmail.textAsHtml ?? '');
	return { ...email, html };
}

export async function deleteS3Objects(prefix: string): Promise<void> {
    const listObjectParams: ListObjectsV2CommandInput = {
        Bucket: BUCKET,
        Prefix: prefix,
        MaxKeys: 100,
    };

    let isTruncated = true;
    try {
        while (isTruncated) {
            const results = await s3Client.send(new ListObjectsV2Command(listObjectParams));
            const s3Objects = results.Contents;
            const promises = s3Objects?.map(async (s3Object) => {
                if (s3Object.Key) {
                    return deleteS3Object(s3Object.Key);
                }
            });

            if (promises) {
                await Promise.all(promises);
            }

            isTruncated = results.IsTruncated ?? false;
            if (isTruncated) {
                listObjectParams.ContinuationToken = results.NextContinuationToken;
            }
        }
    } catch (err) {
        logger.error(JSON.stringify(err));
        throw err;
    }
}

export async function insertS3Object(key: string, body: string): Promise<PutObjectCommandOutput> {
    const params: PutObjectCommandInput = {
        Bucket: BUCKET,
        Key: key,
        Body: body,
    };
    try {
        const results = await s3Client.send(new PutObjectCommand(params));
        return results;
    } catch (err) {
        logger.error(JSON.stringify(err));
        throw err;
    }
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

async function deleteS3Object(key: string): Promise<void> {
    const params: DeleteObjectCommandInput = {
        Bucket: BUCKET,
        Key: key,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
        logger.error(JSON.stringify(error));
        throw error;
    }
}