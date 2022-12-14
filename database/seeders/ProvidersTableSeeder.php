<?php

namespace Database\Seeders;

use App\Models\Provider;
use Illuminate\Database\Seeder;

class ProvidersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // TODO Use values from EmailProviderFactory for name
        $providers = [
            ['name' => 'Gmail', 'default' => true],
            ['name' => 'Outlook (Free)', 'default' => false],
            ['name' => 'Zoho (Free)', 'default' => false]
        ];

        foreach ($providers as $provider) {
            Provider::firstOrCreate(
                [
                    'name' => $provider['name']
                ],
                [
                    'default' => $provider['default']
                ]
            );
        }
    }
}
