<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-paper border border-amber-900/10" id="invoice-preview" style="font-family: Georgia, 'Times New Roman', serif;">
	<!-- Luxury Dark Header with Gold Accent -->
	<div class="bg-gradient-to-b from-slate-950 to-slate-900 px-8 py-9 text-center text-white relative">
		<div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
		<p class="text-xs uppercase tracking-[0.35em] text-amber-400 font-semibold">Premium Invoice</p>
		<h1 class="mt-2 text-2xl sm:text-3xl font-normal tracking-wide text-amber-50">{invoice.business?.name || 'Nama Bisnis'}</h1>
		<p class="mt-1 text-xs text-slate-400">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
	</div>

	<div class="p-8 text-slate-800">
		<!-- Metadata & Client Info -->
		<div class="flex flex-col sm:flex-row justify-between gap-4 border-b border-amber-900/10 pb-6 text-sm">
			<div>
				<p class="text-xs uppercase tracking-widest text-amber-700 font-semibold">Ditagihkan Kepada</p>
				<p class="mt-1.5 font-bold text-base text-slate-900">{invoice.client?.name || 'Nama Klien'}</p>
				{#if invoice.client?.address}
					<p class="text-xs text-slate-500 mt-0.5">{invoice.client.address}</p>
				{/if}
				{#if invoice.client?.email}
					<p class="text-xs text-slate-500">{invoice.client.email}</p>
				{/if}
			</div>

			<div class="sm:text-right space-y-1">
				<p class="text-xs uppercase tracking-widest text-slate-400">Nomor Faktur</p>
				<p class="font-bold text-amber-700 font-mono">#{invoice.number || '000001'}</p>
				<p class="text-xs text-slate-500">Tanggal: {invoice.date || '-'}</p>
				<p class="text-xs text-slate-500">Jatuh Tempo: {invoice.dueDate || '-'}</p>
			</div>
		</div>

		<!-- Items Table -->
		<table class="mt-6 w-full text-sm">
			<thead>
				<tr class="border-b-2 border-amber-900/20 text-left text-xs uppercase tracking-wider text-amber-900 font-semibold">
					<th class="pb-3 font-semibold">Deskripsi Layanan / Produk</th>
					<th class="pb-3 text-right font-semibold">Qty</th>
					<th class="pb-3 text-right font-semibold">Harga</th>
					<th class="pb-3 text-right font-semibold">Jumlah</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each invoice.items || [] as item}
					<tr>
						<td class="py-3 pr-2">{item.description || '-'}</td>
						<td class="py-3 text-right text-slate-500">{item.qty}</td>
						<td class="py-3 text-right text-slate-500">{formatCurrency(item.price, invoice.currency)}</td>
						<td class="py-3 text-right font-semibold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Totals Breakdown -->
		<div class="mt-6 flex justify-end border-t border-amber-400/30 pt-4">
			<div class="w-64 space-y-1.5 text-sm">
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
				<div class="flex justify-between border-t-2 border-amber-400 pt-2 text-base font-bold text-slate-900">
					<span>Total Tagihan</span>
					<span class="text-amber-700 text-lg">{formatCurrency(totals.total, invoice.currency)}</span>
				</div>
			</div>
		</div>

		<!-- Notes & Payment Details -->
		{#if invoice.notes}
			<div class="mt-8 rounded-xl bg-amber-50/60 p-4 border border-amber-200/60 text-xs text-slate-700">
				<p class="font-bold uppercase tracking-wider text-amber-800 mb-1">Ketentuan & Pembayaran</p>
				<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
			</div>
		{/if}

		<div class="mt-8 flex justify-between items-end text-xs text-slate-400 pt-4 border-t border-slate-100">
			<span>Terima kasih atas kerja sama dan kepercayaan Anda.</span>
			<div class="text-right">
				<div class="h-8"></div>
				<p class="font-semibold text-slate-700">{invoice.business?.name || 'Otorisasi Bisnis'}</p>
			</div>
		</div>
	</div>
</div>
