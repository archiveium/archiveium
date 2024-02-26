<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/accounts/add/$types';
	import type { Account } from '../../../../types/account';
	import type { Provider } from '../../../../types/provider';
	import {
		Card,
		Dropdown,
		DropdownItem,
		Button,
		Label,
		Input,
		Radio,
		Modal,
		Alert,
		Helper
	} from 'flowbite-svelte';

	export let data: {
		availableProviders: Provider[];
		defaultProvider: Provider | undefined;
		selectedAccount: Account;
	};
	export let form: ActionData;

	let popupModal = false;
</script>

<!-- Error alert -->
{#if form?.error}
	<Alert border color="red" class="mb-4 mt-4">
		{form.error}
	</Alert>
{/if}

<Card class="py-8 px-4 mx-auto max-w-2xl mt-4">
	<div class="flex justify-end">
		<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 6h0m0 6h0m0 6h0"/>
		</svg>
		<Dropdown class="w-36">
			<DropdownItem on:click={() => (popupModal = true)}>Delete</DropdownItem>
		</Dropdown>
	</div>
	<form method="post" use:enhance>
		<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
			<div class="sm:col-span-2">
				<Label for="name" class="mb-2">Name</Label>
				<Input
					type="text"
					name="name"
					placeholder="Enter a name for this account"
					value={data.selectedAccount.name}
					required
				/>
				{#if form?.fieldErrors?.name}
					<Helper color="red">{form?.fieldErrors?.name}</Helper>
				{/if}
			</div>
			<div class="sm:col-span-2">
				<Label for="email" class="mb-2">Email Address</Label>
				<Input type="email" id="email" value={data.selectedAccount.email} disabled />
			</div>
			<div class="sm:col-span-2">
				<Label for="password" class="mb-2">Password</Label>
				<Input
					type="password"
					name="password"
					placeholder="Update password (leave blank if unchanged)"
				/>
				{#if form?.fieldErrors?.password}
					<Helper color="red">{form?.fieldErrors?.password}</Helper>
				{/if}
			</div>
			<div class="sm:col-span-2">
				<!-- TODO Disable label similar to email field -->
				<Label for="providers" class="mb-2">Providers</Label>
				<div class="flex gap-3">
					{#each data.availableProviders as provider}
						<Radio group={data.defaultProvider?.name} value={provider.name} disabled>
							{provider.name}
						</Radio>
					{/each}
				</div>
			</div>
		</div>
		<Button type="submit" name="step" value="addAccountStep1" class="w-full mt-6">Next</Button>
	</form>
</Card>

<Modal bind:open={popupModal} size="xs" outsideclose>
	<div class="text-center">
		<svg
			aria-hidden="true"
			class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/></svg
		>
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			Sure you want to delete account?
		</h3>
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 mb-4">
			All your synced emails and folders will be deleted. This is an irreversable action. Please
			make sure you have a backup before proceeding.
		</p>
		<form method="post" use:enhance>
			<Button color="alternative" type="submit" name="step" value="deleteAccount"
				>Yes, I'm Sure</Button
			>
		</form>
	</div>
</Modal>
