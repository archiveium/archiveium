import * as emailRepository from '$lib/server/repositories/emailRepository';
import * as s3Service from '$lib/server/services/s3Service';
import * as emailFolderService from '$lib/server/services/emailFolderService';
import type { Folder } from '../../../types/folder';
import type { ImapEmail } from '../../../types/imap';
import { db } from '../database/connection';
import { MultipleEmailWithSameEmailIdException } from '../../../exceptions/email';
import { logger } from '../../../utils/logger';

export async function findEmailByFolderIdAndUserId(
	userId: string,
	folderId: string,
	currentPage: string,
	resultsPerPage: number
) {
	const page = Number(currentPage);
	const offset = page === 1 ? 0 : (page - 1) * resultsPerPage;
	return emailRepository.findEmailByFolderIdAndUserId(userId, folderId, offset, resultsPerPage);
}

export async function findEmailByAccountIdAndUserId(
	userId: string,
	accountId: string,
	currentPage: string,
	resultsPerPage: number
) {
	const page = Number(currentPage);
	const offset = page === 1 ? 0 : (page - 1) * resultsPerPage;
	return emailRepository.findEmailByAccountIdAndUserId(userId, accountId, offset, resultsPerPage);
}

export async function findEmailByUserId(
	userId: string,
	currentPage: string,
	resultsPerPage: number
) {
	const page = Number(currentPage);
	const offset = page === 1 ? 0 : (page - 1) * resultsPerPage;
	return emailRepository.findEmailByUserId(userId, offset, resultsPerPage);
}

export async function findEmailByIdAndUserId(userId: string, emailId: string) {
	return emailRepository.findEmailByIdAndUserId(userId, emailId);
}

export async function findEmailCountByFolderAndUserId(
	userId: string,
	folderId: string
): Promise<number> {
	return emailRepository.findEmailCountByFolderAndUserId(userId, folderId);
}

export async function findEmailCountByAccountIdAndUserId(
	userId: string,
	accountId: string
): Promise<number> {
	return emailRepository.findEmailCountByAccountIdAndUserId(userId, accountId);
}

export async function findEmailCountByUserId(userId: string): Promise<number> {
	return emailRepository.findEmailCountByUserId(userId);
}

export async function findFailedEmailCountByUserId(userId: string): Promise<number> {
	return emailRepository.findFailedEmailCountByUserId(userId);
}

export async function findEmailByEmailId(emailId: string, folderId: string) {
	const emails = await emailRepository.findEmailByEmailId(emailId);

	// check if email <-> folder association doesn't already exist
	const emailFolderAssociation = emails.some((email) => { return email.folder_id === folderId; })
	if (emailFolderAssociation) {
		throw new MultipleEmailWithSameEmailIdException(`Multiple emails exist for emailId ${emailId}`);
	}
	
	return emails[0] ?? null;
}

export async function saveAndSyncWithS3(email: ImapEmail, folder: Folder, checkEmailId: boolean) {
	let savedEmail: { id: string; user_id: string; email_id: string | null; imported: boolean } | null;
	let hasSource = false;
	if (checkEmailId) {
		try {
			savedEmail = await findEmailByEmailId(email.emailId, folder.id);
		} catch (error) {
			if (error instanceof MultipleEmailWithSameEmailIdException) {
				// do nothing, probably a result of job re-processing already saved email/folder combo
				logger.warn(error.message);
				return;
			}
			throw error;
		}
	}

	return db.transaction().execute(async (trx) => {
		// Save to emails table and S3 if no previous email has same emailId
		let insertedEmailId;
		if (savedEmail) {
			insertedEmailId = savedEmail.id;
		} else {
			hasSource = true;
			const insertedEmail = await emailRepository.insertEmail(
				{
					message_number: email.uid,
					user_id: folder.user_id,
					account_id: folder.account_id,
					email_id: email.emailId,
					imported: true,
					has_attachments: email.hasAttachments,
					udate: email.internalDate,
					size_total: email.size_total,
					size_without_attachments: email.size_without_attachments
				},
				trx
			);
			insertedEmailId = insertedEmail.id;
		}

		await emailFolderService.insertEmailFolder(
			{
				email_id: insertedEmailId,
				folder_id: folder.id,
				has_source: hasSource
			},
			trx
		);

		// Perform S3 save in the end so as to be able to rollback
		// transaction if S3 save fails
		if (hasSource) {
			await s3Service.insertS3Object(
				`${folder.user_id}/${folder.id}/${insertedEmailId}.eml`,
				email.source
			);
		}
	});
}
