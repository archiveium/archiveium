<?php

namespace App\Providers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        Log::shareContext([
            'container-role' => config('app.container_role')
        ]);

        if ($this->app->environment('local')) {
            Mail::alwaysTo(config('mail.from.address'));
//            DB::listen(function($query) {
//                Log::channel('db_queries')->info(
//                    sprintf(
//                        "%s (%s) - Exec Time: %s",
//                        $query->sql,
//                        implode(',', $query->bindings),
//                        $query->time
//                    )
//                );
//            });
        } else if (config('app.force_https')) {
            URL::forceScheme('https');
        }
    }
}
