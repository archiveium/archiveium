<?php

namespace App\Http\Livewire\Auth\PasswordReset;

use App\Http\Livewire\Base;
use App\Traits\UsesSpamProtection;
use Exception;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Spatie\Honeypot\Http\Livewire\Concerns\HoneypotData;

class ResetPassword extends Base
{
    use UsesSpamProtection;

    public HoneypotData $extraFields;

    /**
     * Reset password view form fields
     */
    public $email;
    public $token;
    public $password;
    public $password_confirmation;

    public function mount(Request $request, string $token)
    {
        $this->extraFields = new HoneypotData();
        $this->token = $token;
        $this->email = $request->get('email', '');
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
            'token' => [
                'required',
            ],
            'password' => [
                'required',
                'confirmed',
                \Illuminate\Validation\Rules\Password::default()
            ]
        ];
    }

    /**
     * @throws Exception
     */
    public function resetPassword()
    {
        $this->protectAgainstSpam();
        $this->validate();

        $password = $this->password;

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            [
                'email' => $this->email,
                'password' => $this->password,
                'password_confirmation' => $this->password_confirmation,
                'token' => $this->token,
            ],
            function ($user) use ($password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        switch ($status) {
            case Password::PASSWORD_RESET:
                redirect(route('login'))->with('success', 'Your password has been reset successfully.');
                break;
            case Password::INVALID_TOKEN:
                $this->addError(
                    'error',
                    'Token for password request has expired.
                        Please <a href="' . route('password.request') . '" class="alert-link">request a new one</a>.'
                );
                break;
            default:
                Log::warning('Unhandled password reset status', ['status' => $status, 'email' => $this->email]);
                $this->addError('error', 'An error occurred while processing your request.');
        }
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'auth.reset-password';
    }
}
