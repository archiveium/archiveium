<div class="page page-center">
    <div class="container-tight py-4">
        @if (session()->has('success'))
            <div class="alert alert-success" role="alert">
                <div class="text-muted">
                    {{ session('success') }}
                </div>
            </div>
        @endif

        @error('error')
        <div class="alert alert-danger" role="alert">
            <div class="text-muted">{{ $message }}</div>
        </div>
        @enderror

        <form class="card card-md" wire:submit.prevent="sendVerification()">
            @csrf

            <div class="card-body">
                <h2 class="card-title text-center mb-4">Thank you for signing up!</h2>
                <p>Before getting started, could you verify your email address by clicking on the link we just
                    emailed to you?</p>
                <p>If you didn't receive the email, we will gladly send you another.</p>
                <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100">Resend Verification Email</button>
                </div>
            </div>
        </form>

        @livewire('auth.logout', ['view' => 'guest'])

    </div>
</div>
