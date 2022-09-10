<?php

namespace App\Http\Livewire\Auth\EmailVerification;

use App\Http\Livewire\Base;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\RateLimiter;

class EmailVerificationPrompt extends Base
{
    public function sendVerification()
    {
        $user = $this->getUser();
        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(RouteServiceProvider::HOME);
        }

        $executed = RateLimiter::attempt(
            'email-verification:' . $user->id,
            1,
            function() use ($user) {
                $user->sendEmailVerificationNotification();
            },
            10 * 60
        );

        if ($executed) {
            session()->flash(
                'success',
                'A new verification link has been sent to email address provided during registration.'
            );
        } else {
            $this->addError(
                'error',
                'An email notification has already been sent. Please try again in 10 minutes.'
            );
        }

        return null;
    }

    public function getLayout(): ?string
    {
        return 'layouts.guest';
    }


    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'auth.email-verification.prompt';
    }
}
