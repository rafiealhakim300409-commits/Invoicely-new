<script>
	import Sidebar from './Sidebar.svelte';
	import Topbar from './Topbar.svelte';
	import CommandPalette from './CommandPalette.svelte';

	export let title = '';

	let collapsed = false;
	let mobileOpen = false;
	let commandPaletteOpen = false;
</script>

<div class="min-h-screen bg-bg dark:bg-bgDark">
	<!-- Left Sidebar -->
	<Sidebar bind:collapsed bind:mobileOpen />

	<!-- Main Content Area (Shifts left when sidebar is collapsed) -->
	<div class="transition-all duration-300 ease-in-out {collapsed ? 'md:pl-20' : 'md:pl-64'}">
		<Topbar
			{title}
			onMenuClick={() => (mobileOpen = true)}
			onOpenSearch={() => (commandPaletteOpen = true)}
		/>

		<main class="px-4 py-6 md:px-8 md:py-8">
			<slot />
		</main>
	</div>

	<!-- Command Palette Modal -->
	<CommandPalette bind:open={commandPaletteOpen} />
</div>
