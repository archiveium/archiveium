import type { LinkType } from 'flowbite-svelte/dist/types';

interface Link {
	href: string;
	isActive: boolean;
}

export interface Paginator {
	previousLink: Link;
	pages: Array<LinkType>;
	nextLink: Link;
	resultCount: number;
	resultsPerPage: number;
}

const MAX_PAGE_NUMBERS = 5;

export function GeneratePagination(
	resultCount: number,
	resultsPerPage: number,
	currentPageNum: string,
	selectedFolderId?: string,
	selectedAccountId?: string
): Paginator {
	const pageCount = Math.ceil(resultCount / resultsPerPage);
	const pageNum = Number(currentPageNum);
	const previousLink: Link =
		pageNum === 1
			? { href: '#', isActive: false }
			: {
					href: buildSearchParams(pageNum - 1, selectedAccountId, selectedFolderId),
					isActive: true
			  };
	const nextLink: Link =
		pageNum === pageCount
			? { href: '#', isActive: false }
			: {
					href: buildSearchParams(pageNum + 1, selectedAccountId, selectedFolderId),
					isActive: true
			  };

	let startPage = Math.max(pageNum - Math.floor(MAX_PAGE_NUMBERS / 2), 1);
	const endPage = Math.min(startPage + MAX_PAGE_NUMBERS - 1, pageCount);

	if (endPage - startPage < MAX_PAGE_NUMBERS - 1) {
		startPage = Math.max(endPage - MAX_PAGE_NUMBERS + 1, 1);
	}

	const pages: Array<LinkType> = [];
	for (let i = startPage; i <= endPage; i++) {
		const query = buildSearchParams(i, selectedAccountId, selectedFolderId);
		pages.push({
			name: `${i}`,
			href: query,
			active: i === pageNum
		});
	}

	return {
		previousLink,
		nextLink,
		pages,
		resultCount,
		resultsPerPage
	};
}

export function buildSearchParams(
	page: string | number,
	accountId?: string,
	folderId?: string
): string {
	const queryParams: Record<string, string> = {};
	queryParams['page'] = typeof page === 'string' ? page : page.toString();
	if (accountId) {
		queryParams['accountId'] = accountId;
	}
	if (folderId) {
		queryParams['folderId'] = folderId;
	}
	const query = new URLSearchParams(queryParams);
	return `?${query.toString()}`;
}
