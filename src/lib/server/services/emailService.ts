import * as emailService from '$lib/server/repositories/emailRepository';

export async function findEmailByFolderIdAndUserId(
	userId: string,
	folderId: string,
	currentPage: string,
	resultsPerPage: number,
) {
	const page = Number(currentPage);
	const offset = page === 1 ? 0 : (page - 1) * resultsPerPage;
    return emailService.findEmailByFolderIdAndUserId(userId, folderId, offset, resultsPerPage);
}

export async function findEmailByAccountIdAndUserId(
	userId: string,
	accountId: string,
	currentPage: string,
	resultsPerPage: number,
) {
	const page = Number(currentPage);
	const offset = page === 1 ? 0 : (page - 1) * resultsPerPage;
    return emailService.findEmailByAccountIdAndUserId(userId, accountId, offset, resultsPerPage);
}

export async function findEmailByUserId(
	userId: string,
	currentPage: string,
	resultsPerPage: number,
) {
	const page = Number(currentPage);
	const offset = page === 1 ? 0 : (page - 1) * resultsPerPage;
    return emailService.findEmailByUserId(userId, offset, resultsPerPage);
}

export async function findEmailByIdAndUserId(userId: string, emailId: string) {
    return emailService.findEmailByIdAndUserId(userId, emailId);
}

export async function findEmailCountByFolderAndUserId(userId: string, folderId: string): Promise<number> {
    return emailService.findEmailCountByFolderAndUserId(userId, folderId);
}

export async function findEmailCountByAccountIdAndUserId(userId: string, accountId: string): Promise<number> {
    return emailService.findEmailCountByAccountIdAndUserId(userId, accountId);
}

export async function findEmailCountByUserId(userId: string): Promise<number> {
    return emailService.findEmailCountByUserId(userId);
}

export async function findFailedEmailCountByUserId(userId: string): Promise<number> {
    return emailService.findFailedEmailCountByUserId(userId);
}