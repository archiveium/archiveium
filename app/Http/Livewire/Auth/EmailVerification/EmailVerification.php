<?php

namespace App\Http\Livewire\Auth\EmailVerification;

use App\Http\Livewire\Base;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Verified;

class EmailVerification extends Base
{
    public function mount()
    {
        $user = $this->getUser();

        if ($user->hasVerifiedEmail()) {
            return redirect()
                ->intended(RouteServiceProvider::HOME)
                ->with('success', 'Your email has already been verified.');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()
            ->intended(RouteServiceProvider::HOME)
            ->with('success', 'Your email has been verified.');
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return '';
    }
}
