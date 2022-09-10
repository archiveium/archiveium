<?php
namespace App\Helpers;

use App\Models\Email;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StorageHelper
{
    private const MAX_DISK_USAGE = 8589934592;
    private const CACHE_TTL = 3600;

    /**
     * Usage is returned in bytes
     *
     * @param int $userId
     * @return int
     */
    public static function getDatabaseUsageByUser(int $userId): int
    {
        return Cache::remember("{$userId}_user_disk_usage", self::CACHE_TTL, function () use ($userId) {
            $usage = Email::whereUserId($userId)
                ->select(DB::raw('SUM(pg_column_size(emails.*)) as usage'))
                ->first();

            return $usage->usage ?? 0;
        });
    }

    /**
     * @param int $currentDiskUsage
     * @return float
     */
    public static function getPercentDiskUsed(int $currentDiskUsage): float
    {
        return round(
            ($currentDiskUsage / self::MAX_DISK_USAGE) * 100,
            2
        );
    }
}
