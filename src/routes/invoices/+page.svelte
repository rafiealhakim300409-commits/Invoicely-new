<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AppShell from '$lib/components/AppShell.svelte';
	import { formatCurrency } from '$lib/utils/invoiceCalc.js';
	import { invoices, customers } from '$lib/stores/data.js';
	import { downloadBackendPdf, testBackendConnection, mapToApiStatus, sendInvoiceEmailReminder } from '$lib/services/api.js';

	let search = '';
	let activeTab = 'all';
	let selectedInvoiceForStatus = null;
	let isSyncing = false;
	let sendingEmailId = null;
	let backendStatus = null; // 'online' | 'offline' | null

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

	onMount(async () => {
		const test = await testBackendConnection();
		backendStatus = test.success ? 'online' : 'offline';
	});

	async function handleSyncBackend() {
		isSyncing = true;
		showToast('⏳ Menyinkronkan daftar invoice...');
		const result = await invoices.syncWithBackend();
		isSyncing = false;
		if (result.success) {
			backendStatus = 'online';
			showToast(`✨ Sinkronisasi berhasil! ${result.count} invoice terhubung.`);
		} else {
			backendStatus = 'offline';
			showToast(`⚠️ Sinkronisasi offline: ${result.error || 'Menggunakan data lokal'}.`);
		}
	}

	const statusClass = {
		paid: 'badge-paid cursor-pointer hover:opacity-80 transition',
		unpaid: 'badge-unpaid cursor-pointer hover:opacity-80 transition',
		overdue: 'badge-overdue cursor-pointer hover:opacity-80 transition',
		draft: 'badge-draft cursor-pointer hover:opacity-80 transition',
		Lunas: 'badge-paid cursor-pointer hover:opacity-80 transition',
		'Belum Dibayar': 'badge-unpaid cursor-pointer hover:opacity-80 transition',
		Terkirim: 'badge-overdue cursor-pointer hover:opacity-80 transition',
		Draft: 'badge-draft cursor-pointer hover:opacity-80 transition'
	};

	const statusLabel = {
		paid: 'Lunas',
		unpaid: 'Belum Dibayar',
		overdue: 'Terkirim',
		draft: 'Draft',
		Lunas: 'Lunas',
		'Belum Dibayar': 'Belum Dibayar',
		Terkirim: 'Terkirim',
		Draft: 'Draft'
	};

	$: filtered = $invoices.filter((i) => {
		const clientName = typeof i.client === 'string' ? i.client : (i.client?.name || '');
		const matchSearch =
			clientName.toLowerCase().includes(search.toLowerCase()) ||
			i.number.toLowerCase().includes(search.toLowerCase());
		if (activeTab === 'all') return matchSearch;
		if (activeTab === 'paid') return matchSearch && ['paid', 'Lunas'].includes(i.status);
		if (activeTab === 'unpaid') return matchSearch && ['unpaid', 'Belum Dibayar'].includes(i.status);
		if (activeTab === 'overdue') return matchSearch && ['overdue', 'Terkirim'].includes(i.status);
		if (activeTab === 'draft') return matchSearch && ['draft', 'Draft'].includes(i.status);
		return matchSearch;
	});

	function getClientName(inv) {
		return typeof inv.client === 'string' ? inv.client : (inv.client?.name || 'Klien');
	}

	function getClientPhone(inv) {
		if (inv.client?.phone) return inv.client.phone;
		// Try to look up by name in customers store
		const clientName = getClientName(inv);
		const found = $customers.find((c) => c.name.toLowerCase() === clientName.toLowerCase());
		return found?.phone || '';
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

	function sendWhatsAppReminder(inv) {
		const clientName = getClientName(inv);
		let phone = cleanPhoneNumber(getClientPhone(inv));

		if (!phone) {
			const inputPhone = prompt(`Masukkan nomor WhatsApp untuk ${clientName}:`, '08');
			if (!inputPhone) return;
			phone = cleanPhoneNumber(inputPhone);
		}

		const bizName = inv.business?.name || 'Bisnis Anda';
		const amount = formatCurrency(inv.amount || 0, inv.currency || 'IDR');
		const msg = [
			`Halo Tim Finance *${clientName}*,`,
			``,
			`Kami dari *${bizName}* ingin menginformasikan pengingat tagihan faktur:`,
			`📄 *No. Invoice:* ${inv.number}`,
			`💰 *Total Tagihan:* *${amount}*`,
			`⏳ *Jatuh Tempo:* ${inv.dueDate || '-'}`,
			`📊 *Status:* ${statusLabel[inv.status] || inv.status}`,
			``,
			inv.notes ? `📌 *Catatan Pembayaran:*\n${inv.notes}\n` : null,
			`Mohon kesediaannya untuk konfirmasi apabila pembayaran telah diproses. Terima kasih banyak atas kerjasamanya! 🙏`
		]
			.filter(Boolean)
			.join('\n');

		const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
		window.open(url, '_blank');
		showToast(`💬 Pengingat WhatsApp dibuka untuk ${clientName}!`);
	}

	async function handleSendEmailReminder(inv) {
		const invId = inv.backendId || inv.id;
		sendingEmailId = inv.id;
		showToast(`⏳ Mengirim email pengingat untuk ${inv.number}...`);
		try {
			const res = await sendInvoiceEmailReminder(invId);
			showToast(`✨ ${res.message || 'Email pengingat berhasil dikirim!'}`);
		} catch (err) {
			console.error('Error sending email reminder:', err);
			showToast(`⚠️ ${err.message || 'Gagal mengirim email pengingat'}`);
		} finally {
			sendingEmailId = null;
		}
	}

	function handleDuplicate(id) {
		const dup = invoices.duplicateInvoice(id);
		if (dup) {
			showToast(`✨ Invoice berhasil diduplikasi sebagai ${dup.number}!`);
			goto(`/invoices/create?id=${dup.id}`);
		}
	}

	function handleDelete(inv) {
		if (confirm(`Yakin ingin menghapus invoice ${inv.number}?`)) {
			invoices.deleteInvoice(inv.id);
			showToast(`🗑️ Invoice ${inv.number} telah dihapus.`);
		}
	}

	function changeStatus(id, newStatus) {
		invoices.updateInvoiceStatus(id, newStatus);
		selectedInvoiceForStatus = null;
		showToast(`Status invoice diubah menjadi ${statusLabel[newStatus]}!`);
	}

	function exportCSV() {
		if ($invoices.length === 0) {
			alert('Belum ada invoice untuk diekspor.');
			return;
		}

		const headers = ['No Invoice', 'Klien / PT', 'Tanggal Terbit', 'Jatuh Tempo', 'Total Tagihan', 'Mata Uang', 'Status'];
		const rows = $invoices.map((i) => [
			`"${i.number}"`,
			`"${getClientName(i).replace(/"/g, '""')}"`,
			`"${i.date || ''}"`,
			`"${i.dueDate || ''}"`,
			i.amount || 0,
			`"${i.currency || 'IDR'}"`,
			`"${statusLabel[i.status] || i.status}"`
		]);

		const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', `rekap-invoices-${new Date().toISOString().split('T')[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showToast('📊 Rekap seluruh invoice berhasil diunduh (CSV)!');
	}
</script>

<svelte:head><title>Kelola Invoice — Invoicely</title></svelte:head>

<AppShell title="Daftar Invoice">
	<!-- Top Bar & Search -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<!-- Filter Tabs -->
		<div class="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'all' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'all')}
			>
				Semua ({$invoices.length})
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'unpaid' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'unpaid')}
			>
				Belum Bayar
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'paid' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'paid')}
			>
				Lunas
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'overdue' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'overdue')}
			>
				Terlambat
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold transition
					{activeTab === 'draft' ? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white' : 'text-slate-500 hover:text-slate-700'}"
				on:click={() => (activeTab = 'draft')}
			>
				Draft
			</button>
		</div>

		<!-- Search Input & CTA Buttons -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative flex-1 sm:w-60">
				<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					class="field-input pl-9 text-xs sm:text-sm"
					placeholder="Cari no. invoice / klien..."
					bind:value={search}
				/>
			</div>

			<!-- Ekspor CSV -->
			<button
				type="button"
				class="btn-secondary text-xs sm:text-sm shrink-0 py-2 px-3"
				on:click={exportCSV}
				title="Unduh rekap seluruh invoice ke Excel / CSV"
			>
				<span>📊 Rekap CSV</span>
			</button>

			<!-- Sinkronkan Data -->
			<button
				type="button"
				class="btn-secondary text-xs sm:text-sm shrink-0 py-2 px-3 inline-flex items-center gap-1.5"
				on:click={handleSyncBackend}
				disabled={isSyncing}
				title="Sinkronkan daftar faktur"
			>
				{#if isSyncing}
					<svg class="h-3.5 w-3.5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>Sinkronisasi...</span>
				{:else}
					<span>🔄 Sinkronkan</span>
				{/if}
			</button>

			<a href="/invoices/create" class="btn-primary shrink-0 text-xs sm:text-sm shadow-md shadow-primary/25">
				+ Buat Invoice
			</a>
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Tidak ada invoice yang cocok</p>
			<p class="text-xs text-slate-500">Coba kata kunci pencarian lain atau buat invoice baru.</p>
			<a href="/invoices/create" class="btn-primary mt-2 text-xs">+ Buat Invoice Baru</a>
		</div>
	{:else}
		<!-- Desktop table -->
		<div class="card hidden overflow-hidden md:block shadow-soft">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
						<th class="p-4">No. Invoice</th>
						<th class="p-4">Klien / PT</th>
						<th class="p-4">Tanggal</th>
						<th class="p-4">Status (Klik Ubah)</th>
						<th class="p-4 text-right">Jumlah Tagihan</th>
						<th class="p-4 text-right">Aksi Cepat</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
					{#each filtered as inv}
						<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
							<td class="p-4 font-mono font-bold text-slate-900 dark:text-white">
								<a href="/invoices/create?id={inv.id}" class="hover:text-primary transition">
									{inv.number}
								</a>
							</td>
							<td class="p-4">
								<div class="font-bold text-slate-800 dark:text-slate-200">{getClientName(inv)}</div>
								{#if getClientPhone(inv)}
									<div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
										WA: {getClientPhone(inv)}
									</div>
								{/if}
							</td>
							<td class="p-4 text-xs text-slate-500 dark:text-slate-400">
								<div>Terbit: {inv.date || '-'}</div>
								<div class="text-slate-400">Tempo: {inv.dueDate || '-'}</div>
							</td>
							<td class="p-4">
								<div class="relative inline-block">
									<button
										type="button"
										class={statusClass[inv.status] || 'badge-draft'}
										on:click={() => (selectedInvoiceForStatus = selectedInvoiceForStatus === inv.id ? null : inv.id)}
										title="Klik untuk ubah status pembayaran"
									>
										<span>{statusLabel[inv.status] || inv.status}</span>
										<span class="text-[10px] ml-1">▾</span>
									</button>

									{#if selectedInvoiceForStatus === inv.id}
										<div class="absolute left-0 mt-1 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-in fade-in-50">
											<div class="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Ubah Status (API):</div>
											<button
												type="button"
												class="w-full text-left rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
												on:click={() => changeStatus(inv.id, 'Lunas')}
											>
												✓ Lunas
											</button>
											<button
												type="button"
												class="w-full text-left rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/20"
												on:click={() => changeStatus(inv.id, 'Belum Dibayar')}
											>
												⏳ Belum Dibayar
											</button>
											<button
												type="button"
												class="w-full text-left rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/20"
												on:click={() => changeStatus(inv.id, 'Terkirim')}
											>
												📤 Terkirim
											</button>
											<button
												type="button"
												class="w-full text-left rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
												on:click={() => changeStatus(inv.id, 'Draft')}
											>
												Draft
											</button>
										</div>
									{/if}
								</div>
							</td>
							<td class="p-4 text-right font-extrabold text-slate-900 dark:text-white">
								{formatCurrency(inv.amount || 0, inv.currency || 'IDR')}
							</td>
							<td class="p-4 text-right">
								<div class="flex items-center justify-end gap-1.5">
									<!-- Pengingat WA jika belum lunas -->
									{#if !['paid', 'Lunas'].includes(inv.status)}
										<button
											type="button"
											class="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 transition"
											on:click={() => sendWhatsAppReminder(inv)}
											title="Kirim pengingat ramah ke WhatsApp PT"
										>
											<span>💬 WA</span>
										</button>

										<button
											type="button"
											class="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 transition disabled:opacity-50"
											on:click={() => handleSendEmailReminder(inv)}
											disabled={sendingEmailId === inv.id}
											title="Kirim email pengingat jatuh tempo ke klien"
										>
											{#if sendingEmailId === inv.id}
												<span>⏳ Mengirim...</span>
											{:else}
												<span>✉️ Email</span>
											{/if}
										</button>
									{/if}

									<!-- Unduh PDF Resmi -->
									<button
										type="button"
										class="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary dark:hover:bg-primary-500/10 transition"
										on:click={() => downloadBackendPdf(inv.backendId || inv.id, `${inv.number}.pdf`)}
										title="Unduh PDF Resmi"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
									</button>

									<!-- Buka & Edit -->
									<a
										href="/invoices/create?id={inv.id}"
										class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition"
										title="Buka / Edit Invoice"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</a>

									<!-- Duplikat -->
									<button
										type="button"
										class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
										on:click={() => handleDuplicate(inv.id)}
										title="Duplikat invoice ini"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
										</svg>
									</button>

									<!-- Hapus -->
									<button
										type="button"
										class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
										on:click={() => handleDelete(inv)}
										title="Hapus invoice"
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

		<!-- Mobile cards -->
		<div class="grid grid-cols-1 gap-3 md:hidden">
			{#each filtered as inv}
				<div class="card p-4 space-y-3">
					<div class="flex items-center justify-between">
						<a href="/invoices/create?id={inv.id}" class="font-mono font-bold text-slate-900 dark:text-white hover:text-primary">
							{inv.number}
						</a>
						<span class={statusClass[inv.status] || 'badge-draft'}>
							{statusLabel[inv.status] || inv.status}
						</span>
					</div>

					<div>
						<p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{getClientName(inv)}</p>
						<p class="text-xs text-slate-400 mt-0.5">Tempo: {inv.dueDate || '-'}</p>
					</div>

					<div class="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800">
						<span class="text-base font-extrabold text-slate-900 dark:text-white">
							{formatCurrency(inv.amount || 0, inv.currency || 'IDR')}
						</span>

						<div class="flex items-center gap-1">
							{#if !['paid', 'Lunas'].includes(inv.status)}
								<button
									type="button"
									class="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
									on:click={() => sendWhatsAppReminder(inv)}
									title="Ingatkan via WhatsApp"
								>
									WA
								</button>
								<button
									type="button"
									class="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 disabled:opacity-50"
									on:click={() => handleSendEmailReminder(inv)}
									disabled={sendingEmailId === inv.id}
									title="Kirim Pengingat Email"
								>
									{sendingEmailId === inv.id ? '...' : 'Email'}
								</button>
							{/if}
							<button
								type="button"
								class="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
								on:click={() => downloadBackendPdf(inv.backendId || inv.id, `${inv.number}.pdf`)}
								title="Unduh PDF"
							>
								PDF
							</button>
							<a
								href="/invoices/create?id={inv.id}"
								class="btn-primary text-[11px] py-1 px-2.5"
							>
								Buka
							</a>
						</div>
					</div>
				</div>
			{/each}
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
