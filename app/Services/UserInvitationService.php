<?php
namespace App\Services;

use App\Models\UserInvitation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class UserInvitationService
{
    /**
     * @param string $username
     * @return UserInvitation
     * @throws QueryException
     */
    public static function create(string $username): UserInvitation
    {
        return UserInvitation::create([
            'username' => $username
        ]);
    }

    /**
     * @param int $size
     * @return Collection
     */
    public static function getAllAcceptedInvitations(int $size): Collection
    {
        return UserInvitation::whereAccepted(true)
            ->whereNull('notification_sent_at')
            ->orderBy('id')
            ->limit($size)
            ->get();
    }

    /**
     * @param UserInvitation $userInvitation
     * @return bool
     */
    public static function updateByModel(UserInvitation $userInvitation): bool
    {
        try {
            return $userInvitation->saveOrFail();
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
        }

        return false;
    }
}
