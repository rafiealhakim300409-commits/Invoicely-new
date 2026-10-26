<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl bg-white p-10 text-sm text-slate-800 shadow-paper rounded-2xl border border-slate-100" id="invoice-preview">
	<!-- Simple Clean Top -->
	<div class="flex justify-between items-start border-b border-slate-200 pb-6">
		<div>
			<h1 class="font-bold text-base text-slate-900">{invoice.business?.name || 'Nama Bisnis'}</h1>
			<p class="text-xs text-slate-500 mt-0.5">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
		</div>
		<div class="text-right text-xs">
			<p class="font-mono font-bold text-slate-900">INVOICE #{invoice.number || '000001'}</p>
			<p class="text-slate-400 mt-0.5">Tanggal: {invoice.date || '-'} · Tempo: {invoice.dueDate || '-'}</p>
		</div>
	</div>

	<!-- Recipient -->
	<div class="mt-6 text-xs text-slate-600">
		<p class="text-slate-400 uppercase font-semibold">Ditujukan Kepada:</p>
		<p class="text-sm font-bold text-slate-900 mt-1">{invoice.client?.name || 'Nama Klien'}</p>
		{#if invoice.client?.address}
			<p class="mt-0.5">{invoice.client.address}</p>
		{/if}
		{#if invoice.client?.email}
			<p>{invoice.client.email}</p>
		{/if}
	</div>

	<!-- Linear Items Table -->
	<div class="mt-6 border-t border-slate-200">
		{#each invoice.items || [] as item}
			<div class="flex justify-between items-center border-b border-slate-100 py-3 text-xs sm:text-sm">
				<div>
					<p class="font-medium text-slate-900">{item.description || '-'}</p>
					<p class="text-xs text-slate-400">{item.qty} × {formatCurrency(item.price, invoice.currency)}</p>
				</div>
				<span class="font-semibold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</span>
			</div>
		{/each}
	</div>

	<!-- Calculations -->
	<div class="mt-4 flex flex-col sm:flex-row justify-between gap-6 pt-2">
		<div class="flex-1 text-xs">
			{#if invoice.notes}
				<div class="p-3 bg-slate-50 rounded-lg text-slate-600">
					<p class="font-semibold text-slate-800 mb-0.5">Catatan Pembayaran:</p>
					<p class="whitespace-pre-line">{invoice.notes}</p>
				</div>
			{/if}
		</div>

		<div class="w-full sm:w-60 space-y-1.5 text-xs sm:text-sm">
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
			<div class="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-2">
				<span>Total</span>
				<span class="text-lg font-black">{formatCurrency(totals.total, invoice.currency)}</span>
			</div>
		</div>
	</div>
</div>
