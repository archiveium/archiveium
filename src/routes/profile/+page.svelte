<script lang="ts">
	import { Alert, Card, Button, Heading, Label, Input, Helper } from 'flowbite-svelte';
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<Heading tag="h1" class="mb-4 text-xl font-semibold sm:text-2xl">Profile</Heading>

<!-- Form Message -->
{#if form?.formMessage}
	<Alert border color={form.formMessage.type === 'error' ? 'red' : 'green'} class="mb-4">
		{form.formMessage.message}
	</Alert>
{/if}

<div class="grid">
	<Card class="max-w-none">
		<div class="flex justify-between items-center mb-4">
			<Heading class="text-xl font-medium">Reset Password</Heading>
		</div>
		<form method="post" use:enhance>
			<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
				<div class="sm:col-span-2">
					<Label for="currentPassword" class="mb-2">Current Password</Label>
					<Input type="password" name="currentPassword" required />
					{#if form?.fieldErrors?.currentPassword}
						<Helper color="red">{form?.fieldErrors?.currentPassword}</Helper>
					{/if}
				</div>
				<div class="sm:col-span-2">
					<Label for="password" class="mb-2">New Password</Label>
					<Input type="password" name="password" required />
					{#if form?.fieldErrors?.password}
						<Helper color="red">{form?.fieldErrors?.password}</Helper>
					{/if}
				</div>
				<div class="sm:col-span-2">
					<Label for="passwordConfirm" class="mb-2">Confirm New Password</Label>
					<Input type="password" name="passwordConfirm" required />
					{#if form?.fieldErrors?.passwordConfirm}
						<Helper color="red">{form?.fieldErrors?.passwordConfirm}</Helper>
					{/if}
				</div>
			</div>
			<Button type="submit" name="buttonProfileUpdate" value="password" class="mt-6">Save</Button>
		</form>
	</Card>
</div>
