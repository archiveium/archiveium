<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/accounts/add/$types';
	import type { Provider } from '../../../../types/provider';

	export let data: { availableProviders: Provider[]; defaultProvider: Provider | undefined };
	export let form: ActionData;
</script>

<div class="page-body">
	<div class="container-xl">

		<!-- Error alert -->
		{#if form?.error}
			<div class="alert alert-danger" role="alert">
				<div class="text-muted">{form.error}</div>
			</div>
		{/if}

		<form method="post" class="card" use:enhance>
			<div class="card-header">
				<h4 class="card-title">Add Account</h4>
				<div class="card-actions">
					<ol class="breadcrumb breadcrumb-arrows">
						<li class="breadcrumb-item"><a href=".">Credentials</a></li>
						<li class="breadcrumb-item disabled"><a href=".">Folders</a></li>
					</ol>
				</div>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label">Name</label>
						<input
							type="text"
							class="form-control { form?.fieldErrors?.name ? 'is-invalid' : '' }"
							name="name"
							placeholder="Enter a name for this account"
						/>
						<div class="invalid-feedback">{ form?.fieldErrors?.name ?? '' }</div>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label">Email Address</label>
						<input
							type="text"
							class="form-control { form?.fieldErrors?.email ? 'is-invalid' : '' }"
							name="email"
							placeholder="Enter email address"
						/>
						<div class="invalid-feedback">{ form?.fieldErrors?.email ?? '' }</div>						
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label">Password</label>
						<input
							type="password"
							class="form-control { form?.fieldErrors?.password ? 'is-invalid' : '' }"
							name="password"
							placeholder="Enter application password (not the password used for logging in)"
						/>
						<div class="invalid-feedback">{ form?.fieldErrors?.password ?? '' }</div>
					</div>
					<div class="mb-3">
						<div class="form-label">Providers</div>
						<div>
							{#each data.availableProviders as provider}
								<label class="form-check form-check-inline">
									<input
										class="form-check-input"
										type="radio"
										name="provider_id"
										value={provider.id}
										checked={provider.is_default}
									/>
									<span class="form-check-label">{provider.name}</span>
								</label>
							{/each}
						</div>
					</div>
				</div>
			</div>
			<div class="card-footer text-end">
				<div class="d-flex">
					<button type="submit" name="step" value="addAccountStep1" class="btn btn-primary ms-auto">Next</button>
				</div>
			</div>
		</form>
	</div>
</div>
