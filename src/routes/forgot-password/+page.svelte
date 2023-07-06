<script lang="ts">
	import logo from '$lib/images/logo.svg';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<div class="page page-center">
	<div class="container container-tight py-4">
		<div class="text-center mb-4">
			<a href="." class="navbar-brand navbar-brand-autodark">
				<img src={logo} alt="" height="100" />
			</a>
		</div>

		<!-- Error alert -->
		{#if form?.error}
			<div class="alert alert-danger" role="alert">
				<div class="text-muted">{form.error}</div>
			</div>
		{/if}

		<div class="card card-md">
			<div class="card-body">
				<h2 class="h2 text-center mb-4">Password reset request</h2>
				<form method="post" autocomplete="off" use:enhance>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label required">Email</label>
						<input type="email" name="email" class="form-control" autocomplete="off" />
					</div>
					<div class="form-footer">
						<button type="submit" class="btn btn-primary w-100">Reset Password</button>
					</div>
				</form>
			</div>
		</div>
		<div class="text-center text-muted mt-3">
			Remember it already? <a href="/login" tabindex="-1">Sign in</a>
		</div>
	</div>
</div>
