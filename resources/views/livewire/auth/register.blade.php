<div class="page page-center">
    <div class="container-tight py-4">
        <div class="text-center mb-4">
            <span class="bg-blue text-white avatar">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-flare" width="24"
                     height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                     stroke-linecap="round" stroke-linejoin="round">
                   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                   <circle cx="12" cy="12" r="2"></circle>
                   <path d="M3 12h4m5 -9v4m5 5h4m-9 5v4m-4.5 -13.5l1 1m8 -1l-1 1m0 7l1 1m-8 -1l-1 1"></path>
                </svg>
            </span>
        </div>

        <form class="card card-md" wire:submit.prevent="register">
            @csrf
            <x-honeypot wire:model="extraFields" />

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Register new account</h2>
                <div class="mb-3">
                    <label class="form-label">Name</label>
                    <input type="text" wire:model="name" class="form-control @error('name') is-invalid @enderror" placeholder="Enter your name">
                    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="email" wire:model="email" class="form-control @error('email') is-invalid @enderror" placeholder="Enter your email address">
                    @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <div class="form-group mb-3">
                        <input type="password" wire:model="password" class="form-control @error('password') is-invalid @enderror" autocomplete="off" placeholder="Your password">
                        @error('password') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Confirm Password</label>
                    <div class="input-group input-group-flat">
                        <input type="password" wire:model="password_confirmation" class="form-control" autocomplete="off" placeholder="Re-enter your password">
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
