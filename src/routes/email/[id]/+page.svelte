<script lang="ts">
	export let data;
</script>

<!-- data.email.html is sanitized and hence eslint rule has been disabled -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html data.email.html}
