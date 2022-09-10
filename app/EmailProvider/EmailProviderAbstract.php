<?php

namespace App\EmailProvider;

abstract class EmailProviderAbstract implements EmailProvider
{
    /**
     * @inheritDoc
     */
    public function getAllFolders(): array
    {
        $folders = [];

        /**
         * If not possible for some service providers,
         * check delivered-to and return-path mail headers,
         * if these headers are not there assume to be a draft message
         */
        foreach ($this->getConnection()->getMailboxes() as $mailbox) {
            // Skip container-only mailboxes
            // @see https://secure.php.net/manual/en/function.imap-getmailboxes.php
            if ($mailbox->getAttributes() & \LATT_NOSELECT) {
                continue;
            }

            $mailboxName = $mailbox->getName();

            if (in_array($mailboxName, $this->getBlackListedFolders())) {
                continue;
            }

            $folders[] = [
                'uidvalidity'   => $mailbox->getStatus()->uidvalidity,
                'name'          => $mailboxName,
                'count'         => $mailbox->getStatus()->messages
            ];
        }

        return $folders;
    }
}
