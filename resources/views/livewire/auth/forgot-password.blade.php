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

        <form class="card card-md" wire:submit.prevent="triggerPasswordReset()">
            @csrf
            <x-honeypot wire:model="extraFields" />

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Forgot your password?</h2>
                <p class="card-subtitle">
                    Just let us know your email address and we will email you a password reset link.
                </p>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="email" wire:model="email" class="form-control @error('email') is-invalid @enderror" placeholder="Enter your email address">
                    @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100">Email Password Reset Link</button>
                </div>
            </div>
        </form>
        <div class="text-center text-muted mt-3">
            Remember is already? <a href="{{ route('login') }}" tabindex="-1">Sign in</a>
        </div>
    </div>
</div>
