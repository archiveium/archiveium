<script lang="ts">
	import { A, Alert, Card, Button, List, Li } from 'flowbite-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- Success alert -->
{#if data.flashMessage}
	<Alert border color={data.flashMessage.type === 'error' ? 'red' : 'green'} class="mb-4">
		{data.flashMessage.message}
	</Alert>
{/if}

<div class="grid grid-cols-2 gap-6">
	<Card class="max-w-none">
		<div class="flex justify-between items-center mb-4">
			<h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Overview</h5>
		</div>
		<List tag="ul" list="none" class="max-w-none divide-y divide-gray-200 dark:divide-gray-700">
			<Li class="pb-3 sm:pb-4 pt-2">
				<div class="flex items-center space-x-4">
					<A href="/accounts" aClass="inline-flex w-full hover:underline">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium truncate text-primary-600 dark:text-primary-500">
								Accounts
							</p>
						</div>
						<div
							class="inline-flex items-center text-base font-semibold text-primary-600 dark:text-primary-500"
						>
							{#await data.streamed.accounts.added}
								Loading...
							{:then value}
								{value}
							{/await}
						</div>
					</A>
				</div>
			</Li>
			<Li class="pb-3 sm:pb-4 pt-4">
				<div class="flex items-center space-x-4">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white">Saved Emails</p>
					</div>
					<div
						class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
					>
						{#await data.streamed.emails.processed}
							Loading...
						{:then value}
							{value}
						{/await}
					</div>
				</div>
			</Li>
			<Li class="pb-3 sm:pb-4 pt-4">
				<div class="flex items-center space-x-4">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white">Indexed Emails</p>
					</div>
					<div
						class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
					>
						{#await data.streamed.emails.indexed}
							Loading...
						{:then value}
							{value}
						{/await}
					</div>
				</div>
			</Li>
			<Li class="pb-3 sm:pb-4 pt-4">
				<div class="flex items-center space-x-4">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white">Syncing</p>
					</div>
					<div
						class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
					>
						{#await data.streamed.accounts.syncing}
							Loading...
						{:then value}
							{value}
						{/await}
					</div>
				</div>
			</Li>
			<Li class="pb-3 sm:pb-4 pt-4">
				<div class="flex items-center space-x-4">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white">Failures</p>
					</div>
					<div
						class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
					>
						{#await data.streamed.emails.failure}
							Loading...
						{:then value}
							{value}
						{/await}
					</div>
				</div>
			</Li>
			<Li class="pb-3 sm:pb-4 pt-4">
				<div class="flex items-center space-x-4">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate dark:text-white">Storage Used</p>
						<p class="text-sm text-gray-500 truncate dark:text-gray-400">
							Maximum allowed emails {data.streamed.emails.quota}
						</p>
					</div>
					<div
						class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white"
					>
						{#await data.streamed.emails.processed}
							Loading...
						{:then value}
							{((value / data.streamed.emails.quota) * 100).toFixed(2) + ' %'}
						{/await}
					</div>
				</div>
			</Li>
		</List>
	</Card>
	<Card class="max-w-none items-center justify-center">
		<div class="flex flex-col pb-4">
			<Button href="/accounts/add">
				Add Account
				<svg
					aria-hidden="true"
					class="ml-2 -mr-1 w-5 h-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						fill-rule="evenodd"
						d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/></svg
				>
			</Button>
		</div>
	</Card>
</div>
