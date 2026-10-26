<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl bg-white p-8 text-slate-900 shadow-paper rounded-2xl border border-slate-200" id="invoice-preview">
	<!-- Bold Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start gap-4">
		<div>
			<h1 class="text-4xl sm:text-5xl font-black uppercase leading-none tracking-tight text-slate-950">INVOICE</h1>
			<p class="mt-2 text-sm font-bold text-primary">#{invoice.number || '000001'} · {invoice.business?.name || 'Nama Bisnis'}</p>
			<p class="text-xs text-slate-400">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
		</div>
		<div class="sm:text-right space-y-1 text-xs">
			<p class="text-slate-500">Tanggal: <strong class="text-slate-900">{invoice.date || '-'}</strong></p>
			<p class="text-slate-500">Jatuh Tempo: <strong class="text-slate-900">{invoice.dueDate || '-'}</strong></p>
		</div>
	</div>

	<!-- Recipient -->
	<div class="mt-8 border-t-2 border-slate-950 pt-4 text-sm flex justify-between items-start">
		<div>
			<p class="text-xs font-black uppercase tracking-wider text-slate-400">Ditagihkan Kepada</p>
			<p class="mt-1 font-black text-lg text-slate-900">{invoice.client?.name || 'Nama Klien'}</p>
			{#if invoice.client?.address}
				<p class="text-xs text-slate-500">{invoice.client.address}</p>
			{/if}
			{#if invoice.client?.email}
				<p class="text-xs text-slate-500">{invoice.client.email}</p>
			{/if}
		</div>
	</div>

	<!-- Items List with Bold Separators -->
	<div class="mt-8 space-y-3">
		{#each invoice.items || [] as item}
			<div class="flex items-center justify-between border-b-2 border-slate-950 pb-3 text-sm">
				<div>
					<p class="font-bold text-slate-950">{item.description || '-'}</p>
					<p class="text-xs text-slate-500">{item.qty} × {formatCurrency(item.price, invoice.currency)}</p>
				</div>
				<span class="font-black text-slate-950 text-base">{formatCurrency(item.qty * item.price, invoice.currency)}</span>
			</div>
		{/each}
	</div>

	<!-- Totals Breakdown -->
	<div class="mt-6 flex flex-col sm:flex-row justify-between gap-6 pt-2">
		<div class="flex-1">
			{#if invoice.notes}
				<div class="rounded-xl bg-slate-100 p-4 text-xs text-slate-700">
					<p class="font-bold text-slate-900 mb-1">Catatan Pembayaran:</p>
					<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
				</div>
			{/if}
		</div>

		<div class="w-full sm:w-64 space-y-1.5 text-sm">
			<div class="flex justify-between text-slate-500">
				<span>Subtotal</span>
				<span>{formatCurrency(totals.subtotal, invoice.currency)}</span>
			</div>
			{#if totals.discountAmount > 0}
				<div class="flex justify-between text-emerald-600 font-medium">
					<span>Diskon {invoice.discount?.type === 'percent' ? `(${invoice.discount.value}%)` : ''}</span>
					<span>-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
				</div>
			{/if}
			{#if invoice.taxRate > 0}
				<div class="flex justify-between text-slate-500">
					<span>Pajak ({invoice.taxRate}%)</span>
					<span>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Huge Total Block -->
	<div class="mt-6 rounded-2xl bg-slate-950 p-6 text-white flex items-center justify-between shadow-lg">
		<div>
			<p class="text-xs uppercase tracking-widest text-slate-400 font-bold">Total Tagihan</p>
			<p class="text-3xl sm:text-4xl font-black mt-1">{formatCurrency(totals.total, invoice.currency)}</p>
		</div>
		<span class="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
			LUNAS / TEMPO
		</span>
	</div>
</div>
