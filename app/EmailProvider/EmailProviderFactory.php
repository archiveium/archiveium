<?php

namespace App\EmailProvider;

use App\Services\ProviderService;

final class EmailProviderFactory
{
    private const GMAIL = 'gmail';
    private const ZOHO_FREE = 'zoho (free)';
    private const OUTLOOK_FREE = 'outlook (free)';

    public static function get(int $providerId): EmailProvider
    {
        $provider = ProviderService::getById($providerId)->name;

        switch (strtolower($provider)) {
            case self::GMAIL:
                return new GmailProvider();
            case self::ZOHO_FREE:
                return new ZohoFreeProvider();
            case self::OUTLOOK_FREE:
                return new OutlookFreeProvider();
        }
    }
}
