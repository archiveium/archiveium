<?php

namespace App\SearchProvider;

abstract class SearchProvider
{
    /**
     * @return mixed
     */
    abstract function getClient();

    /**
     * @param string|null $indexName
     * @return mixed
     */
    abstract function getIndex(string $indexName = null);

    /**
     * @return string
     */
    abstract function getHost(): string;

    /**
     * @return string
     */
    abstract function getPort(): string;

    /**
     * @return string
     */
    abstract function getIndexName(): string;
}
