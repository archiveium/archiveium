<?php

namespace App\EmailProvider;

use App\SyncHelper\SyncHelper;
use App\SyncHelper\ZohoSyncHelper;
use Ddeboer\Imap\Connection;
use Ddeboer\Imap\Exception\AuthenticationFailedException;
use Ddeboer\Imap\Server;

class ZohoFreeProvider extends EmailProviderAbstract
{
    /**
     * @var Server
     */
    private $server;

    /**
     * @var Connection
     */
    private $connection;

    public function __construct()
    {
        $this->server = new Server($this->getHostname());
    }

    /**
     * @inheritDoc
     * @throws AuthenticationFailedException
     */
    public function authenticate($username, $password): void
    {
        $this->connection = $this->server->authenticate($username, $password);
    }

    /**
     * @inheritDoc
     */
    public function ping(): bool
    {
        // TODO: Implement ping() method.
        return false;
    }

    /**
     * @inheritDoc
     */
    public function getHostname(): string
    {
        return 'imappro.zoho.com';
    }

    /**
     * @return Connection
     */
    public function getConnection(): Connection
    {
        return $this->connection;
    }

    public function getBlackListedFolders(): array
    {
        return [
            'Drafts'
        ];
    }

    public function getFolderStatus(string $folderName): array
    {
        return get_object_vars($this->getConnection()->getMailbox($folderName)->getStatus());
    }

    public function closeConnection(): void
    {
        $this->getConnection()->close();
    }

    /**
     * @return SyncHelper
     */
    public function getSyncHelper(): SyncHelper
    {
        return new ZohoSyncHelper();
    }
}
