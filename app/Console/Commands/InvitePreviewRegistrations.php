<?php

namespace App\Console\Commands;

use App\Models\UserInvitation;
use App\Notifications\InviteUserForPreview;
use App\Services\UserInvitationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class InvitePreviewRegistrations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invite:preview-registrations
                            {--batch-size= : Number of users to process in each run}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Invites (sends invitation email) to users that have been flagged as accepted';

    /**
     * @var int
     */
    private $batchSize;

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if ($this->initOptions()) {
            return parent::execute($input, $output);
        }

        return self::FAILURE;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $userInvitations = UserInvitationService::getAllAcceptedInvitations($this->batchSize);

        foreach ($userInvitations as $userInvitation) {
            /**
             * @var $userInvitation UserInvitation
             */
            Log::info('Sending email invite', ['id' => $userInvitation->id, 'username' => $userInvitation->username]);

            $userInvitation->notify(new InviteUserForPreview());

            $userInvitation->notification_sent_at = now();
            if (!UserInvitationService::updateByModel($userInvitation)) {
                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }

    /**
     * @return bool
     */
    private function initOptions(): bool
    {
        $this->batchSize = intval($this->option('batch-size'));
        if (empty($this->batchSize)) {
            $this->error('batch-size option empty or not provided');
            return false;
        }

        return true;
    }
}
