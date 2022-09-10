<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\Mailbox
 *
 * @mixin \Eloquent
 * @property int $id
 * @property string $name
 * @property int $status_uidvalidity
 * @property int $status_messages
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Folder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Folder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Folder query()
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereStatusMessages($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereStatusUidvalidity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereUpdatedAt($value)
 * @property int $user_id
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereUserId($value)
 * @property string|int $last_updated_message_id
 * @property string|null $last_updated_msgno
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereLastUpdatedMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereLastUpdatedMsgno($value)
 * @property string|null $last_fetch_date
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereLastFetchDate($value)
 * @property string|null $last_fetch_date_raw
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereLastFetchDateRaw($value)
 * @property string|null $fetch_date_start
 * @property string|null $fetch_date_end
 * @property string|null $fetch_date_end_raw
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereFetchDateEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereFetchDateEndRaw($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereFetchDateStart($value)
 * @property int $account_id
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereAccountId($value)
 * @property-read \App\Models\Account|null $account
 * @property bool $deleted
 * @property bool $deleted_remote
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereDeleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Folder whereDeletedRemote($value)
 */
class Folder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'account_id',
        'name',
        'status_uidvalidity',
        'status_messages',
        'last_updated_message_id',
        'last_updated_msgno',
        'created_at',
        'updated_at',
        'deleted',
        'deleted_remote'
    ];

    /**
     * Get the account associated with the folder
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id', 'id');
    }
}
