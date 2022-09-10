<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Services\AccountService;
use App\Services\BackupService;
use Illuminate\Console\Command;

class FetchNewEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:new-email';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetches new email(s) available for each account';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $allAccounts = AccountService::getAllSyncing();

        /**
         * @var $account Account
         */
        foreach ($allAccounts as $account) {
            BackupService::start(
                $account->user_id,
                $account->id
            );
        }

        return self::SUCCESS;
    }
}
