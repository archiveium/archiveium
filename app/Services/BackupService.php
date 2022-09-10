<?php
namespace App\Services;

use App\Jobs\ScheduleBackup;

class BackupService
{
    public static function start(int $userId, int $accountId): void
    {
        ScheduleBackup::dispatch($userId, $accountId);
    }
}
