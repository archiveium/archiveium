<?php

namespace App\Traits;

use Exception;
use Illuminate\Support\Facades\Log;
use Livewire\Component;
use ReflectionProperty;
use Spatie\Honeypot\Exceptions\SpamException;
use Spatie\Honeypot\Http\Livewire\Concerns\HoneypotData;
use Spatie\Honeypot\SpamProtection;

/** @mixin Component */
trait UsesSpamProtection
{
    public function guessHoneypotDataProperty(): ?HoneypotData
    {
        $props = (new \ReflectionClass($this))
            ->getProperties(ReflectionProperty::IS_PUBLIC);

        foreach ($props as $prop) {
            if ($prop->getType()?->getName() === HoneypotData::class) {
                return $prop->getValue($this);
            }
        }

        return null;
    }

    /**
     * @throws Exception
     */
    protected function protectAgainstSpam(): void
    {
        $honeypotData = $this->guessHoneypotDataProperty();

        if (is_null($honeypotData)) {
            throw new Exception("Livewire component requires a `HoneypotData` property.");
        }

        try {
            app(SpamProtection::class)->check($honeypotData->toArray());
        } catch (SpamException) {
            Log::warning(
                'Spam submission',
                [
                    'name' => $this->name ?? '',
                    'email' => $this->email ?? ''
                ]
            );

            redirect(route('login'))
                ->with('error', 'We have detected spam. If you think this is in error, please contact us.');
        }
    }
}
