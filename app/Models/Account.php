<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * App\Models\Account
 *
 * @property int $id
 * @property string $name
 * @property string $username
 * @property string $password
 * @property int $user_id
 * @property int $provider_id
 * @property boolean $syncing
 * @property boolean $deleted
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Account newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Account newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Account query()
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereProviderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereUsername($value)
 * * @method static \Illuminate\Database\Eloquent\Builder|Account whereSyncing($value)
 * @mixin \Eloquent
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Folder[] $folders
 * @property-read int|null $folders_count
 * @property-read \App\Models\Provider|null $provider
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder|Account whereDeleted($value)
 */
class Account extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'username',
        'password',
        'user_id',
        'provider_id',
        'created_at',
        'updated_at',
        'syncing',
        'deleted',
        'searchable',
    ];

    /**
     * Get the provider associated with the account
     */
    public function provider(): HasOne
    {
        return $this->hasOne(Provider::class, 'id', 'provider_id');
    }

    /**
     * Get the user associated with the account
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    /**
     * Get the folders for the account
     */
    public function folders(): HasMany
    {
        return $this
            ->hasMany(Folder::class)
            ->where('deleted_remote', '=', false);
    }
}
