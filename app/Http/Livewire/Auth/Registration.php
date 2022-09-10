<?php

namespace App\Http\Livewire\Auth;

use App\Http\Livewire\Base;
use App\Services\UserService;
use App\Traits\UsesSpamProtection;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Honeypot\Http\Livewire\Concerns\HoneypotData;

class Registration extends Base
{
    use UsesSpamProtection;

    public HoneypotData $extraFields;

    /**
     * Registration view form fields
     */
    public $name;
    public $email;
    public $password;
    public $password_confirmation;

    protected $messages = [
        'email.exists' => 'Please enroll email in closed preview & wait for invitation before registering.'
    ];

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
            'name' => [
                'required',
                'max:255'
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,filter',
                Rule::exists('user_invitations', 'username')->where(function ($query) {
                    return $query->where('accepted', true);
                }),
                'unique:users,email'
            ],
            'password' => [
                'required',
                'confirmed',
                Password::defaults()
            ],
        ];
    }

    /**
     * @throws Exception
     */
    public function register()
    {
        $this->protectAgainstSpam();
        $this->validate();

        $user = UserService::create($this->name, $this->email, $this->password);

        event(new Registered($user));

        return redirect(route('login'))
            ->with('success', 'An email has been sent to your email address. Please verify before logging in');
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'auth.register';
    }
}
