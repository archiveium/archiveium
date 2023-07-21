<script lang="ts">
	import { A, Alert } from 'flowbite-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- Success alert -->
{#if data.flashMessage}
	<Alert border color="green">
		<svg
			slot="icon"
			aria-hidden="true"
			class="w-5 h-5"
			fill="currentColor"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
				clip-rule="evenodd"
			/></svg
		>
		<span class="font-medium">Success alert!</span> Change a few things up and try submitting again.
	</Alert>
{/if}

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 mt-4">
	<div class="flex flex-col items-center justify-center">
		{#await data.streamed.accounts.added}
			Loading...
		{:then value}
			<A class="hover:underline" href="/accounts">
				<dt class="mb-2 text-3xl md:text-4xl font-extrabold">{value}</dt>
			</A>
		{/await}
		<dd class="font-light text-gray-500 dark:text-gray-400">accounts</dd>
	</div>
	<div class="flex flex-col items-center justify-center">
		<dt class="mb-2 text-3xl md:text-4xl font-extrabold">
			{#await data.streamed.accounts.syncing}
				Loading...
			{:then value}
				{value}
			{/await}
		</dt>
		<dd class="font-light text-gray-500 dark:text-gray-400">syncing</dd>
	</div>
	<div class="flex flex-col items-center justify-center">
		<dt class="mb-2 text-3xl md:text-4xl font-extrabold">
			{#await data.streamed.emails.processed}
				Loading...
			{:then value}
				{value}
			{/await}
		</dt>
		<dd class="font-light text-gray-500 dark:text-gray-400">saved emails</dd>
	</div>
	<div class="flex flex-col items-center justify-center">
		<dt class="mb-2 text-3xl md:text-4xl font-extrabold">
			{#await data.streamed.emails.failure}
				Loading...
			{:then value}
				{value}
			{/await}
		</dt>
		<dd class="font-light text-gray-500 dark:text-gray-400">failures</dd>
	</div>
	<div class="flex flex-col items-center justify-center">
		<dt class="mb-2 text-3xl md:text-4xl font-extrabold">
			{#await data.streamed.emails.processed}
				Loading...
			{:then value}
				{((value / data.streamed.emails.quota) * 100).toFixed(2) + ' %'}
			{/await}
		</dt>
		<dd class="font-light text-gray-500 dark:text-gray-400">quota used</dd>
	</div>
</div>
