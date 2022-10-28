<?php

namespace App\Jobs;

use App\EmailProvider\EmailProvider;
use App\EmailProvider\EmailProviderFactory;
use App\Events\AuthenticationFailedEvent;
use App\Exceptions\MailboxUpdatedFailedException;
use App\Models\Folder;
use App\Services\AccountService;
use Ddeboer\Imap\Connection;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Ddeboer\Imap\Exception\ReopenMailboxException;
use Ddeboer\Imap\MailboxInterface;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ScheduleBackup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Delete the job if its models no longer exist.
     */
    public bool $deleteWhenMissingModels = true;

    private readonly int $batchSize;
    private int $userId;
    private int $accountId;
    private Folder $folder;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $userId, int $accountId, Folder $folder)
    {
        Log::info("Job created", [
            'User ID' => $userId,
            'Account ID' => $accountId,
            'Folder ID' => $folder->id
        ]);

        $this->userId = $userId;
        $this->accountId = $accountId;
        $this->folder = $folder;
    }

    /**
     * Execute the job.
     *
     * @return void
     * @throws Exception
     */
    public function handle(): void
    {
        $this->batchSize = config('app.batch_size');
        Log::info(
            "Preparing backup schedule",
            [
                'User ID' => $this->userId,
                'Account ID' => $this->accountId,
                'Folder ID' => $this->folder->id,
                'Batch Size' => $this->batchSize
            ]
        );

        try {
            $account = AccountService::getById($this->userId, $this->accountId);
        } catch (ModelNotFoundException $e) {
            Log::warning(
                sprintf(
                    "Account ID %d does not exist. Deleting job.",
                    $this->accountId
                )
            );

            $this->delete();

            return;
        }

        $emailProvider = EmailProviderFactory::get($account->provider->id);

        try {
            $emailProvider->authenticate($account->username, $account->password);
            $connection = $emailProvider->getConnection();
        } catch (AuthenticationFailedException $e) {
            Log::error($e->getMessage());

            // Disable syncing and send notification to user
            AuthenticationFailedEvent::dispatch($account);

            return;
        }

        $folderUpdateCandidates = [];
        try {
            list($savedFolder, $messageNumbers) = $this->processMailbox($emailProvider, $connection, $this->folder);
            if (!is_null($savedFolder)) {
                $folderUpdateCandidates[] = [
                    'entity'          => $savedFolder,
                    'message_numbers' => $messageNumbers
                ];
            }
        } catch (ReopenMailboxException $e) {
            Log::warning('Skipping folder', [
                'Folder ID' => $this->folder->id,
                'Exception Message' => $e->getMessage()
            ]);
        }

        $this->buildAndDispatchBatches($folderUpdateCandidates);

        $emailProvider->closeConnection();
    }

    /**
     * @param array $mailboxes
     * @return void
     */
    private function buildAndDispatchBatches(array $mailboxes): void
    {
        foreach ($mailboxes as $mailbox) {
            if ($mailbox['entity']->status_messages > 0) {
                $batches = array_chunk($mailbox['message_numbers'], $this->batchSize);
                foreach ($batches as $i => $batch) {
                    FetchEmails::dispatch($mailbox['entity']->id, $batch, false);

                    Log::info('Added job', [
                        'Job No.' => $i + 1,
                        'Folder ID' => $mailbox['entity']->id
                    ]);
                }
            }
        }
    }

    /**
     * @param EmailProvider $emailProvider
     * @param Connection $connection
     * @param Folder $folder
     * @return array
     * @throws Exception|ReopenMailboxException
     */
    private function processMailbox(EmailProvider $emailProvider, Connection $connection, Folder $folder): array
    {
        $remoteFolder = $connection->getMailbox($folder->name);
        $status = $emailProvider->getFolderStatus($folder->name);

        $messageNumbers = $this->getMailboxMessageNumbers($remoteFolder, $status, $folder);

        return [
            $this->updateMailbox($remoteFolder, $messageNumbers, $status, $folder),
            $messageNumbers
        ];
    }

    /**
     * @param MailboxInterface $mailbox
     * @param array $status
     * @param Folder $savedMailbox
     * @return array
     * @throws Exception|ReopenMailboxException
     */
    private function getMailboxMessageNumbers(MailboxInterface $mailbox, array $status, Folder $savedMailbox): array
    {
        if (is_null($savedMailbox->last_updated_msgno)) {
            $messages = $mailbox->getMessages();

            $messageNumbers = [];
            foreach ($messages as $message) {
                $messageNumber = $message->getNumber();
                $messageNumbers[$messageNumber] = $messageNumber;
            }

            rsort($messageNumbers, SORT_NUMERIC);

            return $messageNumbers;
        }

        if ($savedMailbox->status_uidvalidity !== $status['uidvalidity']) {
            throw new Exception('uidvalidity changed. This error should fix itself after scan:provider-folder-changes job runs');
        }

        if ($mailbox->count() === 0) {
            return [];
        }

        $newMessages = $mailbox->getMessageSequence(sprintf("%d:*", $savedMailbox->last_updated_msgno));

        $messageNumbers = [];
        foreach ($newMessages as $message) {
            $messageNumber = $message->getNumber();
            $messageNumbers[$messageNumber] = $messageNumber;
        }

        unset($messageNumbers[$savedMailbox->last_updated_msgno]);

        $newMessageCount = count($messageNumbers);

        if ($newMessageCount > 0) {
            Log::info(sprintf("Found %d new messages to sync for %s", $newMessageCount, $savedMailbox->name));

            rsort($messageNumbers, SORT_NUMERIC);
        }

        return $messageNumbers;
    }

    /**
     * @param MailboxInterface $mailbox
     * @param array $messageNumbers
     * @param array $status
     * @param Folder $savedMailbox
     * @return Folder|null
     * @throws MailboxUpdatedFailedException
     * @throws Throwable
     */
    private function updateMailbox(MailboxInterface $mailbox, array $messageNumbers, array $status, Folder $savedMailbox): ?Folder
    {
        if (count($messageNumbers) === 0) {
            return null;
        }

        $savedMailbox->status_messages = $mailbox->count();
        $savedMailbox->status_uidvalidity = $status['uidvalidity'];
        $savedMailbox->last_updated_msgno = current($messageNumbers);

        if ($savedMailbox->saveOrFail()) {
            return $savedMailbox;
        }

        throw new MailboxUpdatedFailedException('Failed to update mailbox in database table');
    }
}
