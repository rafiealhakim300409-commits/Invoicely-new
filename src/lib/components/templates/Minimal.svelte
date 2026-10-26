<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl bg-white p-10 text-slate-800 shadow-paper rounded-2xl border border-slate-100" id="invoice-preview">
	<!-- Minimalist Clean Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-8">
		<div>
			<h1 class="text-xl font-semibold text-slate-900 tracking-tight">{invoice.business?.name || 'Nama Bisnis'}</h1>
			<p class="text-xs text-slate-400 mt-1">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
		</div>
		<div class="sm:text-right">
			<p class="text-xs font-mono text-slate-400 uppercase tracking-widest">Invoice #{invoice.number || '000001'}</p>
			<p class="text-xs text-slate-500 mt-1">Terbit: {invoice.date || '-'} · Jatuh Tempo: {invoice.dueDate || '-'}</p>
		</div>
	</div>

	<!-- Recipient Info -->
	<div class="mt-8 text-sm">
		<p class="text-xs uppercase tracking-widest text-slate-400 font-semibold">Kepada</p>
		<p class="mt-1 font-bold text-slate-900 text-base">{invoice.client?.name || 'Nama Klien'}</p>
		{#if invoice.client?.address}
			<p class="text-xs text-slate-500 mt-0.5">{invoice.client.address}</p>
		{/if}
		{#if invoice.client?.email}
			<p class="text-xs text-slate-500">{invoice.client.email}</p>
		{/if}
	</div>

	<!-- Items List -->
	<div class="mt-8 divide-y divide-slate-100 text-sm">
		{#each invoice.items || [] as item}
			<div class="flex justify-between py-3.5">
				<div>
					<p class="font-medium text-slate-900">{item.description || '-'}</p>
					<p class="text-xs text-slate-400 mt-0.5">{item.qty} × {formatCurrency(item.price, invoice.currency)}</p>
				</div>
				<span class="font-semibold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</span>
			</div>
		{/each}
	</div>

	<!-- Totals Breakdown -->
	<div class="mt-6 space-y-2 border-t border-slate-100 pt-5 text-sm">
		<div class="flex justify-between text-slate-500">
			<span>Subtotal</span>
			<span>{formatCurrency(totals.subtotal, invoice.currency)}</span>
		</div>
		{#if totals.discountAmount > 0}
			<div class="flex justify-between text-emerald-600">
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
		<div class="flex justify-between pt-3 text-lg font-bold text-slate-900 border-t border-slate-100">
			<span>Total</span>
			<span class="text-xl font-black">{formatCurrency(totals.total, invoice.currency)}</span>
		</div>
	</div>

	<!-- Notes -->
	{#if invoice.notes}
		<div class="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-500">
			<p class="font-bold text-slate-700 mb-1">Catatan & Pembayaran:</p>
			<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
		</div>
	{/if}
</div>
