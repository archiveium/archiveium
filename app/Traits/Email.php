<?php

namespace App\Traits;

trait Email
{
    /**
     * @return string
     */
    public function getTextHeader(): string
    {
        return $this->asString(
            [
                'category' => config('app.name'),
            ]
        );
    }

    /**
     * @param array $data
     * @return array|string|string[]|null
     */
    private function asJSON(array $data)
    {
        $json = json_encode($data);

        return preg_replace('/(["\]}])([,:])(["\[{])/', '$1$2 $3', $json);
    }

    /**
     * @param array $data
     * @return string
     */
    private function asString(array $data): string
    {
        $json = $this->asJSON($data);

        return wordwrap($json, 76, "\n   ");
    }
}
