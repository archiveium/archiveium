<?php

namespace App\Http\Livewire\Account;

use App\EmailProvider\EmailProviderFactory;
use App\Http\Livewire\Base;
use App\Services\AccountService;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Throwable;

class EditAccount extends Base
{
    private const VIEW = 'account.edit-account';
    private const SUCCESS_UPDATE = 'Successfully updated account. Please re-enable syncing, if required.';
    private const ERROR_UPDATE = 'Unable to update account.';
    private const ERROR_KEY = 'error';
    private const SUCCESS_KEY = 'success';

    public $accountId;
    public $providerName;
    public $email;

    // Editable form fields
    public $name;
    public $password;

    /**
     * Define rules for edit account form
     *
     * @return array
     */
    protected function rules(): array
    {
        return [
            'name' => 'required|min:4',
        ];
    }

    public function mount(int $accountId)
    {
        $account = AccountService::getById(Auth::id(), $accountId);

        $this->accountId = $accountId;
        $this->name = $account->name;
        $this->email = $account->username;
        $this->providerName = $account->provider->name;
    }

    /**
     * @return RedirectResponse|void
     */
    public function updateEmailProvider()
    {
        $this->validate();

        $account = AccountService::getById(Auth::id(), $this->accountId);
        $emailProvider = EmailProviderFactory::get($account->provider_id);
        $password = empty($this->password) ? $account->password : $this->password;

        try {
            $emailProvider->authenticate($account->username, $password);
            $emailProvider->closeConnection();

            $account->name = $this->name;
            $account->password = $password;

            if (!AccountService::updateByModel($account)) {
                $this->addError(self::ERROR_KEY, self::ERROR_UPDATE);
            } else {
                return redirect()
                    ->to(route('dashboard'))
                    ->with(self::SUCCESS_KEY, self::SUCCESS_UPDATE);
            }
        } catch (AuthenticationFailedException $e) {
            $this->addError(self::ERROR_KEY, $e->getMessage());
        }
    }

    /**
     * @return RedirectResponse|void
     * @throws Throwable
     */
    public function deleteAccount()
    {
        if (AccountService::updateDeletionStatus($this->accountId, Auth::id(), true)) {
            return redirect()
                ->to(route('dashboard'))
                ->with('success', 'Account deleted successfully');
        } else {
            session()->flash('error', 'Failed to delete account');
        }
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return self::VIEW;
    }
}
