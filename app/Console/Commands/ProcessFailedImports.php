<?php

namespace App\Console\Commands;

use App\Jobs\FetchEmails;
use App\Models\Email;
use App\Models\Folder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessFailedImports extends Command
{
    private const BATCH_SIZE = 500;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'process:failed-imports';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Re-process emails failed to import';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $unProcessedMailboxes = Folder::join('emails', 'folders.id', '=', 'emails.folder_id')
            ->where('emails.imported', '=', false)
            ->select(DB::raw('folders.id, count(folders.id)'))
            ->groupBy('folders.id')
            ->get();

        foreach ($unProcessedMailboxes as $unProcessedMailbox) {
            $batches = ceil($unProcessedMailbox->count / self::BATCH_SIZE);

            for ($i = 0; $i < $batches; $i++) {
                $offset = $i * self::BATCH_SIZE;
                FetchEmails::dispatch(
                    $unProcessedMailbox,
                    $this->getUnprocessedMailboxMessages($unProcessedMailbox->id, $offset),
                    true
                );

                Log::info(
                    sprintf(
                        "Queued job for %s -> Batch no. %d",
                        $unProcessedMailbox->name,
                        $i + 1
                    )
                );
            }
        }

        return self::SUCCESS;
    }

    private function getUnprocessedMailboxMessages(int $folderId, int $offset): array
    {
        $unProcessedMessages = Email::where('folder_id', '=', $folderId)
            ->where('imported', '=', false)
            ->offset($offset)
            ->limit(self::BATCH_SIZE)
            ->orderByDesc('id')
            ->pluck('message_number');

        return $unProcessedMessages->toArray();
    }
}
