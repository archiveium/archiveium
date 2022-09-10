<?php

namespace App\Console\Commands;

use App\EmailProvider\EmailProvider;
use App\EmailProvider\EmailProviderFactory;
use App\Exceptions\ConflictingUidValidityException;
use App\Exceptions\UnhandledRemoteFolderException;
use App\Models\Account;
use App\Services\AccountService;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Ddeboer\Imap\Exception\ReopenMailboxException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class ScanProviderFolderChanges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scan:provider-folder-changes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scans all syncing accounts for folder changes (addition/removal)';

    /**
     * Execute the console command.
     *
     * @return int
     * @throws Throwable
     */
    public function handle(): int
    {
        $accounts = AccountService::getAllSyncing();

        foreach ($accounts as $account) {
            try {
                $this->scanAccountFolders($account);
            } catch (AuthenticationFailedException $e) {
                Log::error($e->getMessage());
                return self::FAILURE;
            } catch (ReopenMailboxException|ConflictingUidValidityException $f) {
                Log::error(sprintf("Skipping account '%s'. Exception occurred: %s", $account->id, $f->getMessage()));
            }
        }

        return self::SUCCESS;
    }

    /**
     * @param Account $account
     * @return void
     * @throws AuthenticationFailedException
     * @throws ReopenMailboxException
     * @throws Throwable
     */
    private function scanAccountFolders(Account $account): void
    {
        $emailProvider = $this->buildEmailProvider($account);
        $syncHelper = $emailProvider->getSyncHelper();

        $remoteFolders = $emailProvider->getAllFolders();
        $savedFolders = $account->folders;

        foreach ($remoteFolders as $remoteFolderIndex => $remoteFolder) {
            $savedFolder = $syncHelper->getSyncedSavedFolder($savedFolders, $remoteFolder);

            if (is_null($savedFolder)) {
                // Folder doesn't exist in database
                // TODO Return command status based on deletion status
                if ($syncHelper->addFolder($account->user_id, $account->id, $remoteFolder)) {
                    unset($remoteFolders[$remoteFolderIndex]);
                }
            } else {
                $savedFolderIndex = $savedFolder->getAttribute('array_index');

                // Folder with matching uidvalidity found, check for name
                if ($syncHelper->hasFolderNameChanged($savedFolder->name, $remoteFolder['name'])) {
                    // No action required
                    $savedFolders->forget($savedFolderIndex);
                    unset($remoteFolders[$remoteFolderIndex]);
                } else {
                    // Folder name changed
                    if ($syncHelper->renameFolder($account->user_id, $account->id, $savedFolder->id, $remoteFolder['name'], $savedFolder->name)) {
                        $savedFolders->forget($savedFolderIndex);
                        unset($remoteFolders[$remoteFolderIndex]);
                    }
                }
            }
        }

        $emailProvider->closeConnection();

        // Soft delete any folders that cease to exist in remove
        // TODO Return command status based on deletion status
        $syncHelper->flagSavedFolderAsDeleted($savedFolders, $account->user_id, $account->id);

        // TODO Check if this case can ever happen
        if (!empty($remoteFolders)) {
            throw new UnhandledRemoteFolderException(
                sprintf(
                    "Remote folders '%s' were not processed",
                    json_encode($remoteFolders)
                )
            );
        }
    }

    /**
     * @param Account $account
     * @return EmailProvider
     * @throws AuthenticationFailedException
     */
    private function buildEmailProvider(Account $account): EmailProvider
    {
        $emailProvider = EmailProviderFactory::get($account->provider->id);

        try {
            $emailProvider->authenticate($account->username, $account->password);
            return $emailProvider;
        } catch (AuthenticationFailedException $e) {
            $emailProvider->closeConnection();
            Log::error($e->getMessage());
            throw $e;
        }
    }
}
