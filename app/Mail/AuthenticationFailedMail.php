<?php

namespace App\Mail;

use App\Models\Account;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Message;
use Illuminate\Queue\SerializesModels;

class AuthenticationFailedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @var Account
     */
    private $account;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Account $account)
    {
        $this->account = $account;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build(): AuthenticationFailedMail
    {
        $header = $this->asString(
            [
                'category' => config('app.name'),
            ]
        );

        $this->withSwiftMessage(function ($message) use ($header) {
            $message->getHeaders()
                ->addTextHeader('X-SMTPAPI', $header);
        });

        return $this->view('email.authentication_failed')
            ->from(config('mail.from.address'))
            ->subject('Authentication Failed For ' . $this->account->username)
            ->with(
                [
                    'accountUsername' => $this->account->username
                ]
            );
    }

    /**
     * @param array $data
     * @return array|string|string[]|null
     */
    private function asJSON(array $data)
    {
        $json = json_encode($data);

        return preg_replace('/(["\]}])([,:])(["\[{])/', '$1$2 $3', $json);
    }

    /**
     * @param array $data
     * @return string
     */
    private function asString(array $data): string
    {
        $json = $this->asJSON($data);

        return wordwrap($json, 76, "\n   ");
    }
}
