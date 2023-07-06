<script lang="ts">
	import { IconPlayerPause, IconPlayerPlay, IconPencil } from '@tabler/icons-svelte';
	import Header from '../../components/header.svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types.js';
	import Paginator from '../../components/paginator.svelte';

	export let data;
	export let form: ActionData;
</script>

<Header />

<div class="page-body">
	<div class="container-xl">

		<!-- Error alert -->
		{#if form?.error}
			<div class="alert alert-danger" role="alert">
				<div class="text-muted">{form.error}</div>
			</div>
		{/if}

		<!-- Success alert -->
		{#if form?.success}
			<div class="alert alert-success" role="alert">
				<div class="text-muted">{form.success}</div>
			</div>
		{/if}

		<div class="card">
			{#await data.streamed.data}
				Loading...
			{:then value}
				<div class="card-header">
					<div>
						<div class="row align-items-center">
							<div class="col">
								<div class="card-title">
									<div class="dropdown">
										Folder
										<!-- svelte-ignore a11y-invalid-attribute -->
										<a href="#" class="dropdown-toggle" data-bs-toggle="dropdown">
											{value.folders.selected.name}
										</a>
										<div class="dropdown-menu">
											<h6 class="dropdown-header">Syncing</h6>
											{#each value.folders.syncing as folder}
												<a
													class="dropdown-item"
													href={`?accountId=${value.accounts.selected.id}&folderId=${folder.id}`}
												>
													{folder.name}
												</a>
											{/each}
											<div class="dropdown-divider" />
											<h6 class="dropdown-header">Not Syncing</h6>
											{#each value.folders.notSyncing as folder}
												<a
													class="dropdown-item"
													href={`?accountId=${value.accounts.selected.id}&folderId=${folder.id}`}
												>
													{folder.name}
												</a>
											{/each}
										</div>
										in
										<!-- svelte-ignore a11y-invalid-attribute -->
										<a href="#" class="dropdown-toggle" data-bs-toggle="dropdown">
											{value.accounts.selected.email}
										</a>
										<div class="dropdown-menu">
											{#each value.accounts.all as account}
												<a href={`?accountId=${account.id}`} class="dropdown-item">
													{account.email}
												</a>
											{/each}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<form method="post" use:enhance class="card-actions">
						<a href="/accounts/edit/{value.accounts.selected.id}" class="btn btn-icon btn-primary">
							<IconPencil size={16} />
						</a>
						<!-- TODO: Hacky, figure out a better approach -->
						<input name="accountId" value={value.accounts.selected.id} hidden readonly />
						{#if value.accounts.selected.syncing}
							<input name="syncing" value="false" hidden readonly />
							<button type="submit" class="btn btn-icon btn-yellow">
								<IconPlayerPause size={16} />
							</button>
						{:else}
							<input name="syncing" value="true" hidden readonly />
							<button type="submit" class="btn btn-icon btn-green">
								<IconPlayerPlay size={16} />
							</button>
						{/if}
					</form>
				</div>
				<div class="table-responsive">
					<table class="table table-vcenter card-table">
						<thead>
							<tr>
								<th>From</th>
								<th>Subject</th>
								<th>Date</th>
								<th class="w-1" />
							</tr>
						</thead>
						<tbody>
							{#each value.emails as email}
								<tr>
									<td>{email.s3Data?.from}</td>
									<td>{email.s3Data?.subject}</td>
									<td class="text-muted">{email.formatted_date}</td>
									<td>
										<a href={`/email/${email.id}`} target="_blank">View</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<Paginator paginator={value.paginator} />
			{/await}
		</div>
	</div>
</div>
