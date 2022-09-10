<?php

namespace App\Jobs;

use App\EmailProvider\EmailProviderFactory;
use App\Events\AuthenticationFailedEvent;
use App\Exceptions\EmailBulkSaveFailedException;
use App\Exceptions\EmailBulkUpdateFailedException;
use App\Exceptions\FolderDeletedOnRemoteException;
use App\Exceptions\ForeignKeyViolationException;
use App\Models\Email;
use App\Services\FolderService;
use Carbon\Carbon;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Ddeboer\Imap\Exception\MessageDoesNotExistException;
use Ddeboer\Imap\Exception\ReopenMailboxException;
use Ddeboer\Imap\Message;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use PDOException;
use Psr\Log\LoggerInterface;
use Throwable;

class FetchEmails implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const MAX_PULL_COUNT = 200;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 1200;

    /**
     * @var int
     */
    private $folderId;

    /**
     * @var array
     */
    private $messageNumbers;

    /**
     * @var LoggerInterface
     */
    private $log;

    /**
     * @var bool
     */
    private $reProcessing;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $folderId, array $messageNumbers, bool $reProcessing)
    {
        $this->folderId = $folderId;
        $this->messageNumbers = $messageNumbers;
        $this->reProcessing = $reProcessing;
    }

    /**
     * Execute the job.
     *
     * @return void
     * @throws Exception
     * @throws Throwable
     */
    public function handle()
    {
        Log::info("Processing folder id " . $this->folderId);

        try {
            $folder = FolderService::getByFolderId($this->folderId);
        } catch (ModelNotFoundException $e) {
            Log::warning(
                sprintf(
                    "Folder ID %d does not exist. Deleting job.",
                    $this->folderId
                )
            );

            $this->delete();
            return;
        } catch (FolderDeletedOnRemoteException $f) {
            Log::warning(
                sprintf(
                    "Folder ID %d was deleted on remote. Deleting job.",
                    $this->folderId
                )
            );

            $this->delete();
            return;
        }

        $account = $folder->account;
        $emailProvider = EmailProviderFactory::get($account->provider_id);

        try {
            $emailProvider->authenticate($account->username, $account->password);
            $connection = $emailProvider->getConnection();
        } catch (AuthenticationFailedException $e) {
            Log::error($e->getMessage());
            $emailProvider->closeConnection();

            // Disable syncing and send notification to user
            AuthenticationFailedEvent::dispatch($account);

            return;
        }

        $mailbox = $connection->getMailbox($folder->name);

        $emails = [];
        $bulkCount = 0;
        foreach ($this->messageNumbers as $messageNumber) {
            if ($bulkCount === self::MAX_PULL_COUNT) {
                try {
                    $this->processBulk($emails);
                } catch (ForeignKeyViolationException $e) {
                    $this->delete();
                    $emailProvider->closeConnection();
                    return;
                } catch (EmailBulkSaveFailedException|EmailBulkUpdateFailedException $e) {
                    $emailProvider->closeConnection();
                    $this->fail($e);
                    return;
                }

                $emails = [];
                $bulkCount = 0;
            }

            try {
                $message = $mailbox->getMessage($messageNumber);
            } catch (MessageDoesNotExistException $e) {
                $message = null;
                Log::error($messageNumber . ' does not exist - ' . $e->getMessage());
            }

            $emails[] = $this->buildEmail($message, $messageNumber, $folder->id, $folder->user_id);
            $bulkCount++;
        }

        try {
            $this->processBulk($emails);
        } catch (ForeignKeyViolationException $e) {
            $this->delete();
            $emailProvider->closeConnection();
            return;
        } catch (EmailBulkSaveFailedException|EmailBulkUpdateFailedException $e) {
            $emailProvider->closeConnection();
            $this->fail($e);
            return;
        }

        $emailProvider->closeConnection();

        Log::info(
            sprintf(
                "Finished processing '%s' for user id %d. %s",
                $folder->name,
                $folder->user_id,
                'Successfully closed connection'
            )
        );
    }

    /**
     * @param array $emails
     * @return void
     * @throws EmailBulkSaveFailedException
     * @throws EmailBulkUpdateFailedException
     * @throws ForeignKeyViolationException
     */
    private function processBulk(array $emails): void
    {
        if ($this->reProcessing) {
            $this->updateBulk($emails);
        } else {
            $this->saveBulk($emails);
        }
    }

    /**
     * @param Message|null $message
     * @param int $messageNumber
     * @param int $folderId
     * @param int $userId
     * @return array
     */
    private function buildEmail(?Message $message, int $messageNumber, int $folderId, int $userId): array
    {
        $email = new Email();
        $email->makeVisible('raw_message');

        if (is_null($message)) {
            $email->udate = 0;
            $email->raw_message = '';
            $email->imported = false;
        } else {
            try {
                $email->udate = $message->getHeaders()->get('udate');
                $email->raw_message = Crypt::encryptString($message->getRawMessage());
                $email->has_attachments = $message->hasAttachments();
                $email->imported = true;
            } catch (MessageDoesNotExistException|ReopenMailboxException $e) {
                Log::error($messageNumber . ' unable to get further info. - ' . $e->getMessage());
                Log::error(imap_last_error());

                $email->udate = 0;
                $email->raw_message = '';
                $email->has_attachments = false;
                $email->imported = false;
            }
        }

        $email->user_id = $userId;
        $email->folder_id = $folderId;
        $email->message_number = $messageNumber;
        $email->created_at = Carbon::now();

        return $email->toArray();
    }

    /**
     * @param array $emails
     * @return bool
     * @throws ForeignKeyViolationException|EmailBulkUpdateFailedException
     */
    private function updateBulk(array $emails): bool
    {
        $rollback = false;

        foreach ($emails as $email) {
            try {
                $updateCount = Email::whereMessageNumber($email['message_number'])
                    ->where('folder_id', '=', $email['folder_id'])
                    ->update(
                        [
                            'udate'         => $email['udate'],
                            'raw_message'   => $email['raw_message'],
                            'imported'      => $email['imported']
                        ]
                    );
            } catch (PDOException $e) {
                if ($e->getCode() == 23503) {
                    Log::warning('Email update failed to save. Folder was probably deleted.');
                    throw new ForeignKeyViolationException();
                } else {
                    Log::error('Email update failed to save. PDOException occurred with error code ' . $e->getMessage());
                    throw new EmailBulkUpdateFailedException($e->getMessage());
                }
            }

            if ($updateCount !== 1) {
                Log::error('Failed to update message number - ' . $email['message_number']);
                $rollback = true;
            }
        }

        return !$rollback;
    }

    /**
     * @param array $emails
     * @return bool
     * @throws ForeignKeyViolationException|EmailBulkSaveFailedException
     */
    private function saveBulk(array $emails): bool
    {
        if (empty($emails)) {
            return true;
        }

        try {
            if (Email::insert($emails)) {
                return true;
            }

            Log::error('Failed to bulk insert emails');
        } catch (PDOException $e) {
            // Foreign key violation (for when folder is deleted)
            if ($e->getCode() == 23503) {
                Log::warning('Email bulk failed to save. Folder was probably deleted.');
                throw new ForeignKeyViolationException();
            } else {
                Log::error('Email bulk failed to save. PDOException occurred with error code ' . $e->getCode());
                throw new EmailBulkSaveFailedException($e->getMessage());
            }
        }

        return false;
    }
}
