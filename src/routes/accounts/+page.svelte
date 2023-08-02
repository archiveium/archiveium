<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types.js';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Button,
		Dropdown,
		DropdownItem,
		Chevron,
		DropdownDivider,
		MenuButton,
		A,
		Alert,
		Pagination,
		ChevronLeft,
		ChevronRight
	} from 'flowbite-svelte';

	export let data;
	export let form: ActionData;
</script>

<!-- Success alert -->
{#if form?.success}
	<Alert border color="green" class="mb-4">
		{form.success}
	</Alert>
{/if}

<!-- Error alert -->
{#if form?.error}
	<Alert border color="red" class="mb-4">
		{form.error}
	</Alert>
{/if}

{#await data.streamed.data}
	Loading...
{:then value}
	{#if value}
		<div class="flex justify-between items-center mb-4">
			<div>
				<Button class="" size="sm"><Chevron>Accounts</Chevron></Button>
				<Dropdown class="w-48 overflow-y-auto py-1 h-48">
					{#each value.accounts.all as account}
						<DropdownItem href={`?accountId=${account.id}`} class="flex items-center"
							>{account.email}</DropdownItem
						>
					{/each}
				</Dropdown>
				<Button class="" size="sm"><Chevron>Folders</Chevron></Button>
				<Dropdown class="w-48 overflow-y-auto py-1 h-48">
					{#each value.folders.syncing as folder}
						<DropdownItem
							href={`?accountId=${value.accounts.selected.id}&folderId=${folder.id}`}
							class="flex items-center">{folder.name}</DropdownItem
						>
					{/each}
					<DropdownDivider />
					{#each value.folders.notSyncing as folder}
						<DropdownItem class="flex items-center">{folder.name}</DropdownItem>
					{/each}
				</Dropdown>
			</div>
			<div class="flex justify-end">
				<MenuButton vertical />
				<Dropdown class="w-36">
					<DropdownItem href="/accounts/edit/{value.accounts.selected.id}">Edit</DropdownItem>
					<DropdownItem>
						<form method="post" use:enhance>
							<input name="accountId" value={value.accounts.selected.id} hidden readonly />
							{#if value.accounts.selected.syncing}
								<input name="syncing" value="false" hidden readonly />
								<button type="submit">Pause Syncing</button>
							{:else}
								<input name="syncing" value="true" hidden readonly />
								<button type="submit">Resume Syncing</button>
							{/if}
						</form>
					</DropdownItem>
				</Dropdown>
			</div>
		</div>

		<Table shadow divClass="overflow-x-auto shadow-md sm:rounded-lg">
			<TableHead>
				<TableHeadCell>From</TableHeadCell>
				<TableHeadCell>Subject</TableHeadCell>
				<TableHeadCell>Date</TableHeadCell>
				<TableHeadCell />
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each value.emails as email}
					<TableBodyRow>
						<TableBodyCell tdClass="px-6 py-3 whitespace-nowrap font-medium">
							{email.s3Data?.from}
						</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-3 whitespace-nowrap font-medium">
							{email.s3Data?.subject}
						</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-3 whitespace-nowrap font-medium">
							{email.formatted_date}
						</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-3 whitespace-nowrap font-medium">
							<A href={`/email/${email.id}`} target="_blank">View</A>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<div class="flex justify-center items-center mt-2">
			<Pagination large pages={value.paginator.pages}>
				<svelte:fragment slot="prev">
					<A href={value.paginator.previousLink.href} color="">
						<span class="sr-only">Previous</span>
						<ChevronLeft class="w-5 h-5" />
					</A>
				</svelte:fragment>
				<svelte:fragment slot="next">
					<A href={value.paginator.nextLink.href} color="">
						<span class="sr-only">Next</span>
						<ChevronRight class="w-5 h-5" />
					</A>
				</svelte:fragment>
			</Pagination>
		</div>
	{:else}
		No Accounts found
	{/if}
{/await}
