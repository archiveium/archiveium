<script lang="ts">
	import logo from '$lib/images/logo.svg';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Card, Button, Label, Input, A, Heading, Alert, Helper } from 'flowbite-svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
	<a href="/login" class="flex items-center mb-6">
		<img src={logo} alt="" class="mr-2 h-25" />
	</a>
	<div class="items-center justify-center mb-4">
		<Heading tag="h4">Reset Password</Heading>
	</div>

	<!-- Success alert -->
	{#if data.flashMessage}
		<Alert border color="green" class="mb-4">
			{data.flashMessage.message}
		</Alert>
	{/if}

	<!-- Error alert -->
	{#if form?.error}
		<Alert border color="red" class="mb-4">
			{form.error}
		</Alert>
	{/if}

	<Card class="w-full">
		<form method="post" class="flex flex-col space-y-6" autocomplete="off" use:enhance>
			<Label class="space-y-2">
				<span>New Password</span>
				<Input type="password" name="password" required />
				{#if form?.fieldErrors?.password}
					<Helper color="red">{form?.fieldErrors?.password}</Helper>
				{/if}
			</Label>
			<Label class="space-y-2">
				<span>Confirm Password</span>
				<Input type="password" name="passwordConfirm" required />
				{#if form?.fieldErrors?.passwordConfirm}
					<Helper color="red">{form?.fieldErrors?.passwordConfirm}</Helper>
				{/if}
			</Label>
			<Button type="submit" class="w-full">Update</Button>
			<input type="hidden" name="token" value={data.token} />
			<input type="hidden" name="email" value={data.email} />
			<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
				Remember it already? <A href="/login">Login</A>
			</div>
		</form>
	</Card>
</div>
