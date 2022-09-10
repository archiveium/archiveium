<?php

namespace App\Http\Livewire\Account;

use App\Http\Livewire\Base;
use App\Services\AccountService;
use App\Services\EmailService;
use App\Services\FolderService;
use Livewire\WithPagination;

class AllAccounts extends Base
{
    use WithPagination;

    private const VIEW = 'account.all-accounts';

    public $allAccounts;
    public $selectedAccount;
    public $selectedFolder;
    public $allFolders;
    public $selectedFolderData;

    public function mount()
    {
        $this->allAccounts = AccountService::getAllByUserId($this->getUser()->id);
        if ($this->allAccounts->isEmpty()) {
            return redirect()->to(route('dashboard'));
        }

        $this->selectedAccount = $this->allAccounts->firstWhere('selectedAccount', true);

        $this->allFolders = FolderService::getAllByUserIdAndAccountId($this->getUser()->id, $this->selectedAccount->id);
        $this->selectedFolder = $this->allFolders->first();
    }

    public function updateSelectedAccount(int $accountId)
    {
        if ($this->selectedAccount->id !== $accountId) {
            $this->selectedAccount->setAttribute('selectedAccount', false);
            $this->selectedAccount = $this->allAccounts->firstWhere('id', $accountId);

            $this->allFolders = FolderService::getAllByUserIdAndAccountId($this->getUser()->id, $this->selectedAccount->id);
            $this->selectedFolder = $this->allFolders->first();
        }
    }

    public function updateSelectedFolder(int $folderId)
    {
        $this->selectedFolder = $this->allFolders->firstWhere('id', $folderId);
    }

    public function toggleSyncing(int $accountId, bool $syncing)
    {
        $userId = $this->getUser()->id;
        $syncingStatus = $syncing ? 'resume' : 'pause';

        if (AccountService::updateSyncingStatus($userId, $accountId, $syncing)) {
            $this->selectedAccount = AccountService::getById($userId, $accountId);
            session()->flash('success', "Syncing {$syncingStatus}d successfully");
        } else {
            session()->flash('error', "Failed to $syncingStatus syncing");
        }
    }

    public function getViewData(): array
    {
        $userId = $this->getUser()->id;

        $emails = EmailService::getAllWithPagination($userId, $this->selectedFolder->id);
        $this->selectedFolderData['emails'] = $emails->items();
        $this->selectedFolderData['pagination'] = $emails;

        return [];
    }

    public function getLivewireView(): string
    {
        return self::VIEW;
    }
}
