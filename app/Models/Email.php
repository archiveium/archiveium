<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Crypt;
use PhpMimeMailParser\Attachment;
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
 */
class Email extends Model
{
    use HasFactory;

    public const TYPE_TEXT = 'text';
    public const TYPE_HTML = 'html';

    /**
     * @var Parser
     */
    private $parser;

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
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'raw_message'
    ];

    /**
     * @param string $rawMessage
     * @return Parser
     */
    private function getParser(string $rawMessage): Parser
    {
        if (isset($this->parser)) {
            return $this->parser;
        }

        $decryptedRawMessage = Crypt::decryptString($rawMessage);

        $parser = new Parser();
        $parser->setText($decryptedRawMessage);

        return $parser;
    }

    /**
     * @return Attachment|string
     */
    public function getParsedBodyAttribute()
    {
        $parser = $this->getParser($this->raw_message);

        $parsedBody = $parser->getMessageBody(self::TYPE_HTML);
        if (empty($parsedBody)) {
            $parsedBody = $parser->getMessageBody();
        }

        return $parsedBody;
    }

    /**
     * @return string
     */
    public function getParsedBodyTypeAttribute(): string
    {
        $parser = $this->getParser($this->raw_message);

        if (str_contains($parser->getHeader('content-type'), 'text/plain')) {
            return self::TYPE_TEXT;
        }

        return self::TYPE_HTML;
    }

    /**
     * @return string
     */
    public function getParsedSubjectAttribute(): string
    {
        return $this
            ->getParser($this->raw_message)
            ->getHeader('subject');
    }

    /**
     * @return string
     */
    public function getParsedFromAddressAttribute(): string
    {
        $parser = $this->getParser($this->raw_message);

        return implode(
            '',
            Arr::pluck(
                $parser->getAddresses('from'),
                'address'
            )
        );
    }
}
