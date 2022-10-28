<?php

namespace App\Console\Commands;

use App\Jobs\ScheduleBackup;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Console\Command;

class FetchNewEmail extends Command
{
    /**
     * @var string
     */
    protected $signature = 'fetch:new-email';

    /**
     * @var string
     */
    protected $description = 'Fetches new email(s) available for each account';

    private const DELAY_IN_SECONDS = 5;

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $allAccounts = AccountService::getAllSyncing();
        $now = now();
        $delayInSeconds = self::DELAY_IN_SECONDS;

        /**
         * @var $account Account
         */
        foreach ($allAccounts as $account) {
            foreach ($account->folders as $folder) {
                ScheduleBackup::dispatch(
                    $account->user_id,
                    $account->id,
                    $folder
                )->delay($now->addSeconds($delayInSeconds));

                $delayInSeconds += self::DELAY_IN_SECONDS;
            }
        }

        return self::SUCCESS;
    }
}
