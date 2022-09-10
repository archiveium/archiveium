<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public static function create(string $name, string $email, string $unHashedPassword): User
    {
        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($unHashedPassword),
        ]);
    }
}
