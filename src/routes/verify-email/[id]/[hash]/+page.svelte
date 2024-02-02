<script lang="ts">
	import logo from '$lib/images/logo.svg';
	import { enhance } from '$app/forms';
	import { Card, Button, A, P } from 'flowbite-svelte';
</script>

<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
	<a href="/login" class="flex items-center mb-6">
		<img src={logo} alt="" class="mr-2 h-25" />
	</a>

	<Card class="w-full">
		<P class="mb-4">
			Unfortunately your email verification url has expired. Use the button below to resend email.
		</P>
		<form method="post" class="flex flex-col space-y-6" autocomplete="off" use:enhance>
			<Button type="submit" class="w-full">Resend Verification Email</Button>
			<div class="text-sm font-medium text-gray-500 dark:text-gray-300">
				Already have an account? <A href="/login">Login</A>
			</div>
		</form>
	</Card>
</div>
