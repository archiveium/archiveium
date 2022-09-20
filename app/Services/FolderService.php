<?php
namespace App\Services;

use App\Exceptions\AccountSyncingPausedException;
use App\Exceptions\FolderDeletedOnRemoteException;
use App\Models\Folder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Throwable;

class FolderService
{
    /**
     * @param int $userId
     * @param int $accountId
     * @return Collection
     */
    public static function getAllByUserIdAndAccountId(int $userId, int $accountId): Collection
    {
        return Folder::whereUserId($userId)
            ->where('account_id', $accountId)
            ->where('status_messages', '>', 0)
            ->select(['id', 'name', 'updated_at'])
            ->get();
    }

    /**
     * @param int $folderId
     * @return Folder
     * @throws ModelNotFoundException|FolderDeletedOnRemoteException|AccountSyncingPausedException
     */
    public static function getByFolderId(int $folderId): Folder
    {
        $folder = Folder::whereId($folderId)
            ->first();

        if (is_null($folder)) {
            throw new ModelNotFoundException();
        } elseif ($folder->deleted_remote) {
            throw new FolderDeletedOnRemoteException();
        } elseif (!$folder->account->syncing) {
            throw new AccountSyncingPausedException();
        }

        return $folder;
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param string $name
     * @param int $uidValidity
     * @param int $messageCount
     * @return bool
     */
    public static function upsert(int $userId, int $accountId, string $name, int $uidValidity, int $messageCount): bool
    {
        $folder = Folder::updateOrCreate(
            [
                'user_id' => $userId,
                'account_id' => $accountId,
                'name' => $name,
                'status_uidvalidity' => $uidValidity,
            ],
            [
                'deleted_remote' => false,
                'status_messages' => $messageCount
            ]
        );

        // Note: Checks to further identify if insert happened or update
        //  - folder was updated -> !$folder->wasRecentlyCreated && $folder->wasChanged()
        //  - folder was created -> $folder->wasRecentlyCreated
        //  - nothing got updated/created -> !$folder->wasRecentlyCreated && !$folder->wasChanged()
        if (!$folder->wasRecentlyCreated && !$folder->wasChanged()) {
            return false;
        }

        return true;
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param string $name
     * @param int $uidValidity
     * @param int $messageCount
     * @return bool
     */
    public static function add(int $userId, int $accountId, string $name, int $uidValidity, int $messageCount): bool
    {
        $folder = new Folder;

        $folder->user_id = $userId;
        $folder->account_id = $accountId;
        $folder->name = $name;
        $folder->status_uidvalidity = $uidValidity;
        $folder->status_messages = $messageCount;

        return $folder->save();
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param int $folderId
     * @param string $newName
     * @return bool
     */
    public static function rename(int $userId, int $accountId, int $folderId, string $newName): bool
    {
        $rowsUpdate = Folder::whereId($folderId)
            ->where('user_id', '=', $userId)
            ->where('account_id', '=', $accountId)
            ->update(
                [
                    'name' => $newName
                ]
            );

        return $rowsUpdate > 0;
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param array $folderIds
     * @return bool
     * @throws Throwable
     */
    public static function softDelete(int $userId, int $accountId, array $folderIds): bool
    {
        DB::beginTransaction();

        $rowsUpdated = Folder::whereIn('id', $folderIds)
            ->where('user_id', '=', $userId)
            ->where('account_id', '=', $accountId)
            ->update(
                [
                    'deleted_remote' => true
                ]
            );

        if ($rowsUpdated === count($folderIds)) {
            DB::commit();

            return true;
        }

        DB::rollBack();

        return false;
    }
}
