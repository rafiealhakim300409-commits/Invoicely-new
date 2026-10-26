<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl bg-white p-10 text-slate-800 shadow-paper rounded-2xl border border-slate-200" id="invoice-preview" style="font-family: Georgia, 'Times New Roman', serif;">
	<div class="text-center pb-6 border-b border-slate-200">
		<h1 class="text-3xl tracking-[0.2em] font-normal text-slate-900 uppercase">INVOICE</h1>
		<div class="mx-auto mt-3 h-0.5 w-16 bg-primary"></div>
		<p class="mt-3 text-base font-bold text-slate-900">{invoice.business?.name || 'Nama Bisnis'}</p>
		<p class="text-xs text-slate-500 mt-0.5">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
	</div>

	<div class="mt-8 flex flex-col sm:flex-row justify-between gap-4 text-sm pb-6 border-b border-slate-100">
		<div>
			<p class="text-xs uppercase tracking-widest text-slate-400 font-semibold">Tertuju Kepada</p>
			<p class="mt-1 font-bold text-slate-900 text-base">{invoice.client?.name || 'Nama Klien'}</p>
			{#if invoice.client?.address}
				<p class="text-xs text-slate-500 mt-0.5">{invoice.client.address}</p>
			{/if}
			{#if invoice.client?.email}
				<p class="text-xs text-slate-500">{invoice.client.email}</p>
			{/if}
		</div>
		<div class="sm:text-right space-y-1">
			<p class="text-xs uppercase tracking-widest text-slate-400 font-semibold">Nomor Tagihan</p>
			<p class="font-bold text-slate-900 font-mono">#{invoice.number || '000001'}</p>
			<p class="text-xs text-slate-500">Tanggal: {invoice.date || '-'}</p>
			<p class="text-xs text-slate-500">Jatuh Tempo: {invoice.dueDate || '-'}</p>
		</div>
	</div>

	<!-- Table -->
	<table class="mt-6 w-full text-sm">
		<thead>
			<tr class="border-b-2 border-slate-200 text-left italic text-slate-500 text-xs uppercase tracking-wider">
				<th class="pb-3 font-semibold">Deskripsi Layanan</th>
				<th class="pb-3 text-right font-semibold">Qty</th>
				<th class="pb-3 text-right font-semibold">Harga</th>
				<th class="pb-3 text-right font-semibold">Jumlah</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100">
			{#each invoice.items || [] as item}
				<tr>
					<td class="py-3 text-slate-900">{item.description || '-'}</td>
					<td class="py-3 text-right text-slate-500">{item.qty}</td>
					<td class="py-3 text-right text-slate-500">{formatCurrency(item.price, invoice.currency)}</td>
					<td class="py-3 text-right font-bold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Totals -->
	<div class="mt-6 flex flex-col sm:flex-row justify-between gap-6 border-t border-slate-200 pt-5">
		<div class="flex-1">
			{#if invoice.notes}
				<div class="rounded-xl bg-slate-50 p-4 border border-slate-200/60 text-xs text-slate-700">
					<p class="font-bold text-slate-900 mb-1">Catatan & Informasi Rekening:</p>
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
				<div class="flex justify-between text-emerald-700">
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
				<span>Total Pembayaran</span>
				<span class="text-xl font-black text-primary">{formatCurrency(totals.total, invoice.currency)}</span>
			</div>
		</div>
	</div>

	<p class="mt-10 text-center text-xs italic text-slate-400">Terima kasih atas kerja sama dan kepercayaan Anda.</p>
</div>
