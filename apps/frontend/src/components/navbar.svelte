<script>
	import logo from '$lib/images/logo.svg';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { Avatar, Dropdown, DropdownItem } from 'flowbite-svelte';

	const username = $page.data.user.name;
	const email = $page.data.user.email;
	const isAdmin = $page.data.user.admin;
	const initials = username
		.split(' ')
		.map(function (/** @type {string[]} */ item) {
			return item[0];
		})
		.join('');
</script>

<nav
	class="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50"
>
	<div class="flex flex-wrap justify-between items-center">
		<div class="flex justify-start items-center">
			<a href="/dashboard" class="flex items-center justify-between mr-4">
				<img src={logo} alt="" class="mr-2 h-10" />
				<span class="self-center text-xl whitespace-nowrap dark:text-white"> Archiveium </span>
			</a>
		</div>
		<div class="flex items-center lg:order-2">
			<button
				type="button"
				class="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
				id="user-menu-button"
				aria-expanded="false"
				data-dropdown-toggle="dropdown"
			>
				<span class="sr-only">Open user menu</span>
				<Avatar class="acs">{initials}</Avatar>
			</button>
			<!-- Dropdown menu -->
			<Dropdown>
				<div slot="header" class="px-4 py-2">
					<span class="block text-sm text-gray-900 dark:text-white">{username}</span>
					<span class="block truncate text-sm font-medium">{email}</span>
				</div>
				{#if isAdmin}
					<DropdownItem href="/administration">Administration</DropdownItem>
				{/if}
				<DropdownItem href="/profile">Profile</DropdownItem>
				<form method="post" action="/logout" use:enhance>
					<DropdownItem type="submit">Logout</DropdownItem>
				</form>
			</Dropdown>
		</div>
	</div>
</nav>
