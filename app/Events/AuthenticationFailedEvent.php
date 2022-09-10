<?php

namespace App\Events;

use App\Models\Account;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuthenticationFailedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The account instance.
     *
     * @var Account
     */
    public $account;

    /**
     * Create a new event instance.
     *
     * @param Account $account
     * @return void
     */
    public function __construct(Account $account)
    {
        $this->account = $account;
    }
}
