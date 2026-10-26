<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl border-2 border-slate-800 bg-white p-8 text-slate-900 shadow-paper" id="invoice-preview">
	<!-- Classic Header -->
	<table class="w-full">
		<tbody>
			<tr>
				<td class="align-top">
					<h1 class="text-xl font-black uppercase tracking-tight">{invoice.business?.name || 'Nama Bisnis'}</h1>
					<p class="text-xs text-slate-600 mt-1">{invoice.business?.address || ''}</p>
					<p class="text-xs text-slate-600">{invoice.business?.email || ''}</p>
				</td>
				<td class="text-right align-top">
					<h2 class="text-2xl font-black tracking-wider">FAKTUR TAGIHAN</h2>
					<p class="text-xs font-bold text-slate-700 font-mono mt-1">No: {invoice.number || '000001'}</p>
				</td>
			</tr>
		</tbody>
	</table>

	<!-- Date banner -->
	<div class="mt-4 flex justify-between border-y border-slate-400 py-2 text-xs font-medium text-slate-700">
		<span>Tanggal Penerbitan: <strong>{invoice.date || '-'}</strong></span>
		<span>Batas Jatuh Tempo: <strong>{invoice.dueDate || '-'}</strong></span>
	</div>

	<!-- Recipient -->
	<div class="mt-4 text-xs">
		<p class="font-bold uppercase text-slate-600">Kepada Yth:</p>
		<p class="text-sm font-black text-slate-900 mt-0.5">{invoice.client?.name || 'Nama Klien'}</p>
		{#if invoice.client?.address}
			<p class="text-slate-600">{invoice.client.address}</p>
		{/if}
		{#if invoice.client?.email}
			<p class="text-slate-600">{invoice.client.email}</p>
		{/if}
	</div>

	<!-- Classic Boxed Table -->
	<table class="mt-5 w-full border border-slate-800 text-xs">
		<thead>
			<tr class="border-b border-slate-800 bg-slate-100 text-left font-bold uppercase">
				<th class="border-r border-slate-400 p-2 text-center w-10">No</th>
				<th class="border-r border-slate-400 p-2">Deskripsi Layanan / Barang</th>
				<th class="border-r border-slate-400 p-2 text-right w-16">Qty</th>
				<th class="border-r border-slate-400 p-2 text-right w-24">Harga Satuan</th>
				<th class="p-2 text-right w-28">Jumlah</th>
			</tr>
		</thead>
		<tbody>
			{#each invoice.items || [] as item, i}
				<tr class="border-b border-slate-300">
					<td class="border-r border-slate-300 p-2 text-center text-slate-600">{i + 1}</td>
					<td class="border-r border-slate-300 p-2 font-medium">{item.description || '-'}</td>
					<td class="border-r border-slate-300 p-2 text-right">{item.qty}</td>
					<td class="border-r border-slate-300 p-2 text-right">{formatCurrency(item.price, invoice.currency)}</td>
					<td class="p-2 text-right font-bold">{formatCurrency(item.qty * item.price, invoice.currency)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Totals -->
	<div class="mt-4 flex flex-col sm:flex-row justify-between gap-4 text-xs">
		<!-- Notes left -->
		<div class="flex-1">
			{#if invoice.notes}
				<div class="p-3 border border-slate-300 bg-slate-50 text-slate-700">
					<p class="font-bold uppercase mb-1 text-[11px]">Instruksi Pembayaran:</p>
					<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
				</div>
			{/if}
		</div>

		<!-- Calculation table right -->
		<table class="w-64 border border-slate-800">
			<tbody>
				<tr class="border-b border-slate-300">
					<td class="p-1.5 font-medium text-slate-600">Subtotal</td>
					<td class="p-1.5 text-right font-semibold">{formatCurrency(totals.subtotal, invoice.currency)}</td>
				</tr>
				{#if totals.discountAmount > 0}
					<tr class="border-b border-slate-300 text-emerald-700">
						<td class="p-1.5 font-medium">Diskon {invoice.discount?.type === 'percent' ? `(${invoice.discount.value}%)` : ''}</td>
						<td class="p-1.5 text-right font-semibold">-{formatCurrency(totals.discountAmount, invoice.currency)}</td>
					</tr>
				{/if}
				{#if invoice.taxRate > 0}
					<tr class="border-b border-slate-300">
						<td class="p-1.5 font-medium text-slate-600">PPN / Pajak ({invoice.taxRate}%)</td>
						<td class="p-1.5 text-right font-semibold">+{formatCurrency(totals.taxAmount, invoice.currency)}</td>
					</tr>
				{/if}
				<tr class="bg-slate-100 font-bold text-sm">
					<td class="p-2 uppercase">TOTAL AKHIR</td>
					<td class="p-2 text-right font-black">{formatCurrency(totals.total, invoice.currency)}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- Signature Section -->
	<div class="mt-8 flex justify-between items-end text-xs pt-4 border-t border-slate-300">
		<div>
			<p class="text-slate-500">Tanda Terima Pelanggan,</p>
			<div class="h-12"></div>
			<p class="font-bold border-t border-slate-400 pt-1 w-40 text-center">( {invoice.client?.name || 'Pelanggan'} )</p>
		</div>
		<div class="text-right">
			<p class="text-slate-500">Hormat Kami,</p>
			<div class="h-12"></div>
			<p class="font-bold border-t border-slate-400 pt-1 w-40 text-center">( {invoice.business?.name || 'Penerbit'} )</p>
		</div>
	</div>
</div>
