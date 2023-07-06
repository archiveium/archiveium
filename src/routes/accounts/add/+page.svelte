<script lang="ts">
	import Header from '../../../components/header.svelte';
	import type { ActionData, PageData } from './$types';
	import Credentials from '../../../components/account/add/steps/credentials.svelte';
	import type { Provider } from '../../../types/provider';
	import Folders from '../../../components/account/add/steps/folders.svelte';

	export let data: { availableProviders: Provider[]; defaultProvider: Provider | undefined };
	export let form: ActionData;
</script>

<Header />

{#if form?.remoteFolders}
	<Folders form={form} />
{:else}
	<Credentials data={data} form={form} />
{/if}