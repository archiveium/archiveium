<?php

namespace App\Notifications;

use App\Traits\Email as EmailTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Symfony\Component\Mime\Email;

class SyncDisabled extends Notification
{
    use Queueable, EmailTrait;

    /**
     * @var string
     */
    private $username;

    /**
     * @var int
     */
    private $accountId;

    public function __construct(string $username, int $accountId)
    {
        $this->username = $username;
        $this->accountId = $accountId;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $header = $this->getTextHeader();

        return (new MailMessage)
            ->subject('Authentication Failed For ' . $this->username)
            ->line("It appears that the password provided for syncing $this->username has changed. This has resulted in your account being paused from syncing.")
            ->line('Please take a moment to double-check and change your password. Once done, you can then re-enable syncing.')
            ->action("Update Password", route('edit-account', ['accountId' => $this->accountId]))
            ->withSymfonyMessage(function (Email $message) use ($header) {
                $message->getHeaders()
                    ->addTextHeader('X-SMTPAPI', $header);
            });
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable): array
    {
        return [
            //
        ];
    }
}
