<script lang="ts">
	import { Card, Heading, Listgroup, ListgroupItem, Badge } from 'flowbite-svelte';

	export let data;
</script>

<Heading tag="h1" class="mb-4 text-xl font-semibold sm:text-2xl">Administration</Heading>

<div class="grid">
	<Card class="max-w-none">
		<div class="flex justify-between items-center mb-4">
			<Heading class="text-xl font-medium">Background Jobs</Heading>
		</div>
		<Listgroup class="border-0 dark:!bg-transparent">
			{#each data.queueJobCounts as queueJob}
				<ListgroupItem>
					<div class="flex items-center space-x-4 rtl:space-x-reverse">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate dark:text-white">
								{queueJob.name}
							</p>
							<p class="text-sm text-gray-500 truncate dark:text-gray-400">
								{#each Object.entries(queueJob.status) as [status, count]}
									<Badge
										class="mr-1"
										rounded
										color={count > 0 && status === 'failed' ? 'red' : 'green'}
									>
										{`${status.charAt(0).toUpperCase()}${status.substring(1)}`} {count}
									</Badge>
								{/each}
							</p>
						</div>
					</div>
				</ListgroupItem>
			{/each}
		</Listgroup>
	</Card>
</div>
