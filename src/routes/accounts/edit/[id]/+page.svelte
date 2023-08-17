<script lang="ts">
	import Folders from '../../../../components/account/edit/steps/folders.svelte';
	import Credentials from '../../../../components/account/edit/steps/credentials.svelte';
	import { StepIndicator } from 'flowbite-svelte';

	export let data;
	export let form;

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
