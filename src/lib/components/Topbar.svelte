<script>
	import { theme } from '$lib/stores/theme.js';
	import { auth } from '$lib/stores/auth.js';

	export let onMenuClick = () => {};
	export let onOpenSearch = () => {};
	export let title = '';

	let userDropdownOpen = false;

	function handleLogout() {
		userDropdownOpen = false;
		auth.logout();
	}
</script>

<header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-surfaceDark/80 md:px-8 shadow-xs">
	<!-- Left: Mobile Menu Trigger & Breadcrumbs -->
	<div class="flex items-center gap-3">
		<button
			type="button"
			class="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
			on:click={onMenuClick}
			aria-label="Buka menu navigasi"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>

		<nav class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
			<a href="/" class="text-slate-400 hover:text-primary transition font-medium hidden sm:inline">
				Invoicely
			</a>
			{#if title}
				<span class="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
				<h1 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
					{title}
				</h1>
			{/if}
		</nav>
	</div>

	<!-- Center / Search Command Palette trigger -->
	<div class="hidden sm:flex items-center">
		<button
			type="button"
			class="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition"
			on:click={onOpenSearch}
			title="Buka Command Palette (Ctrl + K)"
		>
			<svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<span>Cari halaman atau aksi...</span>
			<kbd class="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">Ctrl K</kbd>
		</button>
	</div>

	<!-- Right: Actions, Theme Switch, User Profile / Auth, New Invoice -->
	<div class="flex items-center gap-2 sm:gap-3">
		<!-- Mobile search icon button -->
		<button
			type="button"
			class="sm:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
			on:click={onOpenSearch}
			aria-label="Cari"
		>
			<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</button>

		<!-- Theme Toggle -->
		<button
			type="button"
			class="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
			on:click={() => theme.toggle()}
			title={$theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
			aria-label="Ganti tema"
		>
			{#if $theme === 'dark'}
				<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			{:else}
				<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
				</svg>
			{/if}
		</button>

		{#if $auth}
			<!-- Profile Avatar Dropdown Capsule -->
			<div class="relative">
				<button
					type="button"
					on:click={() => (userDropdownOpen = !userDropdownOpen)}
					class="flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-1.5 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-primary/50 transition"
					title="Profil Pengguna"
				>
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-500 font-black text-white text-xs shadow-xs">
						{$auth.avatar || 'U'}
					</div>
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">{$auth.name}</span>
					<span class="text-[10px] text-slate-400">▾</span>
				</button>

				{#if userDropdownOpen}
					<div class="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-surfaceDark z-50 animate-in fade-in-50">
						<div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
							<p class="text-xs font-bold text-slate-900 dark:text-white">{$auth.name}</p>
							<p class="text-[11px] text-slate-400 truncate">{$auth.email}</p>
							<span class="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
								● Pro Member
							</span>
						</div>
						<a
							href="/settings"
							on:click={() => (userDropdownOpen = false)}
							class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 mt-1"
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
			<a href="/login" class="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary px-2 py-1.5">
				Masuk
			</a>
			<a href="/register" class="text-xs font-bold text-primary bg-primary-50 dark:bg-primary-500/15 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 transition">
				Daftar
			</a>
		{/if}

		{#if title !== 'Buat Invoice'}
			<a
				href="/invoices/create"
				class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-soft hover:bg-primary-700 transition"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<span>+ Buat Invoice</span>
			</a>
		{/if}
	</div>
</header>
