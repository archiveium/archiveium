<script lang="ts">
	import type { ActionData } from './$types';
	import Credentials from '../../../components/account/add/steps/credentials.svelte';
	import type { Provider } from '../../../types/provider';
	import Folders from '../../../components/account/add/steps/folders.svelte';
	import { StepIndicator } from 'flowbite-svelte';

	export let data: { availableProviders: Provider[]; defaultProvider: Provider | undefined };
	export let form: ActionData;

	$: currentStep = form?.steps?.current ?? 1;
	let steps = [
		'Credentials',
		'Folders'
	];	
</script>

<StepIndicator {currentStep} {steps} />

{#if form?.remoteFolders}
	<Folders {form} />
{:else}
	<Credentials {data} {form} />
{/if}
