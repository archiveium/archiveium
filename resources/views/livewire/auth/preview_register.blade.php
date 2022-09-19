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

        <form class="card card-md" wire:submit.prevent="register">
            @csrf
            <x-honeypot wire:model="extraFields" />

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Closed Preview Enrollment</h2>
                <p class="card-subtitle">
                    After you have submitted email address, an email will be sent once we are ready to register your account.
                </p>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="email" wire:model.lazy="email" class="form-control @error('email') is-invalid @enderror" placeholder="Enter your email address">
                    @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100">Enroll Me</button>
                </div>
            </div>
        </form>
        <div class="text-center text-muted mt-3">
            Already have account? <a href="{{ route('login') }}" tabindex="-1">Sign in</a>
        </div>
    </div>
</div>
