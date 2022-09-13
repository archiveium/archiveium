<?php

namespace App\Console;

use App\Console\Commands\BuildEmailSearchIndex;
use App\Console\Commands\FetchNewEmail;
use App\Console\Commands\InvitePreviewRegistrations;
use App\Console\Commands\ProcessDeletedAccounts;
use App\Console\Commands\ScanProviderFolderChanges;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule
            ->command(ProcessDeletedAccounts::class)
            ->everyTwoMinutes()
            ->withoutOverlapping(60);

         $schedule
             ->command(FetchNewEmail::class)
             ->everyFiveMinutes()
             ->withoutOverlapping(10);

        $schedule
            ->command('queue:retry', ['all'])
            ->everyFiveMinutes()
            ->withoutOverlapping(10);

//         $schedule
//             ->command(BuildEmailSearchIndex::class, ['--index-uid=' . config('services.meilisearch.index')])
//             ->everyTenMinutes()
//             ->withoutOverlapping(20);

        $schedule
            ->command(ScanProviderFolderChanges::class)
            ->hourly()
            ->withoutOverlapping();

        $schedule
            ->command(InvitePreviewRegistrations::class, ['--batch-size=5'])
            ->everyTwoHours()
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
