<div class="page page-center">
    <div class="container-tight py-4">
        <div class="text-center mb-4">
            @include('components.logo_small')
        </div>

        <form class="card card-md" wire:submit.prevent="register">
            @csrf
            <x-honeypot wire:model="extraFields" />

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Register new account</h2>
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input type="text" wire:model.defer="name" class="form-control @error('name') is-invalid @enderror" placeholder="Enter your name">
                    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="email" wire:model.defer="email" class="form-control @error('email') is-invalid @enderror" placeholder="Enter your email address">
                    @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <div class="form-group mb-3">
                        <input type="password" wire:model.defer="password" class="form-control @error('password') is-invalid @enderror" autocomplete="off" placeholder="Your password">
                        @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Confirm Password</label>
                    <div class="input-group input-group-flat">
                        <input type="password" wire:model.defer="password_confirmation" class="form-control" autocomplete="off" placeholder="Re-enter your password">
                    </div>
                </div>
                <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100">Register</button>
                </div>
            </div>
        </form>
        <div class="text-center text-muted mt-3">
            Already have account? <a href="{{ route('login') }}" tabindex="-1">Sign in</a>
        </div>
    </div>
</div>
