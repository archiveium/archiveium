interface Link {
    href: string;
    isActive: boolean;
}

interface PageLink {
    href: string;
    value: number;
    isActive: boolean;
}

export interface Paginator {
    previousLink: Link;
    pageNumbers: Array<PageLink>;
    nextLink: Link;
}

export function GeneratePagination(
    resultCount: number,
    resultPerPage: number,
    currentPageNum: string,
    selectedFolderId: string,
    selectedAccountId: string,
): Paginator {
    const pageCount = Math.ceil(resultCount / resultPerPage);
    const pageNum = Number(currentPageNum);
    const previousLink: Link = pageNum === 1 ?
        { href: '#', isActive: false } :
        { href: buildSearchParams(pageNum - 1, selectedAccountId, selectedFolderId), isActive: true };
    const nextLink: Link = pageNum === pageCount ?
        { href: '#', isActive: false } :
        { href: buildSearchParams(pageNum + 1, selectedAccountId, selectedFolderId), isActive: true };

    const maxPageNumbers = 10;
    let startPage = Math.max(pageNum - Math.floor(maxPageNumbers / 2), 1);
    const endPage = Math.min(startPage + maxPageNumbers - 1, pageCount);

    if (endPage - startPage < maxPageNumbers - 1) {
        startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }

    let pageNumbers: Array<PageLink> = [];
    for (let i = startPage; i <= endPage; i++) {
        const query = buildSearchParams(i, selectedAccountId, selectedFolderId);;
        pageNumbers.push({
            value: i,
            href: query,
            isActive: i === pageNum,
        });
    }

    return {
        previousLink,
        nextLink,
        pageNumbers
    }
}

export function buildSearchParams(page: string | number, accountId: string, folderId: string): string {
    const query = new URLSearchParams({
        page: typeof page === 'string' ? page : page.toString(),
        accountId,
        folderId
    });
    return `?${query.toString()}`;
}