<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../../../routes/accounts/add/$types';
	import type { Provider } from '../../../../types/provider';
	import { Card, Button, Label, Input, Radio, Alert, Helper } from 'flowbite-svelte';

	export let data: { availableProviders: Provider[]; defaultProvider: Provider | undefined };
	export let form: ActionData;
</script>

<!-- Error alert -->
{#if form?.error}
	<Alert border color="red" class="mb-4 mt-4">
		{form.error}
	</Alert>
{/if}

<Card class="py-8 px-4 mx-auto max-w-2xl mt-4">
	<form method="post" use:enhance>
		<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
			<div class="sm:col-span-2">
				<Label for="name" class="mb-2">Name</Label>
				<Input
					color={form?.fieldErrors?.name ? 'red' : undefined}
					type="text"
					name="name"
					placeholder="Enter a name for this account"
					required
				/>
				{#if form?.fieldErrors?.name}
					<Helper color="red">{form?.fieldErrors?.name}</Helper>
				{/if}
			</div>
			<div class="sm:col-span-2">
				<Label for="email" class="mb-2">Email Address</Label>
				<Input
					color={form?.fieldErrors?.email ? 'red' : undefined}
					type="email"
					name="email"
					placeholder="Enter email address"
					required
				/>
				{#if form?.fieldErrors?.email}
					<Helper color="red">{form?.fieldErrors?.email}</Helper>
				{/if}
			</div>
			<div class="sm:col-span-2">
				<Label for="password" class="mb-2">Password</Label>
				<Input
					color={form?.fieldErrors?.password ? 'red' : undefined}
					type="password"
					name="password"
					placeholder="Enter application password (not the password used for logging in)"
				/>
				{#if form?.fieldErrors?.password}
					<Helper color="red">{form?.fieldErrors?.password}</Helper>
				{/if}
			</div>
			<div class="sm:col-span-2">
				<Label for="providers" class="mb-2">Providers</Label>
				<div class="flex gap-3">
					{#each data.availableProviders as provider}
						<Radio
							name="provider_id"
							value={provider.id}
							group={provider.is_default ? provider.id : ''}
						>
							{provider.name}
						</Radio>
					{/each}
				</div>
			</div>
		</div>
		<Button type="submit" name="step" value="addAccountStep1" class="w-full mt-6">Next</Button>
	</form>
</Card>
