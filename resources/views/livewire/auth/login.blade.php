<div class="page page-center">
    <div class="container-tight py-4">
        <div class="text-center mb-4">
            @include('components.logo_small')
        </div>

        @error('error')
        <div class="alert alert-danger" role="alert">
            <div class="text-muted">{{ $message }}</div>
        </div>
        @enderror

        @if(session()->has('error'))
            <div class="alert alert-danger" role="alert">
                <div class="text-muted">{{ session()->get('error') }}</div>
            </div>
        @endif

        @if(session()->has('success'))
            <div class="alert alert-success" role="alert">
                <div class="text-muted">{{ session()->get('success') }}</div>
            </div>
        @endif

        <form class="card card-md" wire:submit.prevent="login" autocomplete="off">
            @csrf
            <x-honeypot wire:model="extraFields" />

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Login</h2>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="email" wire:model.lazy="email" class="form-control @error('email') is-invalid @enderror" placeholder="Enter email">
                    @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-2">
                    <label class="form-label">
                        Password
                        <span class="form-label-description">
                            <a href="{{ route('password.request') }}">I forgot password</a>
                        </span>
                    </label>
                    <div class="mb-3">
                        <input type="password" wire:model.lazy="password" class="form-control @error('password') is-invalid @enderror" placeholder="Password" autocomplete="off">
                        @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                </div>
                {{--                    <div class="mb-2">--}}
                {{--                        <label class="form-check">--}}
                {{--                            <input type="checkbox" class="form-check-input"/>--}}
                {{--                            <span class="form-check-label">Remember me on this device</span>--}}
                {{--                        </label>--}}
                {{--                    </div>--}}
                <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100">Sign in</button>
                </div>
            </div>
        </form>
        <div class="text-center text-muted mt-3">
            Don't have account yet? Enroll in <a href="{{ route('preview.registration') }}" tabindex="-1">closed
                preview</a>
        </div>
    </div>
</div>
