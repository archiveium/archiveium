<?php

namespace App\SearchProvider;

use MeiliSearch\Client;
use MeiliSearch\Endpoints\Indexes;

class MeilisearchProvider extends SearchProvider
{
    /**
     * @var Client
     */
    private $client;

    public function __construct()
    {
        $this->client = new Client(
            sprintf("%s:%d", $this->getHost(), $this->getPort()),
            $this->getMasterKey()
        );
    }

    public function getClient()
    {
        return $this->client;
    }

    /**
     * @return string
     */
    public function getHost(): string
    {
        return config('services.meilisearch.host');
    }

    /**
     * @return string
     */
    public function getPort(): string
    {
        return config('services.meilisearch.port');
    }

    /**
     * @return string
     */
    public function getIndexName(): string
    {
        return config('services.meilisearch.index');
    }

    /**
     * @return string
     */
    private function getMasterKey(): string
    {
        return config('services.meilisearch.master_key');
    }

    /**
     * @param string|null $indexName
     * @return Indexes|mixed
     */
    public function getIndex(string $indexName = null)
    {
        if (is_null($indexName)) {
            $indexName = $this->getIndexName();
        }

        return $this
            ->getClient()
            ->index($indexName);
    }
}
