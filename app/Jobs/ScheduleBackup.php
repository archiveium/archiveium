<?php

namespace App\Jobs;

use App\EmailProvider\EmailProvider;
use App\EmailProvider\EmailProviderFactory;
use App\Events\AuthenticationFailedEvent;
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

class ScheduleBackup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const BATCH_SIZE = 1000;
    private const DELAY_IN_SECONDS = 5;

    /**
     * @var int
     */
    private $userId;

    /**
     * @var int
     */
    private $accountId;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 90;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $userId, int $accountId)
    {
        Log::info("Job created for user id $userId and account id $accountId");

        $this->userId = $userId;
        $this->accountId = $accountId;
    }

    /**
     * Execute the job.
     *
     * @return void
     * @throws Exception
     */
    public function handle()
    {
        Log::info(
            sprintf(
                "Preparing backup schedule for user id %d and account id %d",
                $this->userId,
                $this->accountId
            )
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
        $folders = $account->folders;
        foreach ($folders as $folder) {
            try {
                list($savedFolder, $messageNumbers) = $this->processMailbox($emailProvider, $connection, $folder);
                if (!is_null($savedFolder)) {
                    $folderUpdateCandidates[] = [
                        'entity'          => $savedFolder,
                        'message_numbers' => $messageNumbers
                    ];
                } else {
//                Log::info("Nothing to update for mailbox -> " . $folder->name);
                }
            } catch (ReopenMailboxException $e) {
                Log::warning(
                    sprintf(
                        "Skipping folder '%s'. Exception occurred: %s",
                        $folder->name,
                        $e->getMessage()
                    )
                );
            }
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
        $now = now();
        $delayInSeconds = self::DELAY_IN_SECONDS;

        /**
         * @var $mailbox array
         * @var $messageNumbers array
         */
        foreach ($mailboxes as $mailbox) {
            if ($mailbox['entity']->status_messages > 0) {
                $batches = array_chunk($mailbox['message_numbers'], self::BATCH_SIZE);
                foreach ($batches as $i => $batch) {
                    FetchEmails::dispatch($mailbox['entity']->id, $batch, false)
                        ->delay($now->addSeconds($delayInSeconds));

                    Log::info(sprintf(
                        "Added job no %s for %s with %d seconds delay",
                        $i + 1,
                        $mailbox['entity']->name,
                        $delayInSeconds
                    ));

                    $delayInSeconds += self::DELAY_IN_SECONDS;
                }
            } else {
                Log::warning('Skipping, mailbox has no message');
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
//        Log::debug(sprintf("Processing mailbox '%s'", $folder->name));

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
            throw new Exception("uidvalidity changed. This error should fix itself after 'scan:provider-folder-changes' job runs");
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
     * @return Folder
     */
    private function updateMailbox(MailboxInterface $mailbox, array $messageNumbers, array $status, Folder $savedMailbox): ?Folder
    {
        if (count($messageNumbers) === 0) {
            return null;
        }

        $savedMailbox->status_messages = $mailbox->count();
        $savedMailbox->status_uidvalidity = $status['uidvalidity'];
        $savedMailbox->last_updated_msgno = current($messageNumbers);

        if ($savedMailbox->save()) {
            return $savedMailbox;
        }

        return null;
    }
}
