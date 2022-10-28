<?php

namespace App\Jobs;

use App\EmailProvider\EmailProviderFactory;
use App\Events\AuthenticationFailedEvent;
use App\Exceptions\AccountSyncingPausedException;
use App\Exceptions\EmailBulkSaveFailedException;
use App\Exceptions\EmailBulkUpdateFailedException;
use App\Exceptions\FolderDeletedOnRemoteException;
use App\Exceptions\ForeignKeyViolationException;
use App\Helpers\S3Helper;
use App\Models\Email;
use App\Services\FolderService;
use Aws\S3\S3Client;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Ddeboer\Imap\Exception\MessageDoesNotExistException;
use Ddeboer\Imap\Exception\ReopenMailboxException;
use Ddeboer\Imap\MailboxInterface;
use Ddeboer\Imap\MessageInterface;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PDOException;
use Psr\Log\LoggerInterface;
use Throwable;

class FetchEmails implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private int $folderId;
    private array $messageNumbers;
    private LoggerInterface $log;
    private bool $reProcessing;

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
    public function handle(): void
    {
        Log::info('Processing folder', ['Job ID' => $this->job->getJobId(), 'Folder ID' =>  $this->folderId]);

        /**
         * @var $s3Client S3Client
         */
        $s3Client = Storage::disk('s3')->getClient();

        try {
            $folder = FolderService::getByFolderId($this->folderId);
        } catch (ModelNotFoundException $e) {
            Log::warning(
                sprintf(
                    "Folder ID %d does not exist. Deleting job.",
                    $this->folderId
                )
            );

            unset($s3Client);
            gc_collect_cycles();
            $this->delete();
            return;
        } catch (FolderDeletedOnRemoteException $f) {
            Log::warning(
                sprintf(
                    "Folder ID %d was deleted on remote. Deleting job.",
                    $this->folderId
                )
            );

            unset($s3Client);
            gc_collect_cycles();
            $this->delete();
            return;
        } catch (AccountSyncingPausedException $g) {
            Log::warning("Account syncing has been paused. Deleting job.");

            unset($s3Client);
            gc_collect_cycles();
            $this->delete();
            return;
        }

        $account = $folder->account;
        $emailProvider = EmailProviderFactory::get($account->provider_id);

        Log::debug('Connecting to email provider', ['Provider' => $emailProvider->getHostname()]);
        try {
            $emailProvider->authenticate($account->username, $account->password);
            $connection = $emailProvider->getConnection();

            Log::debug('Connected to email provider');
        } catch (AuthenticationFailedException $e) {
            Log::error($e->getMessage());
            $emailProvider->closeConnection();
            unset($s3Client);
            gc_collect_cycles();

            // Disable syncing and send notification to user
            AuthenticationFailedEvent::dispatch($account);

            return;
        }

        Log::debug('Fetching emails', ['Folder ID' => $folder->id]);
        $mailbox = $connection->getMailbox($folder->name);

        $emails = $this->buildBulk(
            $mailbox,
            end($this->messageNumbers),
            reset($this->messageNumbers),
            $folder->id,
            $folder->user_id
        );

        Log::debug('Processing bulk operations');
        try {
            $this->processBulk($s3Client, $emails);
        } catch (ForeignKeyViolationException $e) {
            Log::debug('Failed to process bulk', ['Exception' => $e->getMessage()]);
            $this->delete();
            $emailProvider->closeConnection();
            unset($s3Client);
            gc_collect_cycles();
            return;
        } catch (EmailBulkSaveFailedException|EmailBulkUpdateFailedException $e) {
            Log::debug('Failed to process bulk', ['Exception' => $e->getMessage()]);
            $emailProvider->closeConnection();
            unset($s3Client);
            gc_collect_cycles();
            $this->fail($e);
            return;
        }

        Log::debug('Closing connection and cleaning up');
        $emailProvider->closeConnection();
        unset($s3Client);
        gc_collect_cycles();

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
     * @param MailboxInterface $mailbox
     * @param int $seqStart
     * @param int $seqEnd
     * @param int $folderId
     * @param int $userId
     * @return Collection
     */
    private function buildBulk(MailboxInterface $mailbox, int $seqStart, int $seqEnd, int $folderId, int $userId): Collection
    {
        $emails = collect();

        Log::debug('Fetching messages', [
            'seqStart' => $seqStart,
            'seqEnd' => $seqEnd,
            'folderId' => $folderId,
            'userId' => $userId
        ]);

        // TODO Handle scenario where mail no longer exists
        $messages = $mailbox->getMessageSequence("$seqStart:$seqEnd");
        foreach ($messages as $message) {
            $emails->push($this->buildEmailObject($message, $folderId, $userId));
        }

        Log::debug('Fetched messages', ['count' => $emails->count()]);

        return $emails;
    }

    /**
     * @param S3Client $s3Client
     * @param Collection $emails
     * @return void
     * @throws EmailBulkSaveFailedException
     * @throws EmailBulkUpdateFailedException
     * @throws ForeignKeyViolationException
     */
    private function processBulk(S3Client $s3Client, Collection $emails): void
    {
        if ($this->reProcessing) {
            Log::debug('Updating bulk');
            $this->updateBulk($s3Client, $emails);
        } else {
            Log::debug('Saving bulk');
            $this->saveBulk($s3Client, $emails);
        }
    }

    /**
     * @param MessageInterface $message
     * @param int $folderId
     * @param int $userId
     * @return Email
     */
    private function buildEmailObject(MessageInterface $message, int $folderId, int $userId): Email
    {
        $email = new Email();

        $email->udate = 0;
        $email->imported = false;
        $email->has_attachments = false;
        $email->user_id = $userId;
        $email->folder_id = $folderId;
        $email->message_number = $message->getNumber();
        $email->created_at = now();

//        try {
            $email->udate = $message->getHeaders()->get('udate');
            $email->setMessageBody($message->getRawMessage());
            $email->has_attachments = $message->hasAttachments();
            $email->imported = true;
//        } catch (MessageDoesNotExistException $e) {
//            Log::warning($messageNumber . ' does not exist - ' . $e->getMessage());
//            $email->import_fail_reason = $e->getMessage();
//        } catch (ReopenMailboxException $e) {
//            Log::warning($messageNumber . ' unable to get further info. - ' . $e->getMessage());
//            $email->import_fail_reason = $e->getMessage();
//        }

        return $email;
    }

    /**
     * @param S3Client $s3Client
     * @param Collection $emails
     * @return bool
     * @throws EmailBulkUpdateFailedException
     * @throws ForeignKeyViolationException
     */
    private function updateBulk(S3Client $s3Client, Collection $emails): bool
    {
        Log::info('Updating bulk');
        $rollback = false;

        foreach ($emails as $email) {
            $updateCount = 0;

            try {
                if (S3Helper::bulkInsert($s3Client, collect([$email]))) {
                    $updateCount = Email::whereMessageNumber($email['message_number'])
                        ->where('folder_id', '=', $email['folder_id'])
                        ->update(
                            [
                                'udate'     => $email['udate'],
                                'imported'  => $email['imported']
                            ]
                        );
                }
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
     * @param S3Client $s3Client
     * @param Collection $emails
     * @return bool
     * @throws EmailBulkSaveFailedException
     * @throws ForeignKeyViolationException
     */
    private function saveBulk(S3Client $s3Client, Collection $emails): bool
    {
        if (empty($emails)) {
            return true;
        }

        try {
            if (S3Helper::bulkInsert($s3Client, $emails)) {
                if (Email::insert($emails->toArray())) {
                    return true;
                }

                Log::error('Failed to bulk insert emails');
            } else {
                Log::error('Failed to bulk insert objects to S3 bucket');
            }
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
