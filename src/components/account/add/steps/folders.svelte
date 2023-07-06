<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/accounts/add/$types';

	export let form: ActionData;
</script>

<div class="page-body">
	<div class="container-xl">
		<form method="post" class="card" use:enhance>
			<div class="card-header">
				<h3 class="card-title">Folders</h3>
				<div class="card-actions">
					<ol class="breadcrumb breadcrumb-arrows">
						<li class="breadcrumb-item disabled"><a href=".">Credentials</a></li>
						<li class="breadcrumb-item"><a href=".">Folders</a></li>
					</ol>
				</div>
			</div>
			<div class="table-responsive">
				{#if form?.remoteFolders}
					<table class="table card-table text-nowrap datatable">
						<thead>
							<tr>
								<th />
								<th>Name</th>
								<th>Email Count</th>
							</tr>
						</thead>
						<tbody>
							{#each form.remoteFolders as remoteFolder}
								<tr>
									<td>
										<input
											class="form-check-input m-0 align-middle"
											type="checkbox"
											name="folders"
											value={remoteFolder.name}
											aria-label="Select folder"
										/>
									</td>
									<td>{remoteFolder.name}</td>
									<td><span class="text-muted">{remoteFolder.status_messages}</span></td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p>No folders found</p>
				{/if}
			</div>
			{#if form?.remoteFolders}
				<div class="card-footer text-end">
					<div class="d-flex">
						<input name="email" value={form?.email} hidden />
						<button
							type="submit"
							name="step"
							value="addAccountStep2"
							class="btn btn-primary ms-auto">Add Account</button
						>
					</div>
				</div>
			{/if}
		</form>
	</div>
</div>
