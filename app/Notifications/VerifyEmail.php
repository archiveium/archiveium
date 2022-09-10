<?php

namespace App\Notifications;

use App\Traits\Email;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class VerifyEmail extends \Illuminate\Auth\Notifications\VerifyEmail
{
    use Email;

    /**
     * @param $url
     * @return MailMessage
     */
    protected function buildMailMessage($url): MailMessage
    {
        $header = $this->getTextHeader();

        return (new MailMessage)
            ->subject(Lang::get('Verify Email Address'))
            ->line(Lang::get('Please click the button below to verify your email address.'))
            ->action(Lang::get('Verify Email Address'), $url)
            ->line(Lang::get('If you did not create an account, no further action is required.'))
            ->withSwiftMessage(function ($message) use ($header) {
                $message->getHeaders()
                    ->addTextHeader('X-SMTPAPI', $header);
            });
    }
}
