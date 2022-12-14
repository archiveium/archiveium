<?php

namespace App\Console\Commands;

use App\Exceptions\MissingConfigException;
use App\Helpers\S3Helper;
use App\Models\Account;
use App\Models\Folder;
use App\SearchProvider\MeilisearchProvider;
use App\Services\AccountService;
use Aws\S3\S3Client;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Log;
use LogicException;

class ProcessDeletedAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'process:deleted-accounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Purges data related to deleted account(s)';

    private const RESULT_LIMIT = 500;
    private const TASK_STATUS_CHECK_COUNT = 6;

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $deletedAccounts = AccountService::getAllDeleted();
        foreach ($deletedAccounts as $account) {
             Log::info('Processing account id ' . $account->id);

             if ($this->deleteS3Objects($account->user_id, $account->folders)) {
                 Log::info('Deleted objects from S3 for account id ' . $account->id);

                 if ($this->deleteDatabaseEntries($account)) {
                     Log::info('Deleted database entries for account id ' . $account->id);
                 } else {
                     Log::error('Failed to delete database entries for account id ' . $account->id);
                 }

//                 $this->deletedSearchIndexEntries($account->folders, $account->user_id);
             } else {
                 Log::error('Failed to delete objects from S3 for account id ' . $account->id);
             }
        }

        return self::SUCCESS;
    }

    /**
     * @param int $userId
     * @param Collection $folders
     * @return bool
     * @throws MissingConfigException
     */
    private function deleteS3Objects(int $userId, Collection $folders): bool
    {
        /**
         * @var $s3Client S3Client
         */
        $s3Client = Storage::disk('s3')->getClient();

        /**
         * @var $folder Folder
         */
        foreach ($folders as $folder) {
            if (!S3Helper::deletePath($s3Client, $userId, $folder->id)) {
                return false;
            }
        }

        return true;
    }

    /**
     * NOTE: This is a workaround till the time Meilisearch allows deleteByQuery api
     * Relevant Github issue - https://github.com/meilisearch/product/issues/283
     *
     * @param Collection $folders
     * @param integer $userId
     * @return void
     */
    private function deletedSearchIndexEntries(Collection $folders, int $userId): void
    {
        $folderIdFilter = [];
        foreach ($folders as $folder) {
            $folderIdFilter[] = 'folder_id = ' . $folder->id;
        }

        $searchProvider = new MeilisearchProvider();
        $index = $searchProvider->getIndex();

        $hasMoreHits = true;
        while ($hasMoreHits) {
            $response = $index
                ->search(
                    null,
                    [
                        'filter' => [
                            $folderIdFilter,
                            'user_id = ' . $userId
                        ],
                        'limit' => self::RESULT_LIMIT,
                        'attributesToRetrieve' => ['id']
                    ]
                );

            if ($response->getNbHits() <= 0) {
                $hasMoreHits = false;
            } else {
                $documentIds = Arr::pluck($response->getHits(), 'id');

                $deleteResponse = $index->deleteDocuments($documentIds);

                $this->info(json_encode($deleteResponse));
                $this->info('Scheduled deletion with uid ' . $deleteResponse['uid']);

                $runCount = self::TASK_STATUS_CHECK_COUNT;
                while ($runCount > 0) {
                    $taskResponse = $index->getTask($deleteResponse['uid']);
                    if ($taskResponse['status'] === 'succeeded') {
                        $this->info('Documents deleted successfully');
                        break;
                    }

                    $this->warn('Documents not yet deleted, current status -> ' . $deleteResponse['status'] . '. Trying again in 5 seconds');

                    sleep(5);
                    $runCount--;
                }
            }
        }
    }

    private function deleteDatabaseEntries(Account $account): bool
    {
        try {
            $accountDeleted = $account->delete();
            if (is_null($accountDeleted)) {
                Log::error(
                    sprintf(
                        "Deletion of account id %d returned null value",
                        $account->id
                    )
                );

                return false;
            }

            return true;
        } catch (LogicException $e) {
            Log::error($e->getMessage());
        }

        return false;
    }
}
