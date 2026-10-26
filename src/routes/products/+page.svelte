<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AppShell from '$lib/components/AppShell.svelte';
	import { formatCurrency } from '$lib/utils/invoiceCalc.js';
	import { products, customers } from '$lib/stores/data.js';

	onMount(() => {
		products.syncWithBackend();
	});

	let search = '';
	let selectedCategory = 'Semua';
	let showAddModal = false;
	let showEditModal = false;
	let showSendToPtModal = false;

	// Toast state
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

	// Product form state
	let productForm = {
		id: '',
		name: '',
		category: 'Jasa',
		price: 0,
		unit: 'Unit'
	};

	// Send to PT state
	let activeProductForPt = null;
	let targetPtName = '';
	let targetQty = 1;

	// Categories list derived from current products
	$: categories = ['Semua', ...new Set($products.map((p) => p.category).filter(Boolean))];

	$: filtered = $products.filter((p) => {
		const matchSearch =
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.category.toLowerCase().includes(search.toLowerCase());
		const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
		return matchSearch && matchCategory;
	});

	function openAddModal() {
		productForm = {
			id: '',
			name: '',
			category: 'Jasa',
			price: 500000,
			unit: 'Unit'
		};
		showAddModal = true;
	}

	function openEditModal(prod) {
		productForm = { ...prod };
		showEditModal = true;
	}

	function handleSaveNewProduct() {
		if (!productForm.name.trim() || !productForm.price) {
			alert('Mohon isi nama produk dan harga.');
			return;
		}
		products.addProduct({
			name: productForm.name.trim(),
			category: productForm.category,
			price: Number(productForm.price),
			unit: productForm.unit || 'Unit'
		});
		showAddModal = false;
		showToast(`✨ Produk "${productForm.name}" berhasil ditambahkan!`);
	}

	function handleSaveEditProduct() {
		if (!productForm.name.trim() || !productForm.price) {
			alert('Mohon isi nama produk dan harga.');
			return;
		}
		products.updateProduct(productForm.id, {
			name: productForm.name.trim(),
			category: productForm.category,
			price: Number(productForm.price),
			unit: productForm.unit || 'Unit'
		});
		showEditModal = false;
		showToast(`✏️ Perubahan produk berhasil disimpan!`);
	}

	function handleDeleteProduct(prod) {
		if (confirm(`Yakin ingin menghapus produk "${prod.name}"?`)) {
			products.deleteProduct(prod.id);
			showToast(`🗑️ Produk "${prod.name}" telah dihapus.`);
		}
	}

	function openSendToPtModal(prod) {
		activeProductForPt = prod;
		targetPtName = $customers.length > 0 ? $customers[0].name : '';
		targetQty = 1;
		showSendToPtModal = true;
	}

	function executeSendToPt() {
		if (!targetPtName) {
			alert('Pilih atau masukkan nama PT tujuan.');
			return;
		}
		showSendToPtModal = false;
		const query = new URLSearchParams({
			client: targetPtName,
			productId: activeProductForPt.id,
			qty: String(targetQty),
			autoSend: 'true'
		});
		goto(`/invoices/create?${query.toString()}`);
	}

	function useInInvoice(prod) {
		const query = new URLSearchParams({
			productId: prod.id,
			qty: '1'
		});
		goto(`/invoices/create?${query.toString()}`);
	}
</script>

<svelte:head>
	<title>Katalog Produk & Jasa — Invoicely</title>
</svelte:head>

