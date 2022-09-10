<?php

namespace App\Http\Livewire\Auth;

use App\Http\Livewire\Base;
use App\Providers\RouteServiceProvider;
use App\Traits\UsesSpamProtection;
use Exception;
use Illuminate\Support\Facades\Auth;
use Spatie\Honeypot\Http\Livewire\Concerns\HoneypotData;

class Login extends Base
{
    use UsesSpamProtection;

    public HoneypotData $extraFields;

    /**
     * Login view form fields
     */
    public $email;
    public $password;

    public function mount()
    {
        $this->extraFields = new HoneypotData();
    }

    /**
     * Define rules for add account form
     * @return array
     */
    protected function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email:rfc,filter'
            ],
            'password' => [
                'required',
            ],
        ];
    }

    /**
     * @throws Exception
     */
    public function login()
    {
        $this->protectAgainstSpam();
        $this->validate();

        if (Auth::attempt(['email' => $this->email, 'password' => $this->password])) {
            return redirect()->intended(RouteServiceProvider::HOME);
        }

        $this->addError('error', 'Invalid username/password. Please try again.');

        return null;
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'auth.login';
    }
}
