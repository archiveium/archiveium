<?php

namespace App\Notifications;

use App\Traits\Email;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InviteUserForPreview extends Notification
{
    use Queueable, Email;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
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
            ->subject('Invitation To Register For Closed Preview of ' . config('app.name'))
            ->line('Your email address has been selected for closed preview. Please go ahead and register your account.')
            ->action('Register Account', route('register'))
            ->line('Thank you for your patience!')
            ->withSwiftMessage(function ($message) use ($header) {
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
