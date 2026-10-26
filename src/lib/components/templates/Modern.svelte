<script>
	import { calcInvoiceTotals, formatCurrency, angkaTerbilang } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl bg-white p-8 text-ink shadow-card rounded-2xl" id="invoice-preview">
	<div class="flex items-start justify-between border-t-4 border-primary pt-6">
		<div>
			{#if invoice.business?.logo}
				<img src={invoice.business.logo} alt="Logo" class="h-10 w-auto max-w-[150px] mb-2 object-contain" />
			{/if}
			<h1 class="text-2xl font-bold text-primary">{invoice.business?.name || 'Nama Bisnis'}</h1>
			<p class="mt-1 text-sm text-slate-500">{invoice.business?.address || ''}</p>
			<p class="text-sm text-slate-500">{invoice.business?.email || ''}</p>
		</div>
		<div class="text-right">
			<h2 class="text-xl font-semibold uppercase tracking-wide text-slate-400">Invoice</h2>
			<p class="mt-1 text-sm text-slate-500">#{invoice.number || '000001'}</p>
			<p class="text-sm text-slate-500">Tanggal: {invoice.date || '-'}</p>
			<p class="text-sm text-slate-500">Jatuh tempo: {invoice.dueDate || '-'}</p>
		</div>
	</div>

	<div class="mt-8 grid grid-cols-2 gap-6">
		<div>
			<p class="text-xs font-semibold uppercase text-slate-400">Ditagihkan kepada</p>
			<p class="mt-1 font-medium">{invoice.client?.name || 'Nama Klien'}</p>
			<p class="text-sm text-slate-500">{invoice.client?.address || ''}</p>
			<p class="text-sm text-slate-500">{invoice.client?.email || ''}</p>
		</div>
	</div>

	<table class="mt-8 w-full text-sm">
		<thead>
			<tr class="border-b-2 border-slate-100 text-left text-xs uppercase text-slate-400">
				<th class="pb-2">Deskripsi</th>
				<th class="pb-2 text-right">Qty</th>
				<th class="pb-2 text-right">Harga</th>
				<th class="pb-2 text-right">Jumlah</th>
			</tr>
		</thead>
		<tbody>
			{#each invoice.items || [] as item}
				<tr class="border-b border-slate-100">
					<td class="py-2.5">{item.description}</td>
					<td class="py-2.5 text-right">{item.qty}</td>
					<td class="py-2.5 text-right">{formatCurrency(item.price, invoice.currency)}</td>
					<td class="py-2.5 text-right font-medium">{formatCurrency(item.qty * item.price, invoice.currency)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-6 flex justify-end">
		<div class="w-56 space-y-1.5 text-sm">
			<div class="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, invoice.currency)}</span></div>
			{#if totals.discountAmount}
				<div class="flex justify-between text-slate-500"><span>Diskon</span><span>-{formatCurrency(totals.discountAmount, invoice.currency)}</span></div>
			{/if}
			{#if invoice.taxRate}
				<div class="flex justify-between text-slate-500"><span>Pajak ({invoice.taxRate}%)</span><span>{formatCurrency(totals.taxAmount, invoice.currency)}</span></div>
			{/if}
			<div class="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-primary">
				<span>Total</span><span>{formatCurrency(totals.total, invoice.currency)}</span>
			</div>
			{#if invoice.currency === 'IDR'}
				<div class="text-[11px] italic text-slate-500 pt-1 text-right border-t border-slate-100">
					Terbilang: {angkaTerbilang(totals.total)}
				</div>
			{/if}
		</div>
	</div>

	{#if invoice.notes}
		<p class="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-400">{invoice.notes}</p>
	{/if}
</div>
