<?php

namespace App\Http\Livewire;

use App\Helpers\StorageHelper;
use App\Services\AccountService;
use App\Services\EmailService;

class Dashboard extends Base
{
    public $readyToLoad = false;

    public function loadVariables()
    {
        $this->readyToLoad = true;
    }

    public function getViewData(): array
    {
        $userId = $this->getUser()->id;

        if ($this->readyToLoad) {
            $emailCounts = EmailService::getEmailCounts($userId);
            $accountAddedCount = AccountService::getAllCountByUserId($userId);
            $accountSyncingCount = AccountService::getSyncingCountByUserId($userId);
            $quotaUsed = StorageHelper::getQuotaUsed($emailCounts['processed']);
        } else {
            $emailCounts = ['processed' => 0, 'failed' => 0, 'successful' => 0];
            $accountAddedCount = $accountSyncingCount = $quotaUsed = 0;
        }

        return [
            'emailCounts' => $emailCounts,
            'accountAddedCount'=> $accountAddedCount,
            'accountSyncingCount' => $accountSyncingCount,
            'quotaUsed' => $quotaUsed,
            'quota' => number_format(StorageHelper::EMAIL_QUOTA)
        ];
    }

    public function getLivewireView(): string
    {
        return 'dashboard';
    }
}
