import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRemotedEmailCountForSyncedFoldersByUserId } from '../../../models/folders';

vi.mock('../../../models/index.ts', () => {
	const sql = vi.fn();
	sql.mockResolvedValue([{ count: null }]);
	return {
		sql
	};
});

describe('folders model', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('getRemotedEmailCountForSyncedFoldersByUserId', () => {
		it('should return 0 from if no folders exist', async () => {
			// act
			const count = await getRemotedEmailCountForSyncedFoldersByUserId('1');

			// assert
			expect(count).toEqual(0);
		});
	});
});
