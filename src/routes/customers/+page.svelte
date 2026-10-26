<script>
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { formatCurrency } from '$lib/utils/invoiceCalc.js';
	import { customers } from '$lib/stores/data.js';

	onMount(() => {
		customers.syncWithBackend();
	});

	let search = '';
	let activeTab = 'all'; // 'all', 'outstanding', 'paid'
	let viewMode = 'table'; // 'table' or 'grid'

	let showModal = false;
	let editingId = null; // null for add, string for edit

	let toastMessage = '';
	let toastVisible = false;
	let toastTimer;

	function showToast(msg) {
		toastMessage = msg;
		toastVisible = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastVisible = false;
		}, 3000);
	}

	let formData = {
		name: '',
		email: '',
		phone: '',
		address: ''
	};

	$: filtered = $customers.filter((c) => {
		const matchSearch =
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			(c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
			(c.phone && c.phone.includes(search));
		
		let matchTab = true;
		if (activeTab === 'outstanding') matchTab = (c.outstanding || 0) > 0;
		if (activeTab === 'paid') matchTab = (c.outstanding || 0) === 0;

		return matchSearch && matchTab;
	});

	$: totalCustomers = $customers.length;
	$: totalOutstanding = $customers.reduce((sum, c) => sum + (c.outstanding || 0), 0);
	$: countWithBalance = $customers.filter((c) => (c.outstanding || 0) > 0).length;

	function openAddModal() {
		editingId = null;
		formData = { name: '', email: '', phone: '', address: '' };
		showModal = true;
	}

	function openEditModal(c) {
		editingId = c.id;
		formData = {
			name: c.name || '',
			email: c.email || '',
			phone: c.phone || '',
			address: c.address || ''
		};
		showModal = true;
	}

	function saveCustomer() {
		if (!formData.name.trim()) {
			alert('Mohon masukkan nama perusahaan / klien.');
			return;
		}

		if (editingId) {
			customers.updateCustomer(editingId, {
				name: formData.name.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim(),
				address: formData.address.trim()
			});
			showToast('✨ Data pelanggan berhasil disimpan!');
		} else {
			customers.addCustomer({
				name: formData.name.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim(),
				address: formData.address.trim()
			});
			showToast('✨ Pelanggan baru berhasil ditambahkan!');
		}

		showModal = false;
	}

	function deleteCustomer(c) {
		if (confirm(`Yakin ingin menghapus pelanggan "${c.name}"?`)) {
			customers.deleteCustomer(c.id);
			showToast(`🗑️ Pelanggan "${c.name}" berhasil dihapus.`);
		}
	}

	function cleanPhoneNumber(raw) {
		if (!raw) return '';
		let clean = raw.replace(/\D/g, '');
		if (clean.startsWith('0')) {
			clean = '62' + clean.slice(1);
		} else if (clean.startsWith('8')) {
			clean = '62' + clean;
		}
		return clean;
	}
</script>

<svelte:head><title>Pelanggan & Klien — Invoicely</title></svelte:head>

<AppShell title="Daftar Pelanggan">
	<!-- Summary Stats Bar -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="card p-4 flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pelanggan / PT</p>
				<p class="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalCustomers}</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-500/15 dark:text-primary-300">
				👥
			</div>
		</div>

		<div class="card p-4 flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tagihan Belum Lunas</p>
				<p class="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalOutstanding)}</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
				💰
			</div>
		</div>

		<div class="card p-4 flex items-center justify-between">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-slate-400">PT Menunggu Pembayaran</p>
				<p class="mt-1 text-2xl font-black text-slate-900 dark:text-white">{countWithBalance} PT</p>
			</div>
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
				📋
			</div>
		</div>
	</div>

	<!-- Controls & Toolbar -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<!-- Filter Tabs -->
		<div class="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'all' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'all')}
			>
				Semua ({totalCustomers})
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'outstanding' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'outstanding')}
			>
				Ada Tagihan ({countWithBalance})
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'paid' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'paid')}
			>
				Lunas ({totalCustomers - countWithBalance})
			</button>
		</div>

		<!-- Search Input & View Switcher & Add Button -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative flex-1 sm:w-64">
				<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					class="field-input pl-9 text-xs sm:text-sm"
					placeholder="Cari nama PT, email, WA..."
					bind:value={search}
				/>
			</div>

			<!-- View Switcher Toggle -->
			<div class="hidden sm:flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
				<button
					type="button"
					class="rounded-lg p-1.5 text-xs font-semibold transition
						{viewMode === 'table' ? 'bg-white text-primary shadow-xs dark:bg-surfaceDark dark:text-primary-300' : 'text-slate-400 hover:text-slate-700'}"
					on:click={() => (viewMode = 'table')}
					title="Tampilan Tabel (Default)"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18M3 18h18M3 6h18" />
					</svg>
				</button>
				<button
					type="button"
					class="rounded-lg p-1.5 text-xs font-semibold transition
						{viewMode === 'grid' ? 'bg-white text-primary shadow-xs dark:bg-surfaceDark dark:text-primary-300' : 'text-slate-400 hover:text-slate-700'}"
					on:click={() => (viewMode = 'grid')}
					title="Tampilan Kartu / Grid"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
					</svg>
				</button>
			</div>

			<button
				type="button"
				class="btn-primary shrink-0 text-xs sm:text-sm shadow-md shadow-primary/25"
				on:click={openAddModal}
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<span>+ Tambah PT Baru</span>
			</button>
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 text-xl">
				👥
			</div>
			<p class="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada pelanggan yang cocok</p>
			<p class="text-xs text-slate-500">Coba ubah kata kunci pencarian atau tambah pelanggan baru.</p>
			<button class="btn-primary mt-2 text-xs" on:click={openAddModal}>+ Tambah Pelanggan Pertama</button>
		</div>
	{:else if viewMode === 'table'}
		<!-- Main Data Table View -->
		<div class="card overflow-hidden shadow-soft">
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead>
						<tr class="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
							<th class="p-4">Perusahaan / Klien</th>
							<th class="p-4">Kontak Penagihan</th>
							<th class="p-4">Alamat Kantor</th>
							<th class="p-4 text-center">Invoice</th>
							<th class="p-4">Status & Outstanding</th>
							<th class="p-4 text-right">Aksi Cepat</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						{#each filtered as c}
							<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
								<!-- Company name & Avatar -->
								<td class="p-4">
									<div class="flex items-center gap-3">
										<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 font-black text-primary text-sm dark:bg-primary-500/20 dark:text-primary-300 border border-primary/20">
											{c.name.charAt(0).toUpperCase()}
										</div>
										<div>
											<p class="font-bold text-slate-900 dark:text-white">{c.name}</p>
											<p class="text-[11px] text-slate-400">ID: {c.id}</p>
										</div>
									</div>
								</td>

								<!-- Contact details -->
								<td class="p-4 text-xs">
									<p class="font-medium text-slate-700 dark:text-slate-300">{c.email || '-'}</p>
									{#if c.phone}
										<div class="mt-1 flex items-center gap-1.5">
											<a
												href="https://wa.me/{cleanPhoneNumber(c.phone)}"
												target="_blank"
												class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md"
												title="Buka Chat WhatsApp"
											>
												💬 WA: {c.phone}
											</a>
										</div>
									{/if}
								</td>

								<!-- Address -->
								<td class="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
									{c.address ? `📍 ${c.address}` : '-'}
								</td>

								<!-- Invoice count -->
								<td class="p-4 text-center">
									<span class="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
										{c.totalInvoices || 0}
									</span>
								</td>

								<!-- Outstanding balance & Status badge -->
								<td class="p-4">
									<div class="flex items-center gap-2">
										<span class="rounded-full px-2.5 py-1 text-[11px] font-bold
											{c.outstanding > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'}">
											{c.outstanding > 0 ? 'Ada Tagihan' : 'Lunas'}
										</span>
										<span class="text-xs font-black text-slate-800 dark:text-slate-200">
											{c.outstanding > 0 ? formatCurrency(c.outstanding) : 'Rp 0'}
										</span>
									</div>
								</td>

								<!-- Actions -->
								<td class="p-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<a
											href="/invoices/create?client={encodeURIComponent(c.name)}"
											class="btn-primary text-xs py-1.5 px-3 shadow-xs"
											title="Buat Invoice Baru ke PT Ini"
										>
											🚀 Invoice
										</a>

										<button
											type="button"
											on:click={() => openEditModal(c)}
											class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
											title="Edit Data PT"
										>
											✏️
										</button>

										<button
											type="button"
											on:click={() => deleteCustomer(c)}
											class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
											title="Hapus Pelanggan"
										>
											🗑️
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<!-- Grid View Option -->
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as c}
				<div class="card-hover p-5 flex flex-col justify-between border-slate-200/90 dark:border-slate-800 shadow-soft">
					<div>
						<div class="flex items-center justify-between">
							<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 font-bold text-primary text-base dark:bg-primary-500/20 dark:text-primary-300">
								{c.name.charAt(0)}
							</div>
							<div class="flex items-center gap-2">
								<span class="rounded-full px-2.5 py-1 text-xs font-semibold {c.outstanding > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'}">
									{c.outstanding > 0 ? 'Ada Tagihan' : 'Lunas'}
								</span>
								<button
									type="button"
									class="text-slate-400 hover:text-rose-500 p-1"
									on:click={() => deleteCustomer(c)}
									title="Hapus pelanggan"
								>
									🗑️
								</button>
							</div>
						</div>

						<h3 class="mt-4 font-bold text-slate-900 dark:text-white text-base">{c.name}</h3>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.email || 'Tanpa email'}</p>
						{#if c.phone}
							<p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
								<span>💬 WA:</span> {c.phone}
							</p>
						{/if}
						{#if c.address}
							<p class="text-xs text-slate-400 mt-1 line-clamp-1">📍 {c.address}</p>
						{/if}
					</div>

					<div class="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3">
						<div class="flex items-center justify-between text-xs mb-3">
							<span class="text-slate-500 dark:text-slate-400">{c.totalInvoices || 0} Invoice</span>
							<span class="font-bold {c.outstanding ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}">
								{c.outstanding ? formatCurrency(c.outstanding) : 'Rp 0'}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<button type="button" class="btn-secondary text-xs py-2 px-3" on:click={() => openEditModal(c)}>
								Edit
							</button>
							<a
								href="/invoices/create?client={encodeURIComponent(c.name)}"
								class="btn-primary flex-1 justify-center text-xs py-2 shadow-xs"
							>
								🚀 Invoice PT Ini
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Modal Form Tambah / Edit Pelanggan -->
	{#if showModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
			<div class="w-full max-w-md card p-6 shadow-2xl animate-in zoom-in-95">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">
						{editingId ? 'Edit Data Pelanggan / PT' : 'Tambah Pelanggan / PT Baru'}
					</h3>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						on:click={() => (showModal = false)}
					>
						✕
					</button>
				</div>

				<div class="mt-4 space-y-3">
					<div>
						<label class="field-label" for="cust-name">Nama Perusahaan / PT / Klien *</label>
						<input id="cust-name" class="field-input" bind:value={formData.name} placeholder="cth. PT Sumber Makmur Sejahtera" />
					</div>
					<div>
						<label class="field-label" for="cust-phone">Nomor Telepon / WhatsApp (Untuk Auto Kirim)</label>
						<input id="cust-phone" class="field-input" bind:value={formData.phone} placeholder="cth. 081234567890" />
					</div>
					<div>
						<label class="field-label" for="cust-email">Email Finance / Penagihan PT</label>
						<input id="cust-email" type="email" class="field-input" bind:value={formData.email} placeholder="finance@perusahaan.co.id" />
					</div>
					<div>
						<label class="field-label" for="cust-addr">Alamat Lengkap Kantor</label>
						<input id="cust-addr" class="field-input" bind:value={formData.address} placeholder="Gedung, Lantai, Jalan, Kota" />
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
					<button type="button" class="btn-ghost text-xs" on:click={() => (showModal = false)}>Batal</button>
					<button type="button" class="btn-primary text-xs" on:click={saveCustomer}>
						{editingId ? 'Simpan Perubahan' : 'Simpan Data PT'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Floating Toast Notification -->
	{#if toastVisible}
		<div class="fixed bottom-6 right-6 z-50 toast-enter">
			<div class="flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-slate-900 border border-slate-700 dark:border-slate-200">
				<span>{toastMessage}</span>
			</div>
		</div>
	{/if}
</AppShell>
