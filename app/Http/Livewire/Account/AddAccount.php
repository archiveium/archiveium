<?php

namespace App\Http\Livewire\Account;

use App\EmailProvider\EmailProviderFactory;
use App\Http\Livewire\Base;
use App\Models\Account;
use App\Models\Folder;
use App\Services\BackupService;
use App\Services\ProviderService;
use Auth;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Livewire\Redirector;
use Throwable;

class AddAccount extends Base
{
    private const ERROR_FAILED_INSERT = 'Failed to save account/folders';
    private const SUCCESS_INSERT      = 'Account & folders saved successfully';
    private const ERROR_KEY           = 'addAccountError';
    private const SUCCESS_KEY         = 'addAccountSuccess';

    public $allProviders;
    public $folderSyncCandidates;

    // Form fields
    public $name;
    public $email;
    public $password;
    public $selectedProvider;
    public $selectedSyncCandidates;

    protected $messages = [
        'email.unique' => 'Email Address has already been added.',
    ];

    /**
     * Define rules for add account form
     * @return array
     */
    protected function rules(): array
    {
        return [
            'name'              => 'required|min:4',
            'password'          => 'required',
            'email'             => [
                'required',
                'email',
                Rule::unique('accounts', 'username')->where('deleted', 'false')
            ],
            'selectedProvider'  => 'required|exists:providers,id'
        ];
    }

    public function mount()
    {
        $this->allProviders = ProviderService::getAll();
        $this->folderSyncCandidates = [];

        foreach ($this->allProviders as $provider) {
            if ($provider->default) {
                $this->selectedProvider = $provider->id;
                break;
            }
        }
    }

    public function submitEmailProvider()
    {
        $this->validate();

        $emailProvider = EmailProviderFactory::get($this->selectedProvider);

        try {
            $emailProvider->authenticate($this->email, $this->password);
            $this->folderSyncCandidates = $emailProvider->getAllFolders();
            $emailProvider->closeConnection();
        } catch (AuthenticationFailedException $e) {
            $this->addError(self::ERROR_KEY, $e->getMessage());
        }
    }

    /**
     * @throws Throwable
     */
    public function submitFolderSyncCandidates(): ?Redirector
    {
        $userId = Auth::id();

        DB::beginTransaction();

        $account = Account::create([
            'name'          => $this->name,
            'username'      => $this->email,
            // TODO Save hashed password
            'password'      => $this->password,
            'user_id'       => $userId,
            'provider_id'   => $this->selectedProvider,
        ]);

        $folders = [];
        foreach (array_filter($this->selectedSyncCandidates) as $index => $candidate) {
            $folders[] = [
                'user_id'            => $userId,
                'account_id'         => $account->id,
                'name'               => $candidate,
                'status_uidvalidity' => $this->folderSyncCandidates[$index]['uidvalidity'],
                'status_messages'    => $this->folderSyncCandidates[$index]['count'],
            ];
        }

        try {
            if (Folder::insert($folders)) {
                DB::commit();
                BackupService::start($userId, $account->id);

                return redirect()
                    ->to(route('add-account'))
                    ->with(self::SUCCESS_KEY, self::SUCCESS_INSERT);
            } else {
                $this->addError(self::ERROR_KEY, self::ERROR_FAILED_INSERT);
            }
        } catch (QueryException $e) {
            $this->addError(self::ERROR_KEY, self::ERROR_FAILED_INSERT);
        }

        DB::rollBack();

        return null;
    }

    public function getViewData(): array
    {
        return [];
    }

    public function getLivewireView(): string
    {
        return 'account.add-account';
    }
}
