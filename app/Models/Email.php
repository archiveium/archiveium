<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PhpMimeMailParser\Parser;

/**
 * App\Models\Email
 *
 * @property int $id
 * @property int $user_id
 * @property int $folder_id
 * @property int $message_number
 * @property int $udate
 * @property string $subject
 * @property string $raw_headers
 * @property string $raw_message
 * @property string $raw_structure
 * @property bool $imported
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Email newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Email newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Email query()
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereFolderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereImported($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereMessageNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereRawHeaders($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereRawMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereRawStructure($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereUdate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereUserId($value)
 * @mixin \Eloquent
 * @property string $headers
 * @property bool $has_attachments
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereHasAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereHeaders($value)
 * @property-read \PhpMimeMailParser\Attachment|string $parsed_body
 * @property-read string $parsed_body_type
 * @property-read string $parsed_from_address
 * @property-read string $parsed_subject
 * @property string|null $import_fail_reason
 * @method static \Illuminate\Database\Eloquent\Builder|Email whereImportFailReason($value)
 */
class Email extends Model
{
    use HasFactory;

    public const TYPE_TEXT = 'text';
    public const TYPE_HTML = 'html';

    private string $fromAddress;
    private string $subject;
    private string $contentType;
    private string $messageBody;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'folder_id',
        'message_number',
        'udate',
        'raw_message',
        'has_attachments',
        'imported',
        'created_at',
        'updated_at',
    ];

    /**
     * @param string $messageBody
     * @return void
     */
    public function setMessageBody(string $messageBody): void
    {
        $this->messageBody = $messageBody;
    }

    /**
     * @return string
     */
    public function getMessageBody(): string
    {
        return $this->messageBody ?? '';
    }

    /**
     * @param string $contentType
     * @return void
     */
    public function setContentTypeAttribute(string $contentType): void
    {
        $this->contentType = $contentType;
    }

    /**
     * @return string
     */
    public function getContentTypeAttribute(): string
    {
        if (str_contains($this->contentType, 'text/plain')) {
            return self::TYPE_TEXT;
        }

        return self::TYPE_HTML;
    }

    public function setParsedSubjectAttribute(string $subject): void
    {
        $this->subject = $subject;
    }

    /**
     * @return string
     */
    public function getParsedSubjectAttribute(): string
    {
        return $this->subject;
    }

    /**
     * @param string $fromAddress
     * @return void
     */
    public function setParsedFromAddressAttribute(string $fromAddress): void
    {
        $this->fromAddress = $fromAddress;
    }

    /**
     * @return string
     */
    public function getParsedFromAddressAttribute(): string
    {
        return $this->fromAddress;
    }
}
