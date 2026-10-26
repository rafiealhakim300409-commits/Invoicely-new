<script>
	import { calcInvoiceTotals, formatCurrency, angkaTerbilang } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-paper border border-slate-200" id="invoice-preview">
	<!-- Corporate Header -->
	<div class="bg-slate-900 px-8 py-7 text-white">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				{#if invoice.business?.logo}
					<img src={invoice.business.logo} alt="Logo" class="h-10 w-auto max-w-[150px] mb-2 object-contain rounded bg-white/10 p-1" />
				{/if}
				<h1 class="text-2xl font-black tracking-tight">{invoice.business?.name || 'Nama Bisnis'}</h1>
				<p class="text-xs text-slate-400 mt-1">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
			</div>
			<div class="sm:text-right">
				<span class="inline-block rounded bg-primary/30 px-2 py-0.5 text-xs font-mono font-bold tracking-widest text-primary-200 uppercase">INVOICE RESMI</span>
				<p class="font-mono text-base font-bold mt-1 text-white">#{invoice.number || '000001'}</p>
			</div>
		</div>
	</div>

	<div class="p-8 text-slate-800">
		<!-- Info 2 Columns -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 pb-6 text-sm">
			<div>
				<p class="text-xs font-bold uppercase tracking-wider text-slate-400">Ditagihkan Kepada</p>
				<p class="mt-1 font-bold text-base text-slate-900">{invoice.client?.name || 'Nama Klien'}</p>
				{#if invoice.client?.address}
					<p class="text-xs text-slate-500 mt-0.5">{invoice.client.address}</p>
				{/if}
				{#if invoice.client?.email}
					<p class="text-xs text-slate-500">{invoice.client.email}</p>
				{/if}
			</div>
			<div class="sm:text-right space-y-1">
				<p class="text-xs font-bold uppercase tracking-wider text-slate-400">Detail Pembayaran</p>
				<p class="text-xs text-slate-600">Tanggal Terbit: <strong class="text-slate-800">{invoice.date || '-'}</strong></p>
				<p class="text-xs text-slate-600">Jatuh Tempo: <strong class="text-slate-800">{invoice.dueDate || '-'}</strong></p>
				<p class="text-xs text-slate-600">Mata Uang: <strong class="text-slate-800">{invoice.currency || 'IDR'}</strong></p>
			</div>
		</div>

		<!-- Table -->
		<table class="mt-6 w-full text-sm">
			<thead>
				<tr class="bg-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
					<th class="p-3 first:rounded-l-lg">Deskripsi Layanan</th>
					<th class="p-3 text-right">Qty</th>
					<th class="p-3 text-right">Harga Satuan</th>
					<th class="p-3 text-right last:rounded-r-lg">Jumlah</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each invoice.items || [] as item}
					<tr>
						<td class="p-3 font-medium text-slate-900">{item.description || '-'}</td>
						<td class="p-3 text-right text-slate-500">{item.qty}</td>
						<td class="p-3 text-right text-slate-500">{formatCurrency(item.price, invoice.currency)}</td>
						<td class="p-3 text-right font-bold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Totals & Notes -->
		<div class="mt-6 flex flex-col sm:flex-row justify-between gap-6 border-t border-slate-100 pt-5">
			<!-- Notes Left -->
			<div class="flex-1">
				{#if invoice.notes}
					<div class="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600">
						<p class="font-bold text-slate-800 mb-1">Catatan & Petunjuk Transfer:</p>
						<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
					</div>
				{/if}
			</div>

			<!-- Totals Right -->
			<div class="w-full sm:w-64 space-y-2 text-sm">
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
						<span>Pajak PPN ({invoice.taxRate}%)</span>
						<span>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
					</div>
				{/if}
				<div class="rounded-xl bg-slate-900 px-4 py-3 text-white mt-2">
					<p class="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Kewajiban</p>
					<p class="text-xl font-black mt-0.5">{formatCurrency(totals.total, invoice.currency)}</p>
				</div>
				{#if invoice.currency === 'IDR'}
					<div class="text-[11px] italic text-slate-500 pt-1 text-right">
						Terbilang: {angkaTerbilang(totals.total)}
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-8 flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
			<span>Dokumen ini sah dan diterbitkan secara digital.</span>
			<span class="font-semibold text-slate-700">{invoice.business?.name || 'Invoicely Enterprise'}</span>
		</div>
	</div>
</div>
