<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // TODO Ensure value is an email
        $email = config('admin.admin_name');
        $username = config('admin.admin_name');
        $password = config('admin.admin_password');

        if(!empty($email) && !empty($username) && !empty($password)) {
            Log::info("Creating user with email -> {$email} & username -> ${username}");
            User::firstOrCreate(
                [
                    'email' => $email
                ],
                [
                    'name' => $username,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
