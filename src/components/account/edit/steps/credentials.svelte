<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/accounts/add/$types';
	import type { Account } from '../../../../types/account';
	import type { Provider } from '../../../../types/provider';

	export let data: {
		availableProviders: Provider[];
		defaultProvider: Provider | undefined;
		selectedAccount: Account;
	};
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
				<h4 class="card-title">Edit Account</h4>
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
							class="form-control {form?.fieldErrors?.name ? 'is-invalid' : ''}"
							name="name"
							placeholder="Enter a name for this account"
							value={data.selectedAccount.name}
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.name ?? ''}</div>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label">Email Address</label>
						<input
							type="text"
							class="form-control {form?.fieldErrors?.email ? 'is-invalid' : ''}"
							value={data.selectedAccount.email}
							disabled
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.email ?? ''}</div>
					</div>
					<div class="mb-3">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="form-label">Password</label>
						<input
							type="password"
							class="form-control {form?.fieldErrors?.password ? 'is-invalid' : ''}"
							name="password"
							placeholder="Update application password (leave blank if unchanged)"
						/>
						<div class="invalid-feedback">{form?.fieldErrors?.password ?? ''}</div>
					</div>
					<div class="mb-3">
						<div class="form-label">Providers</div>
						<div>
							{#each data.availableProviders as provider}
								<label class="form-check form-check-inline">
									<input
										class="form-check-input"
										type="radio"
										checked={provider.id == data.selectedAccount.provider_id}
										disabled
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
					<button type="submit" name="step" value="addAccountStep1" class="btn btn-primary me-auto"
						>Next</button>
					<button
						type="button"
						class="btn btn-outline-danger"
						data-bs-toggle="modal"
						data-bs-target="#deleteAccountModal"
					>
						Delete
					</button>
				</div>
			</div>
		</form>
	</div>
</div>

<div class="modal" id="deleteAccountModal" tabindex="-1">
	<div class="modal-dialog modal-sm" role="document">
		<div class="modal-content">
			<div class="modal-status bg-danger" />
			<div class="modal-body text-center py-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="icon mb-2 text-danger icon-lg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<path d="M12 9v2m0 4v.01" />
					<path
						d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"
					/>
				</svg>
				<h3>Sure you want to delete account?</h3>
				<div class="text-muted">
					All your synced emails and folders will be deleted.
					This is an irreversable action. Please make sure you have a backup before proceeding.
				</div>
			</div>
			<div class="modal-footer">
				<div class="w-100">
					<div class="row">
						<div class="col">
							<!-- svelte-ignore a11y-invalid-attribute -->
							<a href="#" class="btn w-100" data-bs-dismiss="modal">Cancel</a>
						</div>
						<div class="col">
							<form method="post" use:enhance>
							<button type="submit" name="step" value="deleteAccount" data-bs-dismiss="modal" class="btn btn-danger w-100">Delete</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
