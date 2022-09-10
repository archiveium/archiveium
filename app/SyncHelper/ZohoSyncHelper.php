<?php

namespace App\SyncHelper;

use App\Exceptions\ConflictingNameException;
use App\Models\Folder;
use Illuminate\Database\Eloquent\Collection;

class ZohoSyncHelper extends SyncHelperAbstract
{
    /**
     * @param int $userId
     * @param int $accountId
     * @param array $remoteFolder
     * @return bool
     */
    public function addFolder(int $userId, int $accountId, array $remoteFolder): bool
    {
        return $this->upsertFolder($userId, $accountId, $remoteFolder);
    }

    /**
     * @param Collection $savedFolders
     * @param array $remoteFolder
     * @return Folder|null
     * @throws ConflictingNameException
     */
    public function getSyncedSavedFolder(Collection $savedFolders, array $remoteFolder): ?Folder
    {
        $folderMatches = $savedFolders->where('name', '=', $remoteFolder['name']);

        if (count($folderMatches) > 1) {
            throw new ConflictingNameException('Found multiple folders with name ' . $remoteFolder['name']);
        }

        $savedFolder = $folderMatches->first();

        if (!is_null($savedFolder)) {
            $savedFolder->setAttribute('array_index', current($folderMatches->keys()->toArray()));
        }

        return $savedFolder;
    }
}
