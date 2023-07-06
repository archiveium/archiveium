<script lang="ts">
    import { IconChevronRight, IconChevronLeft } from '@tabler/icons-svelte';
	import type { Paginator } from "../utils/pagination";

    export let paginator: Paginator;
    const showingCountStart = paginator.currentPage - 1 === 0 ? 1 : (paginator.currentPage - 1) * paginator.resultsPerPage;
    const showingCountEnd = paginator.currentPage * paginator.resultsPerPage;
</script>

{#if paginator.resultCount > 0}
<div class="card-footer d-flex align-items-center">
	<p class="m-0 text-muted">
		Showing <span>{showingCountStart}</span> to <span>{showingCountEnd}</span> of <span>{paginator.resultCount}</span> emails
	</p>
	<ul class="pagination m-0 ms-auto">
		<li class={paginator.previousLink.isActive ? 'page-item' : 'page-item disabled'}>
			<a class="page-link" href={paginator.previousLink.href} tabindex="-1">
				<IconChevronLeft size={16} /> prev
			</a>
		</li>
		{#each paginator.pageNumbers as pageNumber}
			<li class={pageNumber.isActive ? 'page-item active' : 'page-item'}>
				<a class="page-link" href={pageNumber.href}>{pageNumber.value}</a>
			</li>
		{/each}
		<li class={paginator.nextLink.isActive ? 'page-item' : 'page-item disabled'}>
			<a class="page-link" href={paginator.nextLink.href}>
				next <IconChevronRight size={16} />
			</a>
		</li>
	</ul>
</div>	
{/if }

