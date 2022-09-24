<?php
namespace App\Services;

use App\Models\Email;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\JoinClause;

class EmailService
{
    private const RESULTS_PER_PAGE = 15;

    /**
     * @param int $userId
     * @param int $folderId
     * @return LengthAwarePaginator
     */
    public static function getAllWithPagination(int $userId, int $folderId): LengthAwarePaginator
    {
        return Email::whereUserId($userId)
            ->where('folder_id', $folderId)
            ->select(['id', 'raw_message', 'has_attachments', 'imported', 'created_at'])
            ->orderBy('udate', 'DESC')
            ->paginate(self::RESULTS_PER_PAGE);
    }

    public static function getEmailCounts(int $userId): array
    {
        $processedEmailCount = self::getSavedEmailCount($userId);
        $failedEmailCount = self::getFailedEmailCount($userId);
        $successfulEmailCount = $processedEmailCount - $failedEmailCount;

        return [
            'processed' => $processedEmailCount,
            'failed'    => $failedEmailCount,
            'successful'=> $successfulEmailCount
        ];
    }

    public static function getSavedEmailCount(int $userId): int
    {
        return Email::where('emails.user_id', '=', $userId)
            ->join('folders', function (JoinClause $join) {
                $join->on('folders.id', '=', 'emails.folder_id')
                    ->where('folders.deleted', '=', false);
            })
            ->count('emails.id');
    }

    public static function getFailedEmailCount(int $userId): int
    {
        return Email::where('emails.user_id', '=', $userId)
            ->where('emails.imported', '=', false)
            ->join('folders', function (JoinClause $join) {
                $join->on('folders.id', '=', 'emails.folder_id')
                    ->where('folders.deleted', '=', false);
            })
            ->count('emails.id');
    }

    /**
     * @param int $emailId
     * @param int $userId
     * @return Email
     */
    public static function getByEmailIdAndUserId(int $emailId, int $userId): Email
    {
        return Email::whereId($emailId)
            ->select(['raw_message', 'imported'])
            ->where('user_id', '=', $userId)
            ->first();
    }
}
