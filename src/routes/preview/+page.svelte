<script lang="ts">
	import logo from '$lib/images/logo.svg';
	import type { ActionData } from './$types';
	import { Card, Button, Label, Input, A, Heading, Alert, P } from 'flowbite-svelte';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
	<a href="/login" class="flex items-center mb-6">
		<img src={logo} alt="" class="mr-2 h-25" />
	</a>
	<div class="items-center justify-center mb-4">
		<Heading tag="h4">Closed Preview</Heading>
	</div>

	<!-- Error alert -->
	{#if form?.error}
		<Alert border color="red" class="mb-4">
			{form.error}
		</Alert>
	{/if}

	<Card class="w-full">
		<P class="mb-4" weight="light" color="text-gray-500 dark:text-gray-400" size="sm">
			After you have submitted email address, an email will be sent once we are ready to
			register your account.
		</P>		
		<form method="post" class="flex flex-col space-y-6" autocomplete="off" use:enhance>
			<Label class="space-y-2">
				<span>Email</span>
				<Input type="email" name="email" required />
			</Label>
			<Button type="submit" class="w-full">Enroll</Button>
			<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
				Already have an account? <A href="/login">Login</A>
			</div>
		</form>
	</Card>
</div>
