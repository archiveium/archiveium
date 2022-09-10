<?php

namespace App\SyncHelper;

class GmailSyncHelper extends SyncHelperAbstract
{
    /**
     * @param int $userId
     * @param int $accountId
     * @param array $remoteFolder
     * @return bool
     */
    public function addFolder(int $userId, int $accountId, array $remoteFolder): bool
    {
        return $this->createFolder($userId, $accountId, $remoteFolder);
    }
}
