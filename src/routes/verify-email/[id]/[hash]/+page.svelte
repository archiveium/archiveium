<script lang="ts">
	import logo from '$lib/images/logo.svg';
	import { enhance } from '$app/forms';
</script>

<div class="page page-center">
	<div class="container container-tight py-4">
		<div class="text-center mb-4">
			<a href="." class="navbar-brand navbar-brand-autodark">
				<img src={logo} alt="" height="100" />
			</a>
		</div>

		<div class="card card-md">
			<div class="card-body">
				<h2 class="h2 text-center mb-4">Thank you for signing up!</h2>
				<p>
					Unfortunately your email verification url has expired. Use the button below to resend
					email.
				</p>
				<form method="post" autocomplete="off" use:enhance>
					<div class="form-footer">
						<button type="submit" class="btn btn-primary w-100">Resend Verification Email</button>
					</div>
				</form>
			</div>
		</div>
		<div class="text-center text-muted mt-3">
			Already have an account? <a href="/login" tabindex="-1">Sign In</a>
		</div>
	</div>
</div>
