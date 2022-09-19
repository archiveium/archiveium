<?php

namespace App\Listeners;

use App\Events\AuthenticationFailedEvent;
use App\Exceptions\MailException;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendEmailWarningNotification implements ShouldQueue
{
    use InteractsWithQueue;

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
     * @return void
     */
    public function handle(AuthenticationFailedEvent $event)
    {
        $account = $event->account;
        $user = $account->user;

        try {
            $user->sendSyncDisabledNotification($account->username, $account->id);
        } catch (Exception $e) {
            Log::error('Encountered failure delivering email', $e->getMessage());
            $this->fail(new MailException());
        }

        Log::info('Successfully delivered email', [
            'email' => $user->email,
            'account_id' => $account->id
        ]);
    }
}
