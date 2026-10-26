<script>
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth.js';

	export let collapsed = false;
	export let mobileOpen = false;

	const mainLinks = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/invoices', label: 'Invoices', badge: 'Baru', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
		{ href: '/templates', label: 'Template', badge: '10', icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 4h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z' },
		{ href: '/customers', label: 'Pelanggan', badge: 'Tabel', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6 3.13a4 4 0 00-2-3.13' },
		{ href: '/products', label: 'Produk & Jasa', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }
	];

	const secondaryLinks = [
		{ href: '/settings', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
	];
</script>

<!-- Mobile backdrop overlay -->
{#if mobileOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
		aria-label="Tutup menu navigasi"
		on:click={() => (mobileOpen = false)}
	></button>
{/if}

<aside
	class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white shadow-xl transition-all duration-300 ease-in-out
		dark:border-slate-800/80 dark:bg-surfaceDark
		{collapsed ? 'w-20' : 'w-64'}
		{mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0"
>
	<!-- BRAND & TOGGLE HEADER (TOMBOL CIUTKAN PADA BAGIAN ATAS SIDEBAR) -->
	<div class="flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 dark:border-slate-800 {collapsed ? 'px-0 justify-center' : 'px-4'}">
		<a href="/" class="flex items-center gap-3 group" title="Invoicely Home">
			<div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-indigo-500 font-extrabold text-white text-base shadow-md shadow-primary/30 transition group-hover:scale-105">
				IN
				<span class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-surfaceDark"></span>
				</span>
			</div>
			{#if !collapsed}
				<div class="flex flex-col">
					<div class="flex items-center gap-1.5">
						<span class="text-base font-black tracking-tight text-slate-900 dark:text-white">Invoicely</span>
						<span class="rounded bg-primary-100 px-1.5 py-0.2 text-[9px] font-extrabold text-primary dark:bg-primary-500/20 dark:text-primary-300">PRO</span>
					</div>
					<span class="text-[10px] text-slate-400 font-medium">Smart Invoice Generator</span>
				</div>
			{/if}
		</a>

		<!-- Header Right Controls: Collapse Toggle (DI ATAS SIDEBAR) & Mobile Close -->
		<div class="flex items-center gap-1">
			<button
				type="button"
				class="hidden md:flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
				on:click={() => (collapsed = !collapsed)}
				aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
				title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
			>
				{#if collapsed}
					<svg class="h-5 w-5 text-slate-400 hover:text-primary transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
					</svg>
				{:else}
					<svg class="h-5 w-5 text-slate-400 hover:text-primary transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
					</svg>
				{/if}
			</button>

			{#if mobileOpen}
				<button
					type="button"
					class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 md:hidden"
					on:click={() => (mobileOpen = false)}
					aria-label="Tutup menu"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- USER PROFILE CARD (DI ATAS SIDEBAR, DITETAPKAN DI ATAS MENU) -->
	<div class="pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 {collapsed ? 'px-2 text-center' : 'px-3'}">
		{#if $auth}
			{#if !collapsed}
				<div class="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
					<div class="flex items-center gap-2.5 min-w-0">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 font-extrabold text-white text-sm shadow-xs">
							{$auth.avatar || 'U'}
						</div>
						<div class="min-w-0">
							<p class="text-xs font-bold text-slate-900 dark:text-white truncate">{$auth.name}</p>
							<p class="text-[10px] text-slate-400 truncate">{$auth.businessName || 'Bisnis'}</p>
						</div>
					</div>
					<button
						type="button"
						on:click={() => auth.logout()}
						class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
						title="Keluar (Logout)"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>
				</div>
			{:else}
				<!-- Collapsed Avatar Button -->
				<button
					type="button"
					on:click={() => auth.logout()}
					class="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 font-extrabold text-white text-sm shadow-md hover:scale-105 transition"
					title="Keluar: {$auth.name} ({$auth.businessName})"
				>
					{$auth.avatar || 'U'}
				</button>
			{/if}
		{:else if !collapsed}
			<div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-primary-50/70 border border-primary/20 dark:bg-primary-500/10 dark:border-primary-500/20 text-center">
				<p class="text-xs font-bold text-primary dark:text-primary-300">Belum Masuk Akun?</p>
				<div class="grid grid-cols-2 gap-1.5 mt-1">
					<a href="/login" class="btn-secondary text-[11px] py-1 px-2 text-center justify-center">Masuk</a>
					<a href="/register" class="btn-primary text-[11px] py-1 px-2 text-center justify-center">Daftar</a>
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation Menu -->
	<nav class="flex-1 space-y-4 overflow-y-auto py-2 {collapsed ? 'px-2' : 'px-3'}">
		<!-- Main Section -->
		<div>
			{#if !collapsed}
				<p class="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
					Menu Utama
				</p>
			{/if}
			<div class="space-y-1">
				{#each mainLinks as link}
					{@const isActive = $page.url.pathname.startsWith(link.href)}
					<a
						href={link.href}
						on:click={() => (mobileOpen = false)}
						class="group relative flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200
							{collapsed ? 'justify-center h-11' : 'justify-between px-3'}
							{isActive
								? 'bg-primary-50 text-primary-700 font-bold shadow-xs dark:bg-primary-500/20 dark:text-primary-300'
								: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'}"
						title={collapsed ? link.label : ''}
					>
						{#if isActive}
							<span class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary dark:bg-primary-400"></span>
						{/if}

						<div class="flex items-center gap-3 {collapsed ? 'justify-center' : ''}">
							<svg class="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 {isActive ? 'text-primary dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
							</svg>
							{#if !collapsed}
								<span>{link.label}</span>
							{/if}
						</div>

						{#if !collapsed && link.badge}
							<span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
								{link.badge === 'Tabel' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-primary/10 text-primary dark:bg-primary-500/20 dark:text-primary-300'}">
								{link.badge}
							</span>
						{/if}
					</a>
				{/each}
			</div>
		</div>

		<!-- Preferences & Auth Section -->
		<div>
			{#if !collapsed}
				<p class="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
					Preferensi & Akun
				</p>
			{/if}
			<div class="space-y-1">
				{#each secondaryLinks as link}
					{@const isActive = $page.url.pathname.startsWith(link.href)}
					<a
						href={link.href}
						on:click={() => (mobileOpen = false)}
						class="group relative flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200
							{collapsed ? 'justify-center h-11' : 'gap-3 px-3'}
							{isActive
								? 'bg-primary-50 text-primary-700 font-bold dark:bg-primary-500/20 dark:text-primary-300'
								: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'}"
						title={collapsed ? link.label : ''}
					>
						{#if isActive}
							<span class="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary dark:bg-primary-400"></span>
						{/if}

						<svg class="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 {isActive ? 'text-primary dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
							<path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
						</svg>
						{#if !collapsed}
							<span>{link.label}</span>
						{/if}
					</a>
				{/each}

				{#if !$auth}
					<a
						href="/login"
						on:click={() => (mobileOpen = false)}
						class="flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60
							{collapsed ? 'justify-center h-11' : 'gap-3 px-3'}"
						title={collapsed ? 'Masuk' : ''}
					>
						<svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
							<path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
						</svg>
						{#if !collapsed}
							<span>Masuk / Login</span>
						{/if}
					</a>
					<a
						href="/register"
						on:click={() => (mobileOpen = false)}
						class="flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60
							{collapsed ? 'justify-center h-11' : 'gap-3 px-3'}"
						title={collapsed ? 'Daftar' : ''}
					>
						<svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
							<path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
						</svg>
						{#if !collapsed}
							<span>Daftar Akun Baru</span>
						{/if}
					</a>
				{/if}
			</div>
		</div>
	</nav>

	<!-- Quick Action Footer -->
	<div class="p-3 border-t border-slate-100 dark:border-slate-800">
		{#if !collapsed}
			<a
				href="/invoices/create"
				class="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/25 hover:shadow-lg transition"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<span>+ Buat Invoice Baru</span>
			</a>
		{:else}
			<a
				href="/invoices/create"
				class="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md hover:scale-105 transition"
				title="Buat Invoice Baru"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
			</a>
		{/if}
	</div>
</aside>
