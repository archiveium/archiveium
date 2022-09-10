<?php

namespace App\Listeners;

use App\Events\AuthenticationFailedEvent;
use App\Services\AccountService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class DisableAccountSync implements ShouldQueue
{
    /**
     * The name of the queue the job should be sent to.
     *
     * @var string|null
     */
    public $queue = 'listeners';

    /**
     * Handle the event.
     *
     * @param AuthenticationFailedEvent $event
     * @return false|void
     */
    public function handle(AuthenticationFailedEvent $event)
    {
        $account = $event->account;
        Log::info("Disabling syncing for account id $account->id");

        if (AccountService::updateSyncingStatus($account->user_id, $account->id, false)) {
            Log::info("Successfully disabled syncing for account id $account->id");
        } else {
            Log::info("Failed to disable syncing for account id $account->id");
            return false;
        }
    }
}
