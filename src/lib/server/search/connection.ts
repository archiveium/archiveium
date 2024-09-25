import { MeiliSearch, MeiliSearchApiError } from 'meilisearch';
import { logger } from '../../../utils/logger';
import { SearchTaskTimedOutException, SearchUnhealthyException } from '../../../exceptions/search';

const indexName = 'emails';
const meilisearch = new MeiliSearch({
  host: 'http://meilisearch:7700',
  apiKey: 'developmentMasterKey',
});

async function checkIndexExists(indexName: string): Promise<boolean> {
  try {
    await meilisearch.index(indexName).getRawInfo();  
  } catch (error) {
    if (error instanceof MeiliSearchApiError && error.httpStatus === 404) {
      return false;
    }

    logger.error(`MeiliSearch ${JSON.stringify(error)}`);
    throw error;
  }
  return true;
}

async function waitForTaskCompletion(taskUid: number): Promise<void> {
  const createIndexTask = await meilisearch.waitForTask(taskUid, {
    timeOutMs: 10 * 1000, // 5 seconds
    intervalMs: 10 // time to wait before checking status of task 
  });
  if (createIndexTask.status !== 'succeeded') {
    throw new SearchTaskTimedOutException(`MeiliSearch error ${JSON.stringify(createIndexTask)}`);
  }
}

async function createIndex(indexName: string): Promise<void> {
  logger.info(`MeiliSearch index ${indexName} being created`);
  const enqueuedTask = await meilisearch.createIndex(indexName, {
    primaryKey: 'id'
  });
  await waitForTaskCompletion(enqueuedTask.taskUid);
}

async function updateIndexFilterableAttributes(indexName: string): Promise<void> {
  logger.info(`MeiliSearch index ${indexName} filterable attributes being updated`);
  const enqueuedTask = await meilisearch.index(indexName).updateFilterableAttributes([
    'userId', 'accountId'
  ]);
  await waitForTaskCompletion(enqueuedTask.taskUid);
}

// health check
const health = await meilisearch.health();
if (health.status !== 'available') {
  throw new SearchUnhealthyException(`MeiliSearch is ${health.status}`);
}

// create email index, if it doesn't already exist
const indexExists = await checkIndexExists(indexName);
if (!indexExists) {
  await createIndex(indexName);
  await updateIndexFilterableAttributes(indexName);
}

// await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));
export { meilisearch };