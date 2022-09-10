<?php

namespace App\SyncHelper;

use App\Exceptions\ConflictingUidValidityException;
use App\Models\Folder;
use App\Services\FolderService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

abstract class SyncHelperAbstract implements SyncHelper
{
    /**
     * @param Collection $savedFolders
     * @param array $remoteFolder
     * @return Folder|null
     * @throws ConflictingUidValidityException
     */
    public function getSyncedSavedFolder(Collection $savedFolders, array $remoteFolder): ?Folder
    {
        $folderMatches = $savedFolders->where('status_uidvalidity', '=', $remoteFolder['uidvalidity']);

        if (count($folderMatches) > 1) {
            throw new ConflictingUidValidityException('Found multiple folders with uidvalidity ' . $remoteFolder['uidvalidity']);
        }

        $savedFolder = $folderMatches->first();

        if (!is_null($savedFolder)) {
            $savedFolder->setAttribute('array_index', current($folderMatches->keys()->toArray()));
        }

        return $savedFolder;
    }

    /**
     * @param string $savedFolderName
     * @param string $remoteFolderName
     * @return bool
     */
    public function hasFolderNameChanged(string $savedFolderName, string $remoteFolderName): bool
    {
        return strcasecmp($savedFolderName, $remoteFolderName) === 0;
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param int $folderId
     * @param string $newName
     * @param string $oldName
     * @return bool
     */
    public function renameFolder(int $userId, int $accountId, int $folderId, string $newName, string $oldName): bool
    {
        if (FolderService::rename($userId, $accountId, $folderId, $newName)) {
            Log::info(sprintf("Folder '%s' renamed to '%s' in database", $oldName, $newName));
            return true;
        }

        Log::error(sprintf("Folder '%s' failed to rename to '%s' in database", $oldName, $newName));
        return false;
    }

    /**
     * @param Collection $savedFolders
     * @param int $userId
     * @param int $accountId
     * @return bool
     * @throws Throwable
     */
    public function flagSavedFolderAsDeleted(Collection $savedFolders, int $userId, int $accountId): bool
    {
        if ($savedFolders->count() > 0) {
            $deletedFolderIds = $savedFolders->pluck('id')->toArray();

            if (FolderService::softDelete($userId, $accountId, $deletedFolderIds)) {
                Log::info(
                    sprintf(
                        "Folder(s) '%s' soft deleted in database",
                        implode(', ', $deletedFolderIds)
                    )
                );
            } else {
                Log::error(
                    sprintf(
                        "Folder(s) '%s' failed to soft delete in database",
                        implode(', ', $deletedFolderIds)
                    )
                );

                return false;
            }
        }

        return true;
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param array $remoteFolder
     * @return bool
     */
    protected function createFolder(int $userId, int $accountId, array $remoteFolder): bool
    {
        $folderAdded = FolderService::add(
            $userId,
            $accountId,
            $remoteFolder['name'],
            $remoteFolder['uidvalidity'],
            $remoteFolder['count']
        );

        if ($folderAdded) {
            Log::info(
                sprintf(
                    "Folder '%s (%s)' added to database",
                    $remoteFolder['name'],
                    $remoteFolder['uidvalidity']
                )
            );

            return true;
        } else {
            Log::error(
                sprintf(
                    "Folder '%s (%s)' failed to add to database",
                    $remoteFolder['name'],
                    $remoteFolder['uidvalidity']
                )
            );

            return false;
        }
    }

    /**
     * @param int $userId
     * @param int $accountId
     * @param array $remoteFolder
     * @return bool
     */
    protected function upsertFolder(int $userId, int $accountId, array $remoteFolder): bool
    {
        $folderUpserted = FolderService::upsert(
            $userId,
            $accountId,
            $remoteFolder['name'],
            $remoteFolder['uidvalidity'],
            $remoteFolder['count']
        );

        if ($folderUpserted) {
            Log::info(
                sprintf(
                    "Folder '%s (%s)' update/added in database",
                    $remoteFolder['name'],
                    $remoteFolder['uidvalidity']
                )
            );

            return true;
        }

        Log::error(
            sprintf(
                "Folder '%s (%s)' failed to update/add in database",
                $remoteFolder['name'],
                $remoteFolder['uidvalidity']
            )
        );

        return false;
    }
}
