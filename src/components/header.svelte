<script>
	import logo from '$lib/images/logo.svg';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
</script>

<header class="navbar navbar-expand-md navbar-light d-print-none">
	<div class="container-xl">
		<a href="/dashboard">
			<img src={logo} alt="" height="40" />
		</a>
		<div class="navbar-nav flex-row order-md-last">
			<div class="nav-item dropdown">
				<a
					href="."
					class="nav-link d-flex lh-1 text-reset p-0"
					data-bs-toggle="dropdown"
					aria-label="Open user menu"
					aria-expanded="false"
				>
					<span class="avatar avatar-rounded">
						<!-- TODO: This should be server side -->
						{$page.data.user.name
							.split(' ')
							.map(function (/** @type {string[]} */ item) {
								return item[0];
							})
							.join('')}
					</span>
				</a>
				<div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
					<form method="post" action="/logout" use:enhance>
						<button class="dropdown-item">Logout</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</header>
