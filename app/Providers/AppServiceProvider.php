<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
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
        }
    }
}
