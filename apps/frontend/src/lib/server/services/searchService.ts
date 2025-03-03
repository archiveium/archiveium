import config from 'config';
import { logger } from '../../../utils/logger';
import {
	Index,
	MeiliSearch,
	MeiliSearchApiError
} from 'meilisearch';
import type {
	Filter,
	SearchResponse,
	DocumentOptions,
	DocumentsDeletionQuery,
	SearchParams,
} from 'meilisearch';
import { SearchTaskTimedOutException, SearchUnhealthyException } from '../../../exceptions/search';
import { building } from '$app/environment';

type SearchServiceConfig = {
	host: string;
	port: number;
	apiKey: string;
};

class SearchService {
	private readonly INDEX_NAME = 'emails';

	private meilisearch: MeiliSearch;
	private meilisearchIndex: Index;

	constructor(config: SearchServiceConfig) {
		logger.info('[SearchService] Initializing service');
		this.meilisearch = new MeiliSearch({
			host: `${config.host}:${config.port}`,
			apiKey: config.apiKey
		});
		this.meilisearchIndex = this.meilisearch.index(this.INDEX_NAME);
	}

	public async checkHealth() {
		const health = await this.meilisearch.health();
		if (health.status !== 'available') {
			throw new SearchUnhealthyException(`[SearchService] MeiliSearch is ${health.status}`);
		}
	}

	public async createIndex(): Promise<void> {
		logger.info(`[SearchService] Creating index ${this.INDEX_NAME}`);

		// create email index, if it doesn't already exist
		const indexExists = await this.checkIndexExists();
		if (!indexExists) {
			const enqueuedTask = await this.meilisearch.createIndex(this.INDEX_NAME, {
				primaryKey: 'id'
			});
			await this.waitForTaskCompletion(enqueuedTask.taskUid);
			await this.updateIndexFilterableAttributes();
		}
	}

	public async addDocuments(
		documents: Record<string, any>[],
		options?: DocumentOptions
	): Promise<void> {
		const enqueuedTask = await this.meilisearchIndex.addDocuments(documents, options);
		await this.waitForTaskCompletion(enqueuedTask.taskUid);
	}

	public async deleteDocuments(params: DocumentsDeletionQuery): Promise<void> {
		const enqueuedTask = await this.meilisearchIndex.deleteDocuments(params);
		await this.waitForTaskCompletion(enqueuedTask.taskUid);
	}

	public async count(filter: Filter): Promise<number> {
		const res = await this.search('', { limit: 0, filter });
		return res.estimatedTotalHits;
	}

	public async search(
		query: string,
		options: SearchParams
	): Promise<SearchResponse<Record<string, any>, SearchParams>> {
		return this.meilisearchIndex.search(query, options);
	}

	private async updateIndexFilterableAttributes(): Promise<void> {
		logger.info(`[SearchService] Index ${this.INDEX_NAME} filterable attributes being updated`);
		const enqueuedTask = await this.meilisearch
			.index(this.INDEX_NAME)
			.updateFilterableAttributes(['userId', 'accountId']);
		await this.waitForTaskCompletion(enqueuedTask.taskUid);
	}

	private async checkIndexExists(): Promise<boolean> {
		try {
			await this.meilisearch.index(this.INDEX_NAME).getRawInfo();
		} catch (error) {
			if (error instanceof MeiliSearchApiError) {
				return false;
			}
			logger.error(`[SearchService] MeiliSearch ${JSON.stringify(error)}`);
			throw error;
		}
		return true;
	}

	private async waitForTaskCompletion(taskUid: number): Promise<void> {
		const task = await this.meilisearch.waitForTask(taskUid, {
			timeOutMs: 10 * 1000, // 10 seconds
			intervalMs: 10 // time to wait before checking status of task
		});
		if (task.status !== 'succeeded' || task.error) {
			throw new SearchTaskTimedOutException(
				`[SearchService] MeiliSearch error ${JSON.stringify(task)}`
			);
		}
	}
}

const searchService = new SearchService({
	host: config.get<string>('search.host'),
	port: config.get<number>('search.port'),
	apiKey: config.get<string>('search.apiKey')
});

if (!building) {
	await searchService.checkHealth();
	await searchService.createIndex();
}

export { searchService };
