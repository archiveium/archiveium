<?php

namespace App\Http\Livewire\Auth\PasswordReset;

use App\Http\Livewire\Base;
use App\Traits\UsesSpamProtection;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Spatie\Honeypot\Http\Livewire\Concerns\HoneypotData;

class ForgotPassword extends Base
{
    use UsesSpamProtection;

    public HoneypotData $extraFields;

    /**
     * Registration view form fields
     */
    public $email;

    public function mount()
    {
        $this->extraFields = new HoneypotData();
    }

    /**
     * Define rules for password reset form
     * @return array
     */
    protected function rules(): array
    {
        return [
            'email' => [
                'required',
                'email:rfc,filter',
            ],
        ];
    }

    /**
     * @throws Exception
     */
    public function triggerPasswordReset()
    {
        $this->protectAgainstSpam();
        $this->validate();

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            [
                'email' => $this->email
            ]
        );

        switch ($status) {
            case Password::RESET_LINK_SENT:
                redirect(route('login'))->with('success', 'An email has been sent with password reset link.');
                break;
            case Password::RESET_THROTTLED:
                $this->addError('error', 'Too many password reset requested. Please try again in 10 minutes.');
                break;
            case Password::INVALID_USER:
                $this->addError('error', 'User does not exist for this email.');
                break;
            default:
                Log::warning('Unhandled password forgot status', ['status' => $status, 'email' => $this->email]);
                $this->addError('error', 'An error occurred while processing your request.');
        }
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'auth.forgot-password';
    }
}
