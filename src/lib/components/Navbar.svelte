<script>
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme.js';
	import { auth } from '$lib/stores/auth.js';

	let mobileMenuOpen = false;
	let userMenuOpen = false;

	const navLinks = [
		{ href: '/', label: 'Beranda' },
		{ href: '/templates', label: 'Template' },
		{ href: '/#features', label: 'Fitur' },
		{ href: '/invoices', label: 'Kelola Invoice' },
		{ href: '/dashboard', label: 'Dashboard' }
	];

	function closeMenu() {
		mobileMenuOpen = false;
		userMenuOpen = false;
	}

	function handleLogout() {
		auth.logout();
		closeMenu();
	}
</script>

<!-- Main Sticky Navbar -->
<header class="glass-nav">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
		<!-- Brand Logo -->
		<a href="/" class="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1">
			<div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 shadow-md shadow-primary/25 transition group-hover:scale-105 group-hover:shadow-primary/40">
				<svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<div class="flex flex-col">
				<div class="flex items-center gap-1.5">
					<span class="text-xl font-black tracking-tight text-slate-900 dark:text-white">Invoicely</span>
					<span class="inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary dark:bg-primary-500/20 dark:text-primary-300">Free</span>
				</div>
			</div>
		</a>

		<!-- Desktop Navigation Links -->
		<nav class="hidden md:flex items-center gap-1 lg:gap-2">
			{#each navLinks as link}
				{@const isActive = link.href === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(link.href)}
				<a
					href={link.href}
					class="px-3 py-2 rounded-xl text-sm font-medium transition-colors
						{isActive
							? 'text-primary font-semibold bg-primary-50/70 dark:bg-primary-500/15 dark:text-primary-300'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Right actions: Theme toggle + Auth + CTA -->
		<div class="hidden sm:flex items-center gap-2.5">
			<!-- Theme Toggle Button -->
			<button
				type="button"
				class="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
				on:click={() => theme.toggle()}
				title={$theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
				aria-label="Ganti tema"
			>
				{#if $theme === 'dark'}
					<svg class="h-5 w-5 transition-transform rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				{:else}
					<svg class="h-5 w-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
						<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				{/if}
			</button>

			{#if $auth}
				<!-- Logged in User Menu -->
				<div class="relative">
					<button
						type="button"
						on:click={() => (userMenuOpen = !userMenuOpen)}
						class="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
					>
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-500 font-bold text-white text-xs shadow-xs">
							{$auth.avatar || 'U'}
						</div>
						<span class="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline">{$auth.name}</span>
						<span class="text-[10px] text-slate-400">▾</span>
					</button>

					{#if userMenuOpen}
						<div class="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-surfaceDark z-50 animate-in fade-in-50">
							<div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
								<p class="text-xs font-bold text-slate-900 dark:text-white">{$auth.name}</p>
								<p class="text-[11px] text-slate-400 truncate">{$auth.email}</p>
							</div>
							<a
								href="/dashboard"
								on:click={closeMenu}
								class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 mt-1"
							>
								📊 Dashboard
							</a>
							<a
								href="/settings"
								on:click={closeMenu}
								class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
							>
								⚙️ Pengaturan Profile
							</a>
							<button
								type="button"
								on:click={handleLogout}
								class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition"
							>
								🚪 Keluar (Logout)
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Guest Auth Buttons -->
				<a
					href="/login"
					class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-primary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
				>
					Masuk
				</a>
				<a
					href="/register"
					class="px-3.5 py-2 rounded-xl text-xs font-bold text-primary border border-primary/20 bg-primary/10 hover:bg-primary/20 dark:text-primary-300 dark:border-primary-500/30 transition"
				>
					Daftar Gratis
				</a>
			{/if}

			<!-- Primary Action CTA -->
			<a
				href="/invoices/create"
				class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<span>Buat Invoice</span>
			</a>
		</div>

		<!-- Mobile Hamburger Button -->
		<div class="flex items-center gap-1.5 sm:hidden">
			<button
				type="button"
				class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
				on:click={() => theme.toggle()}
				aria-label="Ganti tema"
			>
				{#if $theme === 'dark'}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
						<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				{/if}
			</button>

			<button
				type="button"
				class="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
				on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-expanded={mobileMenuOpen}
				aria-label="Toggle Menu"
			>
				{#if mobileMenuOpen}
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile Navigation Drawer / Dropdown -->
	{#if mobileMenuOpen}
		<div class="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-5 space-y-3 dark:border-slate-800/80 dark:bg-slate-900/95 shadow-xl">
			<nav class="space-y-1">
				{#each navLinks as link}
					{@const isActive = link.href === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(link.href)}
					<a
						href={link.href}
						on:click={closeMenu}
						class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
							{isActive
								? 'bg-primary-50 text-primary-700 font-semibold dark:bg-primary-500/20 dark:text-primary-300'
								: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}"
					>
						<span>{link.label}</span>
						{#if isActive}
							<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
						{/if}
					</a>
				{/each}
			</nav>

			<div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
				{#if $auth}
					<div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 mb-1">
						<div class="flex items-center gap-2">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
								{$auth.avatar || 'U'}
							</div>
							<div>
								<p class="text-xs font-bold text-slate-900 dark:text-white">{$auth.name}</p>
								<p class="text-[10px] text-slate-400 truncate">{$auth.email}</p>
							</div>
						</div>
						<button
							type="button"
							on:click={handleLogout}
							class="text-xs text-rose-600 font-bold hover:underline"
						>
							Keluar
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-2 mb-1">
						<a
							href="/login"
							on:click={closeMenu}
							class="btn-secondary text-xs text-center py-2"
						>
							Masuk
						</a>
						<a
							href="/register"
							on:click={closeMenu}
							class="btn-primary text-xs text-center py-2"
						>
							Daftar Gratis
						</a>
					</div>
				{/if}

				<a
					href="/invoices/create"
					on:click={closeMenu}
					class="btn-primary w-full justify-center shadow-md shadow-primary/25"
				>
					+ Buat Invoice Sekarang
				</a>
			</div>
		</div>
	{/if}
</header>
