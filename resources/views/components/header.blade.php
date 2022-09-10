<header class="navbar navbar-expand-md navbar-light d-print-none">
    <div class="container-xl">
        @include('components.logo_header')
        <div class="navbar-nav flex-row order-md-last">
            <div class="d-none d-md-flex">
{{--                <a href="?theme=dark" class="nav-link px-0 hide-theme-dark" title="" data-bs-toggle="tooltip"--}}
{{--                   data-bs-placement="bottom" data-bs-original-title="Enable dark mode">--}}
{{--                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24"--}}
{{--                         stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"--}}
{{--                         stroke-linejoin="round">--}}
{{--                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>--}}
{{--                        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>--}}
{{--                    </svg>--}}
{{--                </a>--}}
                <a href="?theme=light" class="nav-link px-0 hide-theme-light" title="" data-bs-toggle="tooltip"
                   data-bs-placement="bottom" data-bs-original-title="Enable light mode">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24"
                         stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                         stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <circle cx="12" cy="12" r="4"></circle>
                        <path
                            d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"></path>
                    </svg>
                </a>
            </div>
            <div class="nav-item dropdown">
                <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown"
                   aria-label="Open user menu" aria-expanded="false">
                    <span class="avatar avatar-rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user" width="24"
                             height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                             stroke-linecap="round" stroke-linejoin="round">
                           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                           <circle cx="12" cy="7" r="4"></circle>
                           <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                        </svg>
                    </span>
                    <div class="d-none d-xl-block ps-2">
                        <div>{{ $user->name }}</div>
                    </div>
                </a>
                @livewire('auth.logout')
            </div>
        </div>
    </div>
</header>
