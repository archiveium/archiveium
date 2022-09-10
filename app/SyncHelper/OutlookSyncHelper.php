<?php

namespace App\SyncHelper;

class OutlookSyncHelper extends SyncHelperAbstract
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
}
