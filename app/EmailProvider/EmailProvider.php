<?php

namespace App\EmailProvider;

use App\SyncHelper\SyncHelper;
use Ddeboer\Imap\Connection;

interface EmailProvider
{
    /**
     * @param $username
     * @param $password
     * @return void
     */
    public function authenticate($username, $password): void;

    /**
     * @return string
     */
    public function getHostname(): string;

    /**
     * @return Connection
     */
    public function getConnection(): Connection;

    /**
     * @return bool
     */
    public function ping(): bool;

    /**
     * @return array
     */
    public function getAllFolders(): array;

    /**
     * @param string $folderName
     * @return array
     */
    public function getFolderStatus(string $folderName): array;

    /**
     * @return void
     */
    public function closeConnection(): void;

    /**
     * @return array
     */
    public function getBlackListedFolders(): array;

    /**
     * @return SyncHelper
     */
    public function getSyncHelper(): SyncHelper;
}
