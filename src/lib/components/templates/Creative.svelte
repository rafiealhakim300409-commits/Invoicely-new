<script>
	import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';
	export let invoice;
	$: totals = calcInvoiceTotals(invoice);
</script>

<div class="relative mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-paper border border-slate-100" id="invoice-preview">
	<!-- Creative Geometric Accents -->
	<div class="absolute -right-16 -top-16 h-48 w-48 rotate-45 bg-primary-100"></div>
	<div class="absolute -right-24 -top-24 h-48 w-48 rotate-45 bg-primary-600"></div>

	<div class="relative p-8 text-slate-800">
		<div class="flex flex-col sm:flex-row justify-between items-start gap-4">
			<div>
				<h1 class="text-3xl font-black text-primary-700 tracking-tight">{invoice.business?.name || 'Nama Bisnis'}</h1>
				<p class="text-xs text-slate-500 mt-1">{invoice.business?.address || ''} {invoice.business?.email ? `· ${invoice.business?.email}` : ''}</p>
			</div>
			<div class="rounded-2xl bg-primary-50 px-4 py-2.5 text-right border border-primary-100/80">
				<p class="text-xs font-black uppercase tracking-wider text-primary">Invoice #{invoice.number || '000001'}</p>
				<p class="text-xs text-slate-500 mt-0.5">{invoice.date || '-'}</p>
			</div>
		</div>

		<div class="mt-8 flex flex-col sm:flex-row justify-between gap-4 border-t border-slate-100 pt-6 text-sm">
			<div>
				<p class="text-xs font-bold uppercase tracking-wider text-primary-600">Ditujukan Kepada</p>
				<p class="mt-1 font-bold text-slate-900 text-base">{invoice.client?.name || 'Nama Klien'}</p>
				{#if invoice.client?.address}
					<p class="text-xs text-slate-500">{invoice.client.address}</p>
				{/if}
				{#if invoice.client?.email}
					<p class="text-xs text-slate-500">{invoice.client.email}</p>
				{/if}
			</div>
			<div class="sm:text-right">
				<p class="text-xs font-bold uppercase tracking-wider text-slate-400">Jatuh Tempo</p>
				<p class="mt-1 font-semibold text-slate-800">{invoice.dueDate || '-'}</p>
			</div>
		</div>

		<!-- Creative List Items -->
		<div class="mt-6 space-y-2">
			{#each invoice.items || [] as item}
				<div class="flex items-center justify-between rounded-xl bg-slate-50/90 px-4 py-3 text-sm border border-slate-100">
					<div>
						<p class="font-bold text-slate-900">{item.description || '-'}</p>
						<p class="text-xs text-slate-400">{item.qty} × {formatCurrency(item.price, invoice.currency)}</p>
					</div>
					<span class="font-extrabold text-slate-900">{formatCurrency(item.qty * item.price, invoice.currency)}</span>
				</div>
			{/each}
		</div>

		<!-- Totals & Notes -->
		<div class="mt-6 flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-100">
			<!-- Notes -->
			<div class="flex-1">
				{#if invoice.notes}
					<div class="rounded-xl bg-indigo-50/50 p-4 border border-indigo-100/60 text-xs text-slate-700">
						<p class="font-bold text-primary mb-1">Catatan Kreatif & Rekening:</p>
						<p class="whitespace-pre-line leading-relaxed">{invoice.notes}</p>
					</div>
				{/if}
			</div>

			<!-- Totals -->
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
						<span>Pajak ({invoice.taxRate}%)</span>
						<span>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
					</div>
				{/if}
				<div class="rounded-2xl bg-gradient-to-r from-primary to-indigo-600 px-5 py-3.5 text-right text-white shadow-md shadow-primary/25 mt-2">
					<p class="text-xs opacity-90 uppercase tracking-wider font-semibold">Total Tagihan</p>
					<p class="text-2xl font-black mt-0.5">{formatCurrency(totals.total, invoice.currency)}</p>
				</div>
			</div>
		</div>

		<p class="mt-8 text-center text-xs text-slate-400">Terima kasih atas kolaborasi yang luar biasa!</p>
	</div>
</div>
