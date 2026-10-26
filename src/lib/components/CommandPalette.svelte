<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme.js';

	export let open = false;

	let search = '';
	let selectedIndex = 0;

	const items = [
		{ type: 'link', label: 'Buat Invoice Baru', href: '/invoices/create', icon: '➕', category: 'Aksi Cepat' },
		{ type: 'link', label: 'Dashboard Ringkasan', href: '/dashboard', icon: '📊', category: 'Navigasi' },
		{ type: 'link', label: 'Daftar Invoice', href: '/invoices', icon: '📄', category: 'Navigasi' },
		{ type: 'link', label: 'Katalog 10 Template', href: '/templates', icon: '🎨', category: 'Navigasi' },
		{ type: 'link', label: 'Kelola Pelanggan', href: '/customers', icon: '👥', category: 'Navigasi' },
		{ type: 'link', label: 'Katalog Produk & Jasa', href: '/products', icon: '📦', category: 'Navigasi' },
		{ type: 'link', label: 'Pengaturan Bisnis', href: '/settings', icon: '⚙️', category: 'Navigasi' },
		{ type: 'link', label: 'Halaman Beranda', href: '/', icon: '🏠', category: 'Navigasi' },
		{
			type: 'action',
			label: 'Ganti Mode Tampilan (Dark / Light)',
			icon: '🌓',
			category: 'Preferensi',
			action: () => theme.toggle()
		}
	];

	$: filtered = items.filter(
		(it) =>
			it.label.toLowerCase().includes(search.toLowerCase()) ||
			it.category.toLowerCase().includes(search.toLowerCase())
	);

	$: if (selectedIndex >= filtered.length) {
		selectedIndex = Math.max(0, filtered.length - 1);
	}

	function handleKeyDown(e) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open = !open;
			if (open) search = '';
		} else if (e.key === 'Escape' && open) {
			open = false;
		} else if (open) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % filtered.length;
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
			} else if (e.key === 'Enter' && filtered[selectedIndex]) {
				e.preventDefault();
				executeItem(filtered[selectedIndex]);
			}
		}
	}

	function executeItem(item) {
		open = false;
		if (item.type === 'link') {
			goto(item.href);
		} else if (item.type === 'action') {
			item.action();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-0">
		<button
			type="button"
			class="fixed inset-0 cursor-default"
			on:click={() => (open = false)}
			aria-label="Tutup pencarian"
		></button>

		<div class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
			<!-- Search bar -->
			<div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
				<svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					class="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
					placeholder="Ketik perintah atau cari halaman..."
					bind:value={search}
					autofocus
				/>
				<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-slate-800">ESC</span>
			</div>

			<!-- List results -->
			<div class="max-h-80 overflow-y-auto p-2 space-y-1">
				{#if filtered.length === 0}
					<div class="p-6 text-center text-xs text-slate-400">
						Tidak ada menu atau perintah yang cocok dengan "{search}".
					</div>
				{:else}
					{#each filtered as it, idx}
						<button
							type="button"
							class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition
								{idx === selectedIndex
									? 'bg-primary-50 text-primary-700 font-semibold dark:bg-primary-500/20 dark:text-primary-300'
									: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}"
							on:click={() => executeItem(it)}
							on:mouseenter={() => (selectedIndex = idx)}
						>
							<div class="flex items-center gap-2.5">
								<span class="text-base">{it.icon}</span>
								<span>{it.label}</span>
							</div>
							<span class="text-[11px] text-slate-400">{it.category}</span>
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950">
				<div class="flex items-center gap-2">
					<span>↑↓ Navigasi</span>
					<span>↵ Pilih</span>
				</div>
				<span>Invoicely Command Palette</span>
			</div>
		</div>
	</div>
{/if}
