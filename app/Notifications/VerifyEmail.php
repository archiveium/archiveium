<?php

namespace App\Notifications;

use App\Traits\Email as EmailTrait;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;
use Symfony\Component\Mime\Email;

class VerifyEmail extends \Illuminate\Auth\Notifications\VerifyEmail
{
    use EmailTrait;

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
            ->withSymfonyMessage(function (Email $message) use ($header) {
                $message->getHeaders()
                    ->addTextHeader('X-SMTPAPI', $header);
            });
    }
}
