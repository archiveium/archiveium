<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/accounts/add/$types';
	import {
		Card,
		Checkbox,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Button
	} from 'flowbite-svelte';

	export let form: ActionData;
</script>

<Card class="py-8 px-4 mx-auto max-w-2xl mt-4">
	{#if form?.remoteFolders}
		<form method="post" use:enhance>
			<Table>
				<TableHead>
					<TableHeadCell class="!p-4">
						<!-- TODO Add select all capability -->
						<!-- <Checkbox /> -->
					</TableHeadCell>
					<TableHeadCell>Folder Name</TableHeadCell>
					<TableHeadCell>Email Count</TableHeadCell>
				</TableHead>
				<TableBody tableBodyClass="divide-y">
					{#each form.remoteFolders as remoteFolder}
						<TableBodyRow>
							<TableBodyCell class="!p-4">
								<Checkbox name="folders" value={remoteFolder.name} checked={remoteFolder.syncing} />
							</TableBodyCell>
							<TableBodyCell>{remoteFolder.name}</TableBodyCell>
							<TableBodyCell>{remoteFolder.status_messages}</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
			<input name="email" value={form?.email} hidden />
			<Button type="submit" name="step" value="addAccountStep2" class="w-full mt-6">
				Add Account
			</Button>
		</form>
	{:else}
		<p>No folders found</p>
	{/if}
</Card>
