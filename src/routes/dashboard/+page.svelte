<script lang="ts">
	import { A, Alert } from 'flowbite-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- Success alert -->
{#if data.flashMessage}
	<Alert border color="green">
		{data.flashMessage.message}
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
