<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl border border-slate-300 bg-white p-8 text-slate-800 shadow-paper rounded-xl" id="invoice-preview">
	<!-- B2B Header -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b-2 border-slate-900 pb-5">
		<div>
			<h1 class="text-xl font-black text-slate-900">{invoice.business?.name || 'Nama Bisnis'}</h1>
			<p class="text-xs text-slate-500 mt-1">{invoice.business?.address || ''}</p>
			<p class="text-xs text-slate-500">{invoice.business?.email || ''}</p>
		</div>
		<div class="sm:text-right">
			<h2 class="text-lg font-black tracking-tight text-slate-900 uppercase">INVOICE #{invoice.number || '000001'}</h2>
			<p class="text-xs text-slate-500 mt-1">Tanggal Terbit: {invoice.date || '-'}</p>
			<p class="text-xs text-slate-500">Jatuh Tempo: {invoice.dueDate || '-'}</p>
		</div>
	</div>

	<!-- 2 Box Columns -->
	<div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
		<div class="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
			<p class="font-bold uppercase text-slate-400">Pengirim</p>
			<p class="mt-1 font-bold text-slate-900 text-sm">{invoice.business?.name || '-'}</p>
			<p class="text-slate-500 mt-0.5">{invoice.business?.email || ''}</p>
			<p class="text-slate-500">{invoice.business?.address || ''}</p>
		</div>
		<div class="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
			<p class="font-bold uppercase text-slate-400">Penerima Tagihan</p>
			<p class="mt-1 font-bold text-slate-900 text-sm">{invoice.client?.name || 'Nama Klien'}</p>
			<p class="text-slate-500 mt-0.5">{invoice.client?.email || ''}</p>
			<p class="text-slate-500">{invoice.client?.address || ''}</p>
		</div>
	</div>

	<!-- Table -->
	<table class="mt-6 w-full border border-slate-200 text-xs sm:text-sm">
		<thead class="bg-slate-100 text-left font-bold text-slate-700">
			<tr>
				<th class="p-2.5">Deskripsi</th>
				<th class="p-2.5 text-right">Qty</th>
				<th class="p-2.5 text-right">Harga</th>
				<th class="p-2.5 text-right">Jumlah</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-200">
			{#each invoice.items || [] as item}
				<tr>
					<td class="p-2.5 font-medium text-slate-900">{item.description || '-'}</td>
					<td class="p-2.5 text-right text-slate-500">{item.qty}</td>
					<td class="p-2.5 text-right text-slate-500">{formatCurrency(item.price, invoice.currency)}</td>
					<td class="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Totals & Notes -->
	<div class="mt-5 flex flex-col sm:flex-row justify-between gap-6">
		<div class="flex-1 text-xs">
			{#if invoice.notes}
				<div class="rounded-xl border border-slate-200 p-3.5 bg-slate-50 text-slate-700">
					<p class="font-bold text-slate-900 mb-1">Catatan & Ketentuan Pembayaran:</p>
					<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
				</div>
			{/if}
		</div>

		<div class="w-full sm:w-64 space-y-1.5 text-xs sm:text-sm">
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
			<div class="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold text-slate-900">
				<span>Total Tagihan</span>
				<span class="text-xl font-black">{formatCurrency(totals.total, invoice.currency)}</span>
			</div>
		</div>
	</div>

	<div class="mt-8 flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-200">
		<span>Invoice resmi yang sah secara digital.</span>
		<span class="font-bold text-slate-700">{invoice.business?.name || 'Penerbit'}</span>
	</div>
</div>
