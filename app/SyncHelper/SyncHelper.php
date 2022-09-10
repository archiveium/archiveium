<?php

namespace App\SyncHelper;

use App\Models\Folder;
use Illuminate\Database\Eloquent\Collection;

interface SyncHelper
{
    /**
     * @param Collection $savedFolders
     * @param array $remoteFolder
     * @return Folder|null
     */
    public function getSyncedSavedFolder(Collection $savedFolders, array $remoteFolder): ?Folder;

    /**
     * @param string $savedFolderName
     * @param string $remoteFolderName
     * @return bool
     */
    public function hasFolderNameChanged(string $savedFolderName, string $remoteFolderName): bool;

    /**
     * @param Collection $savedFolders
     * @param int $userId
     * @param int $accountId
     * @return bool
     */
    public function flagSavedFolderAsDeleted(Collection $savedFolders, int $userId, int $accountId): bool;

    /**
     * @param int $userId
     * @param int $accountId
     * @param array $remoteFolder
     * @return bool
     */
    public function addFolder(int $userId, int $accountId, array $remoteFolder): bool;

    /**
     * @param int $userId
     * @param int $accountId
     * @param int $folderId
     * @param string $newName
     * @param string $oldName
     * @return bool
     */
    public function renameFolder(int $userId, int $accountId, int $folderId, string $newName, string $oldName): bool;
}
