<?php

namespace App\EmailProvider;

use App\SyncHelper\OutlookSyncHelper;
use App\SyncHelper\SyncHelper;
use Ddeboer\Imap\Connection;
use Ddeboer\Imap\Exception\ReopenMailboxException;
use Ddeboer\Imap\Server;
use Illuminate\Support\Facades\Log;
use Webklex\PHPIMAP\Client;
use Webklex\PHPIMAP\ClientManager;
use Webklex\PHPIMAP\Exceptions\ConnectionFailedException;
use Webklex\PHPIMAP\Exceptions\FolderFetchingException;
use Webklex\PHPIMAP\Exceptions\MaskNotFoundException;
use Webklex\PHPIMAP\Exceptions\RuntimeException;

class OutlookFreeProvider extends EmailProviderAbstract
{
    private Server $server;
    private Connection $connection;
    private ClientManager $clientManager;
    private Client $client;

    public function __construct()
    {
        parent::__construct();
        $this->server = new Server($this->getHostname(), 993, '/imap/ssl/novalidate-cert');

        /**
         * This hackery is because of https://bugs.php.net/bug.php?id=73186 bug in libc-client
         * and since Webklex\php-imap offers native implementation, it works correctly
         */
        $this->clientManager = new ClientManager();
    }

    /**
     * @inheritDoc
     * @param $username
     * @param $password
     * @throws ConnectionFailedException
     * @throws MaskNotFoundException
     */
    public function authenticate($username, $password): void
    {
        $startTime = microtime(true);
        $this->connection = $this->server->authenticate($username, $password);

        $this->client = $this->clientManager->make([
            'host'          => $this->getHostname(),
            'port'          => 993,
            'encryption'    => 'ssl',
            'validate_cert' => true,
            'username'      => $username,
            'password'      => $password,
            'protocol'      => 'imap'
        ]);
        $this->client->connect();
        Log::debug('Connected to ' . $this->getHostname(), [
            'took (seconds)' => round(microtime(true) - $startTime)
        ]);
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
        return 'outlook.office365.com';
    }

    /**
     * @return Connection
     */
    public function getConnection(): Connection
    {
        return $this->connection;
    }

    /**
     * @return array
     * @throws ConnectionFailedException
     * @throws FolderFetchingException
     * @throws RuntimeException
     * @throws ReopenMailboxException
     */
    public function getAllFolders(): array
    {
        $folders = [];

        /**
         * If not possible for some service providers,
         * check delivered-to and return-path mail headers,
         * if these headers are not there assume to be a draft message
         */
        foreach ($this->connection->getMailboxes() as $mailbox) {
            // Skip container-only mailboxes
            // @see https://secure.php.net/manual/en/function.imap-getmailboxes.php
            if ($mailbox->getAttributes() & \LATT_NOSELECT) {
                continue;
            }

            $mailboxName = $mailbox->getName();

            foreach ($this->getBlackListedFolders() as $key => $value) {
                if (isset($value['canHaveSubFolders'])) {
                    if (str_starts_with($mailboxName, $key)) {
                        continue 2;
                    }
                } else {
                    if (strcasecmp($value, $mailboxName) === 0) {
                        continue 2;
                    }
                }
            }

            $folders[] = [
                'uidvalidity'   => $this->getFolderStatus($mailboxName)['uidvalidity'],
                'name'          => $mailboxName,
                'count'         => $mailbox->count()
            ];
        }

        return $folders;
    }

    public function getBlackListedFolders(): array
    {
        return [
            'Drafts',
            'Outbox',
            'Deleted' => [
                'canHaveSubFolders' => true
            ],
            'Sync Issues' => [
                'canHaveSubFolders' => true
            ]
        ];
    }

    /**
     * @throws RuntimeException
     * @throws FolderFetchingException
     * @throws ConnectionFailedException
     */
    public function getFolderStatus(string $folderName): array
    {
        return $this->client
            ->getFolder($folderName)
            ->examine();
    }

    public function closeConnection(): void
    {
        $this->getConnection()->close();

        if (isset($this->client)) {
            $this->client->disconnect();
        }
    }

    /**
     * @return SyncHelper
     */
    public function getSyncHelper(): SyncHelper
    {
        return new OutlookSyncHelper();
    }
}
