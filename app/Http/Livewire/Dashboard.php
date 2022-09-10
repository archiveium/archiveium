<?php

namespace App\Http\Livewire;

use App\Helpers\StorageHelper;
use App\Services\AccountService;
use App\Services\EmailService;

class Dashboard extends Base
{
    private const VIEW = 'dashboard';

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
            $percentDiskUsed = StorageHelper::getPercentDiskUsed(StorageHelper::getDatabaseUsageByUser($userId));
        } else {
            $emailCounts = ['processed' => 0, 'failed' => 0, 'successful' => 0];
            $accountAddedCount = $accountSyncingCount = $percentDiskUsed = 0;
        }

        return [
            'emailCounts' => $emailCounts,
            'accountAddedCount'=> $accountAddedCount,
            'accountSyncingCount' => $accountSyncingCount,
            'percentDiskUsed' => $percentDiskUsed,
        ];
    }

    public function getLivewireView(): string
    {
        return self::VIEW;
    }
}
