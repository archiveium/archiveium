<script lang="ts">
	import Header from '../../../../components/header.svelte';
	import Folders from '../../../../components/account/edit/steps/folders.svelte';
	import Credentials from '../../../../components/account/edit/steps/credentials.svelte';
	import type { ActionData } from '../../$types';

	export let data;
	export let form: ActionData;
</script>

<Header />

{#if form?.remoteFolders}
	<Folders {form} />
{:else}
	<Credentials {data} {form} />
{/if}
