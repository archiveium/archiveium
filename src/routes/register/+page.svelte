<script lang="ts">
	import logo from '$lib/images/logo.svg';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="page page-center">
	<div class="container container-tight py-4">
		<div class="text-center mb-4">
			<a href="." class="navbar-brand navbar-brand-autodark">
				<img src={logo} alt="" height="100" />
			</a>
		</div>

		<!-- Success alert -->
		{#if data.flashMessage}
			<div class="alert alert-success" role="alert">
				<div class="text-muted">{data.flashMessage.message}</div>
			</div>
		{/if}

		<!-- Error alert -->
		{#if form?.error}
			<div class="alert alert-danger" role="alert">
				<div class="text-muted">{form.error}</div>
			</div>
		{/if}

		<div class="card card-md">
			<div class="card-body">
				<h2 class="h2 text-center mb-4">Register Account</h2>
				<form method="post" autocomplete="off" use:enhance>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label required">Name</label>
						<input
							type="text"
							name="name"
							class="form-control {form?.fieldErrors?.name ? 'is-invalid' : ''}"
							autocomplete="off"
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.name ?? ''}</div>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label required">Email Address</label>
						<input
							type="email"
							name="email"
							class="form-control {form?.fieldErrors?.email ? 'is-invalid' : ''}"
							autocomplete="off"
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.email ?? ''}</div>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label required">Password</label>
						<input
							type="password"
							name="password"
							class="form-control {form?.fieldErrors?.password ? 'is-invalid' : ''}"
							autocomplete="off"
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.password ?? ''}</div>
					</div>
					<div class="mb-2">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label required">Confirm Password</label>
						<input
							type="password"
							name="passwordConfirm"
							class="form-control {form?.fieldErrors?.passwordConfirm ? 'is-invalid' : ''}"
							autocomplete="off"
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.passwordConfirm ?? ''}</div>
					</div>
					<div class="form-footer">
						<button type="submit" class="btn btn-primary w-100">Register</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
