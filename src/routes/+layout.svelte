<script>
	import Navbar from '../components/navbar.svelte';
	import '../app.postcss';
	import { page } from '$app/stores';
</script>

<div class="antialiased">
	<!-- Navbar -->
	{#if $page.data.user}
		<Navbar />
	{/if}

	<!-- Content -->
	<main class={ $page.data.user ? 'p-4 h-auto pt-20' : '' }>
		<slot />
	</main>
</div>
