<?php

namespace App\Console\Commands;

use App\Models\Email;
use App\SearchProvider\MeilisearchProvider;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use MeiliSearch\Client;
use MeiliSearch\Endpoints\Indexes;
use MeiliSearch\Exceptions\ApiException;
use MeiliSearch\Exceptions\JsonEncodingException;
use PhpMimeMailParser\Parser;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class BuildEmailSearchIndex extends Command
{
    private const PAGINATION_LIMIT = 300;
    private const CURSOR_ID = 'cursorId';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'build:email-search-index
                            {--index-uid= : UID of index to use, a new index will be created if it does not exist}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Builds search index for emails';

    /**
     * @var Client
     */
    private $client;

    /**
     * @var Indexes
     */
    private $index;

    /**
     * @var string
     */
    private $indexUid;

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if ($this->initOptions()) {
            $searchProvider = new MeilisearchProvider();
            $this->client = $searchProvider->getClient();

            if ($this->createIndexIfNotExist()) {
                $this->index = $searchProvider->getIndex($this->indexUid);
                return parent::execute($input, $output);
            }
        }

        return self::FAILURE;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
//        $tasks = $this->index->getTasks();
//        foreach ($tasks['results'] as $task) {
//            if ($task['status'] !== 'succeeded') {
//                $this->info($task['status']);
//            }
//        }
//        dd('Stop');

//        $output = $this->client->deleteAllIndexes();
//        dd($output);

        $results = $this->index->search(
            '',
            [
                'limit' => 1,
                'attributesToRetrieve' => ['id', 'user_id'],
                'sort' => [
                    'id:desc'
                ]
            ]
        );

        $rowId = 0;
        if ($results->getHitsCount() > 0) {
            $rowId = current($results->getHits())['id'];
        }

        $query = Email::whereImported(true)
            ->join('folders', 'folders.id', '=', 'emails.folder_id')
            ->join('accounts', 'accounts.id', '=', 'folders.account_id')
            ->select(['emails.id', 'emails.user_id', 'emails.folder_id', 'emails.message_number', 'emails.udate',
                'emails.raw_message', 'emails.has_attachments', 'emails.imported', 'emails.created_at',
                'emails.updated_at', 'folders.account_id', 'accounts.name AS account_name'])
            ->where('emails.id', '>', $rowId);
        $paginator = $query->cursorPaginate(self::PAGINATION_LIMIT, ['*'], self::CURSOR_ID);

        if ($paginator->hasPages()) {
            while ($paginator->hasPages()) {
                $this->indexDocuments($paginator->items());

                $paginator = $query->cursorPaginate(
                    self::PAGINATION_LIMIT,
                    ['*'],
                    self::CURSOR_ID,
                    $paginator->nextCursor()
                );
            }
        } else {
            $this->indexDocuments($paginator->items());
        }

        return self::SUCCESS;
    }

    /**
     * @param array $items
     * @return void
     */
    private function indexDocuments(array $items): void
    {
        $documents = [];

        foreach ($items as $email) {
            /**
             * @var $email Email
             */
            try {
                $parsedEmail = $this->parseEmail($email->raw_message);
            } catch (Exception $e) {
                Log::error($e->getMessage());
                $parsedEmail = [];
            }

            $parsedEmail += [
                'id' => $email->id,
                'user_id' => $email->user_id,
                'folder_id' => $email->folder_id,
                'message_number' => $email->message_number,
                'udate' => $email->udate,
                'subject' => $email->getParsedSubjectAttribute(),
                'from' => $email->getParsedFromAddressAttribute(),
                'has_attachments' => $email->has_attachments,
                'account_name' => $email->account_name
            ];

            $documents[] = $parsedEmail;
        }

        try {
            $response = $this->index->addDocuments($documents);
        } catch (JsonEncodingException $e) {
            $this->error($e->getMessage());
            return;
        }

        $this->info(sprintf("Scheduled indexing with uid %d", $response['uid']));
    }

    /**
     * @param string $encryptedRawMessage
     * @return array
     * @throws Exception
     */
    private function parseEmail(string $encryptedRawMessage): array
    {
        $rawMessage = Crypt::decryptString($encryptedRawMessage);

        $parser = new Parser();
        $parser->setText($rawMessage);

        $attachments = [];
        foreach ($parser->getAttachments(false) as $attachment) {
            $attachments[] = [
                'filename' => $attachment->getFilename()
            ];
        }

        return [
            'message_body' => mb_convert_encoding($parser->getMessageBody('text'), 'HTML-ENTITIES', 'UTF-8'),
            'to' => $parser->getHeader('to'),
            'attachments' => $attachments
        ];
    }

    /**
     * @return bool
     */
    private function createIndexIfNotExist(): bool
    {
        try {
            $this->client->getIndex($this->indexUid);

            return true;
        } catch (ApiException $e) {
            $this->error($e->getMessage());
            $this->info('Creating new index -> ' . $this->indexUid);

            return $this->createIndex();
        }
    }

    /**
     * @return bool
     */
    private function createIndex(): bool
    {
        $response = $this->client->createIndex(
            $this->indexUid,
            [
                'primaryKey' => 'id'
            ]
        );

        $this->info('Created index -> ' . $this->indexUid . ' and task uid is -> ' . $response['uid']);

        $runCount = 5;
        while ($runCount > 0) {
            $taskResponse = $this->client->getTask($response['uid']);
            if ($taskResponse['status'] === 'succeeded') {
                $this->info('Index has been created successfully');

                return $this->updateSettings();
            }

            $this->warn('Index not yet created, current status -> ' . $taskResponse['status'] . '. Trying again in 5 seconds');

            sleep(5);
            $runCount--;
        }

        return false;
    }

    /**
     * @return bool
     */
    private function updateSettings(): bool
    {
        $response = $this->client
            ->index($this->indexUid)
            ->updateSettings(
                [
                    'filterableAttributes' => [
                        'user_id',
                        'folder_id'
                    ],
                    'sortableAttributes' => [
                        'id'
                    ]
                ]
            );

        $runCount = 5;
        while ($runCount > 0) {
            $taskResponse = $this->client->getTask($response['uid']);
            if ($taskResponse['status'] === 'succeeded') {
                $this->info('Operation has been completed successfully');

                return true;
            }

            $this->warn('Operation not yet completed, current status -> ' . $taskResponse['status'] . 'Trying again in 5 seconds');

            sleep(5);
            $runCount--;
        }

        return false;
    }

    /**
     * @return bool
     */
    private function initOptions(): bool
    {
        $this->indexUid = $this->option('index-uid');
        if (empty($this->indexUid)) {
            $this->error('index-uid option empty or not provided');
            return false;
        }

        return true;
    }
}
