<script>
	import Navbar from '../components/navbar.svelte';
	import '../app.postcss';
	import { page } from '$app/stores';
	import Footer from '../components/footer.svelte';
</script>

<!-- Navbar -->
{#if $page.data.showNavbar}
	<Navbar />
{/if}

<!-- Content -->
<main class={$page.data.showNavbar ? 'p-4 h-auto pt-20' : ''}>
	<slot />
</main>

<!-- Footer -->
{#if $page.data.showNavbar}
	<Footer />
{/if}