<AppShell title="Katalog Produk & Jasa">
	<!-- Header & Quick Action -->
	<div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-card p-5">
		<div>
			<h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Katalog Produk & Jasa</h2>
			<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
				Kelola produk yang sering Anda tagihkan. Cukup 1 klik untuk langsung menyusun invoice dan mengirimkannya ke PT terkait.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="btn-primary shrink-0 shadow-md shadow-primary/25"
				on:click={openAddModal}
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<span>+ Tambah Produk Baru</span>
			</button>
		</div>
	</div>

	<!-- Search & Category Filters -->
	<div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<!-- Search box -->
		<div class="relative flex-1 sm:max-w-xs">
			<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				class="field-input pl-9 text-xs sm:text-sm"
				placeholder="Cari nama produk / kategori..."
				bind:value={search}
			/>
		</div>

		<!-- Category Filter Pills -->
		<div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
			{#each categories as cat}
				<button
					type="button"
					class="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition border
						{selectedCategory === cat
							? 'bg-primary text-white border-primary shadow-xs'
							: 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}"
					on:click={() => (selectedCategory = cat)}
				>
					{cat}
				</button>
			{/each}
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
				📦
			</div>
			<p class="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada produk yang cocok</p>
			<p class="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian Anda atau tambahkan produk baru.</p>
			<button class="btn-primary mt-3 text-xs" on:click={openAddModal}>+ Tambah Produk Baru</button>
		</div>
	{:else}
		<div class="card overflow-hidden shadow-soft">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
						<th class="p-4">Nama Produk / Layanan</th>
						<th class="p-4">Kategori & Satuan</th>
						<th class="p-4 text-right">Harga Standar</th>
						<th class="p-4 text-right">Aksi Cepat</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
					{#each filtered as p}
						<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
							<td class="p-4">
								<div class="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
								<div class="text-[11px] text-slate-400 mt-0.5">ID: {p.id}</div>
							</td>
							<td class="p-4">
								<div class="flex items-center gap-1.5 flex-wrap">
									<span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary dark:bg-primary-500/20 dark:text-primary-300">
										{p.category}
									</span>
									<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
										{p.unit || 'Unit'}
									</span>
								</div>
							</td>
							<td class="p-4 text-right font-extrabold text-slate-900 dark:text-white text-base">
								{formatCurrency(p.price)}
							</td>
							<td class="p-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<!-- Kirim Langsung ke PT -->
									<button
										type="button"
										class="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 transition shadow-xs"
										on:click={() => openSendToPtModal(p)}
										title="Buat invoice produk ini dan kirim ke PT"
									>
										<span>🚀 Kirim ke PT</span>
									</button>

									<!-- Pakai di Invoice -->
									<button
										type="button"
										class="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary-50 hover:text-primary dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary-500/20 dark:hover:text-primary-300 transition"
										on:click={() => useInInvoice(p)}
										title="Masukkan ke form invoice baru"
									>
										<span>+ Invoice</span>
									</button>

									<!-- Edit -->
									<button
										type="button"
										class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
										on:click={() => openEditModal(p)}
										title="Edit produk"
										aria-label="Edit produk"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>

									<!-- Delete -->
									<button
										type="button"
										class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
										on:click={() => handleDeleteProduct(p)}
										title="Hapus produk"
										aria-label="Hapus produk"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Modal Tambah Produk -->
	{#if showAddModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
			<div class="w-full max-w-md card p-6 shadow-2xl animate-in zoom-in-95">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">Tambah Produk / Jasa</h3>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						on:click={() => (showAddModal = false)}
					>
						✕
					</button>
				</div>

				<div class="mt-4 space-y-3.5">
					<div>
						<label class="field-label" for="add-prod-name">Nama Produk / Jasa *</label>
						<input
							id="add-prod-name"
							class="field-input"
							bind:value={productForm.name}
							placeholder="cth. Jasa Pembuatan Website, Maintenance Cloud..."
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="field-label" for="add-prod-cat">Kategori</label>
							<select id="add-prod-cat" class="field-select" bind:value={productForm.category}>
								<option value="Jasa">Jasa</option>
								<option value="Desain">Desain</option>
								<option value="Development">Development</option>
								<option value="Konsultasi">Konsultasi</option>
								<option value="DevOps">DevOps</option>
								<option value="Maintenance">Maintenance</option>
								<option value="Barang Fisik">Barang Fisik</option>
							</select>
						</div>
						<div>
							<label class="field-label" for="add-prod-unit">Satuan</label>
							<select id="add-prod-unit" class="field-select" bind:value={productForm.unit}>
								<option value="Unit">Unit</option>
								<option value="Paket">Paket</option>
								<option value="Proyek">Proyek</option>
								<option value="Jam">Jam</option>
								<option value="Bulan">Bulan</option>
								<option value="Hari">Hari</option>
								<option value="Pcs">Pcs</option>
							</select>
						</div>
					</div>

					<div>
						<label class="field-label" for="add-prod-price">Harga Standar (Rp) *</label>
						<input
							id="add-prod-price"
							type="number"
							min="0"
							step="50000"
							class="field-input text-base font-bold"
							bind:value={productForm.price}
						/>
						<p class="text-[11px] text-slate-400 mt-1">
							Format: {formatCurrency(Number(productForm.price) || 0)}
						</p>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
					<button type="button" class="btn-ghost text-xs" on:click={() => (showAddModal = false)}>Batal</button>
					<button type="button" class="btn-primary text-xs" on:click={handleSaveNewProduct}>Simpan Produk</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal Edit Produk -->
	{#if showEditModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
			<div class="w-full max-w-md card p-6 shadow-2xl animate-in zoom-in-95">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">Edit Produk / Jasa</h3>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						on:click={() => (showEditModal = false)}
					>
						✕
					</button>
				</div>

				<div class="mt-4 space-y-3.5">
					<div>
						<label class="field-label" for="edit-prod-name">Nama Produk / Jasa *</label>
						<input
							id="edit-prod-name"
							class="field-input"
							bind:value={productForm.name}
						/>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div>
							<label class="field-label" for="edit-prod-cat">Kategori</label>
							<select id="edit-prod-cat" class="field-select" bind:value={productForm.category}>
								<option value="Jasa">Jasa</option>
								<option value="Desain">Desain</option>
								<option value="Development">Development</option>
								<option value="Konsultasi">Konsultasi</option>
								<option value="DevOps">DevOps</option>
								<option value="Maintenance">Maintenance</option>
								<option value="Barang Fisik">Barang Fisik</option>
							</select>
						</div>
						<div>
							<label class="field-label" for="edit-prod-unit">Satuan</label>
							<select id="edit-prod-unit" class="field-select" bind:value={productForm.unit}>
								<option value="Unit">Unit</option>
								<option value="Paket">Paket</option>
								<option value="Proyek">Proyek</option>
								<option value="Jam">Jam</option>
								<option value="Bulan">Bulan</option>
								<option value="Hari">Hari</option>
								<option value="Pcs">Pcs</option>
							</select>
						</div>
					</div>

					<div>
						<label class="field-label" for="edit-prod-price">Harga Standar (Rp) *</label>
						<input
							id="edit-prod-price"
							type="number"
							min="0"
							step="50000"
							class="field-input text-base font-bold"
							bind:value={productForm.price}
						/>
						<p class="text-[11px] text-slate-400 mt-1">
							Format: {formatCurrency(Number(productForm.price) || 0)}
						</p>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
					<button type="button" class="btn-ghost text-xs" on:click={() => (showEditModal = false)}>Batal</button>
					<button type="button" class="btn-primary text-xs" on:click={handleSaveEditProduct}>Simpan Perubahan</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal Kirim ke PT Cepat -->
	{#if showSendToPtModal && activeProductForPt}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
			<div class="w-full max-w-md card p-6 shadow-2xl animate-in zoom-in-95">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
					<div class="flex items-center gap-2">
						<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
							🚀
						</span>
						<h3 class="text-lg font-bold text-slate-900 dark:text-white">Auto Kirim ke PT</h3>
					</div>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						on:click={() => (showSendToPtModal = false)}
					>
						✕
					</button>
				</div>

				<div class="mt-4 space-y-4">
					<div class="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
						<div class="text-xs text-slate-400">Produk yang Dipilih:</div>
						<div class="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{activeProductForPt.name}</div>
						<div class="text-primary font-black text-sm mt-1">{formatCurrency(activeProductForPt.price)} / {activeProductForPt.unit || 'Unit'}</div>
					</div>

					<div>
						<label class="field-label" for="pt-target-select">Pilih PT / Klien Penerima *</label>
						{#if $customers.length > 0}
							<select id="pt-target-select" class="field-select mb-2" bind:value={targetPtName}>
								{#each $customers as c}
									<option value={c.name}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
								{/each}
							</select>
						{/if}
						<input
							class="field-input text-xs"
							placeholder="Atau ketik nama PT baru..."
							bind:value={targetPtName}
						/>
					</div>

					<div>
						<label class="field-label" for="pt-target-qty">Jumlah / Qty</label>
						<input
							id="pt-target-qty"
							type="number"
							min="1"
							class="field-input"
							bind:value={targetQty}
						/>
					</div>

					<div class="rounded-xl bg-emerald-50/80 p-3 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
						💡 <strong>Alur Otomatis:</strong> Aplikasi akan menyiapkan invoice untuk <strong>{targetPtName || 'PT yang dipilih'}</strong> dan langsung memunculkan opsi pengiriman WhatsApp/Email siap kirim.
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
					<button type="button" class="btn-ghost text-xs" on:click={() => (showSendToPtModal = false)}>Batal</button>
					<button type="button" class="btn-primary text-xs flex items-center gap-1.5" on:click={executeSendToPt}>
						<span>Lanjutkan & Kirim ke PT</span>
						<span>&rarr;</span>
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Toast Notification -->
	{#if toastVisible}
		<div class="fixed bottom-6 right-6 z-50 toast-enter">
			<div class="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-slate-900 border border-slate-700 dark:border-slate-200">
				<span>{toastMessage}</span>
				<button
					type="button"
					class="text-slate-400 hover:text-white dark:hover:text-slate-900 ml-2"
					on:click={() => (toastVisible = false)}
				>
					✕
				</button>
			</div>
		</div>
	{/if}
</AppShell>
