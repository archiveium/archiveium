<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, Heading, Listgroup, ListgroupItem, Badge, Button } from 'flowbite-svelte';

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
				{@const failedJob = Object.entries(queueJob.status).find(
					([status, count]) => status === 'failed' && count > 0
				)}
				<ListgroupItem>
					<div class="flex items-center space-x-4 rtl:space-x-reverse">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate dark:text-white">
								{queueJob.displayName}
							</p>
							{#each Object.entries(queueJob.status) as [status, count]}
								<Badge
									class="mr-1"
									rounded
									color={count > 0 && status === 'failed' ? 'red' : 'green'}
								>
									{`${status.charAt(0).toUpperCase()}${status.substring(1)}`}
									{count}
								</Badge>
							{/each}
						</div>
						<div class="inline-flex">
							{#if failedJob}
								<form method="post" action="/administration?/updateJob" use:enhance>
									<input type="hidden" name="jobName" value={queueJob.jobName} />
									<Button pill={true} class="!p-2" type="submit" color="light">
										<svg
											class="w-4 h-4"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<path
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"
											/>
										</svg>
									</Button>
								</form>
							{/if}
						</div>
					</div>
				</ListgroupItem>
			{/each}
		</Listgroup>
	</Card>
</div>
