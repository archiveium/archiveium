<?php

use App\Http\Controllers\EmailController;
use App\Http\Livewire\Account\AddAccount;
use App\Http\Livewire\Account\AllAccounts;
use App\Http\Livewire\Account\EditAccount;
use App\Http\Livewire\Dashboard;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', Dashboard::class)->name('dashboard');

    Route::prefix('/accounts')->group(function () {
        Route::get('/add', AddAccount::class)->name('add-account');
        Route::get('/edit/{accountId}', EditAccount::class)->name('edit-account');
        Route::get('/', AllAccounts::class)->name('all-accounts');
    });

    Route::prefix('/emails')->group(function () {
        Route::get('{id}', [EmailController::class, 'view'])->name('email.view');
    });
});

require __DIR__.'/auth.php';
