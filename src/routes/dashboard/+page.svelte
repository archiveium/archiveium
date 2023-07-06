<script lang="ts">
	import Header from '../../components/header.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Header />

<div class="page-body">
	<div class="container-xl">

		<!-- Success alert -->
		{#if data.flashMessage}
			<div class="alert alert-success" role="alert">
				<div class="text-muted">{data.flashMessage.message}</div>
			</div>
		{/if}

		<div class="card">
			<div class="card-header">
				<h3 class="card-title">Overview</h3>
				<div class="card-actions">
					<a href="/accounts/add" class="btn btn-primary btn-md">
					  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 5l0 14"></path><path d="M5 12l14 0"></path></svg>
					  Add Account
					</a>
				  </div>
			</div>
			<div class="card-body">
				<div class="datagrid">
					<div class="datagrid-item">
						<div class="datagrid-title">Accounts</div>
						<div class="datagrid-content">
							{#await data.streamed.accounts.added}
								Loading...
							{:then value}
								<a href="/accounts">{value}</a>
							{/await}
						</div>
					</div>
					<div class="datagrid-item">
						<div class="datagrid-title">Syncing</div>
						<div class="datagrid-content">
							{#await data.streamed.accounts.syncing}
								Loading...
							{:then value}
								{value}
							{/await}                            
                        </div>
					</div>
					<div class="datagrid-item">
						<div class="datagrid-title">Saved Emails</div>
						<div class="datagrid-content">
							{#await data.streamed.emails.processed}
								Loading...
							{:then value}
								{value}
							{/await}                            
                        </div>
					</div>
					<div class="datagrid-item">
						<div class="datagrid-title">Failures</div>
						<div class="datagrid-content">
							{#await data.streamed.emails.failure}
								Loading...
							{:then value}
								{value}
							{/await}                            
                        </div>
					</div>
					<div class="datagrid-item">
						<div class="datagrid-title">Quota Used</div>
						<div class="datagrid-content">
							{#await data.streamed.emails.processed}
								Loading...
							{:then value}
								{ ((value / data.streamed.emails.quota ) * 100).toFixed(2) + ' %' }
							{/await}
                        </div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
