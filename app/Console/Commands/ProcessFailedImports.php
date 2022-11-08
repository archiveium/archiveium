<?php

namespace App\Console\Commands;

use App\Jobs\FetchEmails;
use App\Models\Email;
use App\Models\Folder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ProcessFailedImports extends Command
{
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

    private readonly int $batchSize;

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $this->batchSize = config('app.batch_size');

        $unProcessedMailboxes = Folder::join('emails', 'folders.id', '=', 'emails.folder_id')
            ->where('emails.imported', '=', false)
            ->select(DB::raw('folders.id, count(folders.id)'))
            ->groupBy('folders.id')
            ->get();

        foreach ($unProcessedMailboxes as $unProcessedMailbox) {
            $batches = ceil($unProcessedMailbox->count / $this->batchSize);

            for ($i = 0; $i < $batches; $i++) {
                $offset = $i * $this->batchSize;
                FetchEmails::dispatch(
                    $unProcessedMailbox->id,
                    $this->getUnprocessedMailboxMessages($unProcessedMailbox->id, $offset),
                    true
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
            ->limit($this->batchSize)
            ->orderByDesc('id')
            ->pluck('message_number');

        return $unProcessedMessages->toArray();
    }
}
