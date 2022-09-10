<?php
namespace App\Services;

use App\Models\Account;
use App\Models\Folder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Throwable;

class AccountService
{
    /**
     * @param int $userId
     * @return Collection
     */
    public static function getAllByUserId(int $userId): Collection
    {
        $accounts = Account::whereUserId($userId)
            ->where('deleted', '=', false)
            ->get();

        if ($accounts->count() > 0) {
            $accounts->first()->setAttribute('selectedAccount', true);
        }

        return $accounts;
    }

    /**
     * @param int $userId
     * @return int
     */
    public static function getAllCountByUserId(int $userId): int
    {
        return Account::whereUserId($userId)->where('deleted', '=', false)->count('id');
    }

    public static function getSyncingCountByUserId(int $userId): int
    {
        return Account::whereUserId($userId)
            ->where('syncing', '=', true)
            ->count('id');
    }

    /**
     * @return Collection
     */
    public static function getAllSyncing(): Collection
    {
        return Account::whereSyncing(true)->get();
    }

    /**
     * @return Collection
     */
    public static function getAllDeleted(): Collection
    {
        return Account::whereDeleted(true)->get();
    }

    public static function updateSyncingStatus(int $userId, int $accountId, bool $syncing): bool
    {
        $affectedRows = Account::whereId($accountId)
            ->where('user_id', '=', $userId)
            ->update([
                'syncing' => $syncing,
                'updated_at' => now(),
            ]);

        return $affectedRows > 0;
    }

    /**
     * @throws Throwable
     */
    public static function updateDeletionStatus(int $accountId, int $userId, bool $deleted): bool
    {
        DB::beginTransaction();

        $deletedAccountCount = Account::whereId($accountId)
            ->where('user_id', '=', $userId)
            ->update([
                'deleted' => $deleted,
                'syncing' => !$deleted
            ]);

        if ($deletedAccountCount > 0) {
            $deletedFolderCount = Folder::whereAccountId($accountId)
                ->where('user_id', '=', $userId)
                ->update([
                    'deleted' => $deleted
                ]);

            if ($deletedFolderCount > 0) {
                DB::commit();

                return true;
            }
        }

        DB::rollBack();

        return false;
    }

    /**
     * @param integer $userId
     * @param integer $accountId
     * @return Account
     * @throws ModelNotFoundException
     */
    public static function getById(int $userId, int $accountId): Account
    {
        return Account::whereId($accountId)
            ->where('user_id', '=', $userId)
            ->where('deleted', '=', false)
            ->firstOrFail();
    }

    /**
     * @param Account $account
     * @return bool
     */
    public static function updateByModel(Account $account): bool
    {
        return $account->save();
    }
}
