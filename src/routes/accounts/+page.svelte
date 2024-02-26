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
		A,
		Alert,
		Pagination,
		Checkbox
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
		<section class="bg-gray-50 dark:bg-gray-900 flex items-center">
			<div class="mx-auto w-full">
				<div class="relative bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
					<div class="flex flex-wrap items-center justify-between p-2 space-y-2">
						<div class="flex justify-start items-center">
							<Button color="alternative" size="sm" class="mr-2">
								Accounts
								<svg
									class="w-6 h-6 text-gray-800 dark:text-white"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="m8 10 4 4 4-4"
									/>
								</svg>
							</Button>
							<Dropdown placement="bottom-start" class="w-full overflow-y-auto py-1 h-48">
								{#each value.accounts.all as account}
									<DropdownItem href={`?accountId=${account.id}`} class="px-2">
										<Checkbox checked={value.accounts.selected?.id === account.id}>
											{account.email}
										</Checkbox>
									</DropdownItem>
								{/each}
							</Dropdown>
							{#if value.folders.all && value.accounts.selected}
								<Button color="alternative" size="sm" class="mr-2">
									Folders
									<svg
										class="w-6 h-6 text-gray-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="m8 10 4 4 4-4"
										/>
									</svg>
								</Button>
								<Dropdown placement="bottom-start" class="w-48 overflow-y-auto py-1 h-48">
									{#each value.folders.all as folder}
										<DropdownItem
											href={`?accountId=${value.accounts.selected.id}&folderId=${folder.id}`}
											class="flex items-center"
										>
											<Checkbox checked={folder.id === value.folders?.selected?.id}>
												{folder.name}
											</Checkbox>
										</DropdownItem>
									{/each}
								</Dropdown>
							{/if}
						</div>
						<div class="flex items-center lg:order-2">
							<!-- TODO Reintroduce when search is integrated -->
							<!-- <form class="flex items-center">
								<label for="simple-search" class="sr-only">Search</label>
								<div class="relative w-full">
									<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
									<svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
										<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
									</svg>
									</div>
									<input type="text" id="simple-search" class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search">
								</div>
							</form> -->
							{#if value.accounts.selected}
								<svg
									class="w-6 h-6 text-gray-800 dark:text-white"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-width="2"
										d="M12 6h0m0 6h0m0 6h0"
									/>
								</svg>
								<Dropdown placement="bottom-start" class="w-36">
									<DropdownItem href="/accounts/edit/{value.accounts.selected.id}">
										Edit
									</DropdownItem>
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
							{/if}
						</div>
					</div>

					<Table shadow divClass="overflow-x-auto">
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
									<TableBodyCell tdClass="px-6 py-3 whitespace-nowrap font-medium text-ellipsis">
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
				</div>
			</div>
		</section>

		<div class="flex justify-center items-center mt-2">
			<Pagination large pages={value.paginator.pages}>
				<svelte:fragment slot="prev">
					<A href={value.paginator.previousLink.href} color="">
						<span class="sr-only">Previous</span>
						<svg
							class="w-6 h-6 text-gray-800 dark:text-white"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m14 8-4 4 4 4"
							/>
						</svg>
					</A>
				</svelte:fragment>
				<svelte:fragment slot="next">
					<A href={value.paginator.nextLink.href} color="">
						<span class="sr-only">Next</span>
						<svg
							class="w-6 h-6 text-gray-800 dark:text-white"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m10 16 4-4-4-4"
							/>
						</svg>
					</A>
				</svelte:fragment>
			</Pagination>
		</div>
	{:else}
		No Accounts found
	{/if}
{/await}
