<?php

namespace App\Http\Livewire\Auth;

use App\Http\Livewire\Base;
use App\Services\UserInvitationService;
use App\Traits\UsesSpamProtection;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Spatie\Honeypot\Http\Livewire\Concerns\HoneypotData;

class PreviewRegistration extends Base
{
    use UsesSpamProtection;

    public HoneypotData $extraFields;

    /**
     * Preview registration view form fields
     */
    public $email;

    protected $messages = [
        'email.unique' => 'This email is already registered/enrolled.',
    ];

    public function mount()
    {
        $this->extraFields = new HoneypotData();
    }

    /**
     * Define rules for preview registration form
     * @return array
     */
    protected function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email:rfc,filter',
                'unique:users,email',
                'unique:user_invitations,username'
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

        try {
            UserInvitationService::create($this->email);
        } catch (QueryException $e) {
            Log::error($e->getMessage());
            $this->addError('error', 'There was an error enrolling your account. Please try again.');

            return null;
        }

        return redirect(route('login'))
            ->with('success', 'Thank you for showing interest in ' . config('app.name'). '. Keep an eye on your mailbox!');
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'auth.preview_register';
    }
}
