<script>
	import { version } from '$app/environment';
	import { Footer, FooterLinkGroup, Li } from 'flowbite-svelte';
</script>

<Footer class="mt-auto md:p-3">
	<FooterLinkGroup
		ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0"
	>
		<Li>v{version}</Li>
	</FooterLinkGroup>
</Footer>
