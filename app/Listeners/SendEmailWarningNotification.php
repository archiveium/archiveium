<?php

namespace App\Listeners;

use App\Events\AuthenticationFailedEvent;
use App\Exceptions\MailException;
use App\Mail\AuthenticationFailedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        Mail::to($user->email)
            ->send(new AuthenticationFailedMail($account));

        if (count(Mail::failures()) > 0) {
            Log::error('Encountered failures delivering email', Mail::failures());
            $this->fail(new MailException());
        } else {
            Log::info('Successfully delivered email', [
                'email' => $user->email,
                'account_id' => $account->id
            ]);
        }
    }
}
