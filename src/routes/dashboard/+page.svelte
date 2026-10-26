<script>
	import AppShell from '$lib/components/AppShell.svelte';
	import { formatCurrency } from '$lib/utils/invoiceCalc.js';
	import { invoices } from '$lib/stores/data.js';
	import { auth } from '$lib/stores/auth.js';

	$: totalCount = $invoices.length;
	$: unpaidInvoices = $invoices.filter((i) => i.status === 'unpaid');
	$: unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

	$: paidInvoices = $invoices.filter((i) => i.status === 'paid');
	$: paidTotal = paidInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

	$: overdueInvoices = $invoices.filter((i) => i.status === 'overdue');
	$: overdueTotal = overdueInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

	$: recent = $invoices.slice(0, 6);

	$: stats = [
		{
			label: 'Total Invoice',
			value: String(totalCount),
			change: `${totalCount} invoice tercatat`,
			icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			color: 'text-primary bg-primary-50 dark:bg-primary-500/15'
		},
		{
			label: 'Belum Dibayar',
			value: formatCurrency(unpaidTotal),
			change: `${unpaidInvoices.length} invoice menunggu`,
			icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15'
		},
		{
			label: 'Sudah Dibayar',
			value: formatCurrency(paidTotal),
			change: `${paidInvoices.length} invoice lunas`,
			icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15'
		},
		{
			label: 'Jatuh Tempo',
			value: formatCurrency(overdueTotal),
			change: `${overdueInvoices.length} invoice perlu ditagih`,
			icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
			color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/15'
		}
	];

	const statusClass = { paid: 'badge-paid', unpaid: 'badge-unpaid', overdue: 'badge-overdue', draft: 'badge-draft' };
	const statusLabel = { paid: 'Lunas', unpaid: 'Belum Bayar', overdue: 'Terlambat', draft: 'Draft' };

	function getClientName(inv) {
		return typeof inv.client === 'string' ? inv.client : (inv.client?.name || 'Klien');
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
	}
</script>

<svelte:head><title>Dashboard Ringkasan — Invoicely</title></svelte:head>

<AppShell title="Dashboard">
	<!-- TOP DASHBOARD HEADER SECTION (RAPIH DI ATAS) -->
	<div class="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
		<!-- Background decorative glow -->
		<div class="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>

		<!-- Top Header Content -->
		<div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
			<div>
				<div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur mb-3 border border-white/10">
					<span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
					<span>Selamat datang kembali, {$auth ? $auth.name : 'Budi Santoso'} 👋</span>
				</div>
				<h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
					Ringkasan Tagihan & Keuangan Bisnis
				</h2>
				<p class="mt-1 text-xs sm:text-sm text-indigo-200/80">
					{$auth ? $auth.businessName : 'Bisnis Kamu'} · Pantau perputaran invoice dan pembayaran klien secara real-time.
				</p>
			</div>

			<!-- Top Header Quick Actions -->
			<div class="flex flex-wrap items-center gap-3">
				<button
					type="button"
					on:click={exportCSV}
					class="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
					title="Unduh Rekap Excel / CSV"
				>
					<span>📊 Rekap CSV</span>
				</button>
				<a
					href="/customers"
					class="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
				>
					<span>👥 Data PT</span>
				</a>
				<a
					href="/invoices/create"
					class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/30 hover:scale-105 transition"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
					</svg>
					<span>+ Buat Invoice Baru</span>
				</a>
			</div>
		</div>

		<!-- Integrated Stats Metric Cards (Di Bagian Atas Header) -->
		<div class="relative z-10 pt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each stats as s}
				<div class="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10 hover:bg-white/15 transition">
					<div class="flex items-center justify-between">
						<p class="text-[11px] font-bold uppercase tracking-wider text-indigo-200/90">{s.label}</p>
						<span class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d={s.icon} />
							</svg>
						</span>
					</div>
					<p class="mt-2 text-2xl font-black text-white tracking-tight">{s.value}</p>
					<p class="mt-1 text-[11px] text-indigo-200/70">{s.change}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Recent Invoices & Quick Navigation (Di Bawah Header) -->
	<div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
		<!-- Recent invoices table -->
		<div class="card overflow-hidden shadow-soft">
			<div class="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
				<div>
					<h3 class="font-bold text-slate-900 dark:text-white">Invoice Terbaru</h3>
					<p class="text-xs text-slate-400">Aktivitas penagihan terakhir dari sistem</p>
				</div>
				<a href="/invoices" class="text-xs font-semibold text-primary hover:underline">
					Lihat semua invoice ({$invoices.length}) &rarr;
				</a>
			</div>

			{#if recent.length === 0}
				<div class="empty-state m-5">
					<p class="text-sm text-slate-500">Belum ada invoice yang dibuat.</p>
					<a href="/invoices/create" class="btn-primary mt-2">+ Buat Invoice Pertama</a>
				</div>
			{:else}
				<ul class="divide-y divide-slate-100 dark:divide-slate-800">
					{#each recent as inv}
						<li class="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition gap-2">
							<div>
								<a href="/invoices/create?id={inv.id}" class="text-sm font-bold text-slate-900 dark:text-white hover:text-primary">
									{inv.number}
								</a>
								<p class="text-xs text-slate-500 dark:text-slate-400">{getClientName(inv)} · {inv.date || '-'}</p>
							</div>
							<div class="flex items-center justify-between sm:justify-end gap-3">
								<span class={statusClass[inv.status] || 'badge-draft'}>{statusLabel[inv.status] || inv.status}</span>
								<span class="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(inv.amount || 0, inv.currency || 'IDR')}</span>
								<a href="/invoices/create?id={inv.id}" class="text-xs text-primary font-semibold hover:underline">
									Buka &rarr;
								</a>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Quick Actions Card -->
		<div class="space-y-4">
			<div class="card p-5">
				<h3 class="font-bold text-slate-900 dark:text-white mb-3">Aksi Cepat Menu</h3>
				<div class="space-y-2.5">
					<a
						href="/invoices/create"
						class="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-primary-50/60 dark:border-slate-800 dark:hover:bg-primary-500/10 transition group"
					>
						<div class="flex items-center gap-3">
							<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary font-bold dark:bg-primary-500/20">
								+
							</span>
							<div>
								<p class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Buat Invoice Baru</p>
								<p class="text-[11px] text-slate-400">Pilih dari 10 template & auto kirim PT</p>
							</div>
						</div>
						<span class="text-xs text-slate-400">&rarr;</span>
					</a>

					<a
						href="/customers"
						class="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition group"
					>
						<div class="flex items-center gap-3">
							<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
								👥
							</span>
							<div>
								<p class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Tabel Pelanggan / PT</p>
								<p class="text-[11px] text-slate-400">Kelola kontak & status tagihan</p>
							</div>
						</div>
						<span class="text-xs text-slate-400">&rarr;</span>
					</a>

					<a
						href="/products"
						class="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition group"
					>
						<div class="flex items-center gap-3">
							<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
								📦
							</span>
							<div>
								<p class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Katalog Produk & Jasa</p>
								<p class="text-[11px] text-slate-400">Kelola item harga & layanan</p>
							</div>
						</div>
						<span class="text-xs text-slate-400">&rarr;</span>
					</a>

					<a
						href="/invoices"
						class="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition group"
					>
						<div class="flex items-center gap-3">
							<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
								📊
							</span>
							<div>
								<p class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Rekap & Pengingat WA</p>
								<p class="text-[11px] text-slate-400">Follow-up WhatsApp & ekspor CSV</p>
							</div>
						</div>
						<span class="text-xs text-slate-400">&rarr;</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</AppShell>
