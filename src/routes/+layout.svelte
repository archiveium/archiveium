<script>
	import Navbar from '../components/navbar.svelte';
	import '../app.postcss';
</script>

<div class="antialiased">
	<!-- Navbar -->
	<Navbar />

	<!-- Content -->
	<main class="p-4 h-auto pt-20">
		<slot />
	</main>
</div>
