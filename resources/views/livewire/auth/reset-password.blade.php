<div class="page page-center">
    <div class="container-tight py-4">
        <div class="text-center mb-4">
            @include('components.logo_small')
        </div>

        @error('error')
        <div class="alert alert-danger" role="alert">
            <div class="text-muted">{!! $message !!}</div>
        </div>
        @enderror

        <form class="card card-md" wire:submit.prevent="resetPassword()">
            @csrf
            <x-honeypot wire:model="extraFields" />

            <input type="hidden" wire:model="token" value="{{ $token }}">

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Reset Password</h2>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="text" class="form-control" wire:model="email" disabled>
                </div>
                <div class="mb-3">
                    <label class="form-label">New Password</label>
                    <div class="form-group mb-3">
                        <input type="password" wire:model.defer="password" class="form-control @error('password') is-invalid @enderror" autocomplete="off" placeholder="Your new password">
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
                    <button type="submit" class="btn btn-primary w-100">Reset Password</button>
                </div>
            </div>
        </form>
    </div>
</div>
