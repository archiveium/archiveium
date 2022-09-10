<?php

use App\Http\Livewire\Auth\EmailVerification\EmailVerification;
use App\Http\Livewire\Auth\EmailVerification\EmailVerificationPrompt;
use App\Http\Livewire\Auth\Login;
use App\Http\Livewire\Auth\PasswordReset\ForgotPassword;
use App\Http\Livewire\Auth\PasswordReset\ResetPassword;
use App\Http\Livewire\Auth\PreviewRegistration;
use App\Http\Livewire\Auth\Registration;
use Illuminate\Support\Facades\Route;

Route::get('/register', Registration::class)
    ->middleware(['guest'])
    ->name('register');

Route::get('/preview-registration', PreviewRegistration::class)
    ->middleware(['guest'])
    ->name('preview.registration');

Route::get('/login', Login::class)
    ->middleware(['guest'])
    ->name('login');

Route::get('/forgot-password', ForgotPassword::class)
    ->middleware('guest')
    ->name('password.request');

Route::get('/reset-password/{token}', ResetPassword::class)
    ->middleware('guest')
    ->name('password.reset');

Route::get('/verify-email', EmailVerificationPrompt::class)
    ->middleware(['auth'])
    ->name('verification.notice');

Route::get('/verify-email/{id}/{hash}', EmailVerification::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');
