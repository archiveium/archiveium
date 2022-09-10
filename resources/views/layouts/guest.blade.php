<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name') }}</title>

        @livewireStyles()
        <link href="{{ asset('css/tabler.min.css') }}" rel="stylesheet"/>
    </head>

    <body class="theme-light">
        <div class="page">
            <div class="page-wrapper">
                {{ $slot }}
            </div>
        </div>

        <script src="{{ asset('js/tabler.min.js') }}" defer></script>
        @livewireScripts()
    </body>
</html>
