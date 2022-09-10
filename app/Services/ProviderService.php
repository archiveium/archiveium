<?php
namespace App\Services;

use App\Models\Provider;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ProviderService
{
    /**
     * @return Provider[]|Collection
     */
    public static function getAll()
    {
        return Provider::all();
    }

    /**
     * @param int $id
     * @return Provider|Builder
     */
    public static function getById(int $id): Provider
    {
        return Provider::whereId($id)->first();
    }
}
