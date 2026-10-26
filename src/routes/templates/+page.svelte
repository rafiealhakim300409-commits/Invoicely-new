<script>
	import AppShell from '$lib/components/AppShell.svelte';
	import { INVOICE_TEMPLATES } from '$lib/utils/invoiceTemplates.js';

	let activeModalTemplate = null;

	const sampleInvoice = {
		number: 'INV-2026-0005',
		date: '15 Agu 2026',
		dueDate: '29 Agu 2026',
		currency: 'IDR',
		business: { name: 'Studio Kreatif Utama', address: 'Surabaya, Indonesia', email: 'hello@studiokreatif.id' },
		client: { name: 'PT Sumber Makmur Sejahtera', address: 'Gedung Wisma Niaga Lt. 4, Jakarta', email: 'finance@sumbermakmur.co.id' },
		items: [
			{ description: 'Desain Brand Identity & Logo Master', qty: 1, price: 2500000 },
			{ description: 'Jasa Konsultasi UI/UX & Sesi Brainstorming', qty: 3, price: 600000 },
			{ description: 'Social Media Feed Template Kit (12 Post)', qty: 1, price: 1200000 }
		],
		discount: { type: 'percent', value: 5 },
		taxRate: 11,
		notes: 'Pembayaran transfer ke Bank BCA: 8870-1234-56 a.n Studio Kreatif Utama.'
	};

	function getTemplateTag(id) {
		if (['modern-minimal', 'luxury-gold', 'modern', 'luxury'].includes(id)) return 'Populer';
		if (['corporate-blue', 'tech-mono', 'classic-serif', 'corporate', 'professional', 'classic'].includes(id)) return 'B2B';
		if (['creative-gradient', 'bold-editorial', 'creative', 'bold'].includes(id)) return 'Kreatif';
		return 'Minimalis';
	}
</script>

<svelte:head>
	<title>Koleksi 10 Template Invoice — Invoicely</title>
</svelte:head>

<AppShell title="Katalog Template">
	<!-- Top Intro Banner -->
	<div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-5">
		<div>
			<h2 class="text-xl font-bold text-slate-900 dark:text-white">10 Desain Invoice Standar Industri</h2>
			<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
				Pilih template yang paling cocok dengan brand Anda. Klik kartu untuk melihat pratinjau penuh atau klik "Gunakan" untuk langsung mengisi data.
			</p>
		</div>
		<a href="/invoices/create" class="btn-primary shrink-0">
			+ Buat Invoice Baru
		</a>
	</div>

	<!-- Template Grid -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
		{#each INVOICE_TEMPLATES as t}
			<div class="card overflow-hidden group hover:shadow-card hover:-translate-y-1 transition-all duration-200 border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
				<!-- Scaled invoice preview container -->
				<div
					class="relative h-64 overflow-hidden bg-slate-100/80 p-3 dark:bg-slate-900/60 cursor-pointer"
					on:click={() => (activeModalTemplate = t)}
					on:keydown={(e) => e.key === 'Enter' && (activeModalTemplate = t)}
					tabindex="0"
					role="button"
					aria-label={`Lihat pratinjau ${t.name}`}
				>
					<div class="origin-top-left scale-[0.42] pointer-events-none select-none transition-transform group-hover:scale-[0.43]" style="width: 238%;">
						<svelte:component this={t.component} invoice={sampleInvoice} />
					</div>
					<!-- Hover overlay badge -->
					<div class="absolute top-3 right-3 flex items-center gap-1.5">
						<span class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-800/90 dark:text-slate-200">
							{getTemplateTag(t.id)}
						</span>
					</div>

					<!-- Hover Click to Zoom overlay hint -->
					<div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center pointer-events-none">
						<span class="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl bg-slate-900/80 text-white px-3 py-1.5 text-xs font-semibold backdrop-blur shadow-md">
							🔍 Klik untuk Pratinjau Penuh
						</span>
					</div>
				</div>

				<!-- Info & Action footer -->
				<div class="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800 bg-white dark:bg-surfaceDark">
					<div>
						<p class="font-bold text-slate-900 dark:text-white">{t.name}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							class="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hidden sm:inline"
							on:click={() => (activeModalTemplate = t)}
						>
							Detail
						</button>
						<a
							href="/invoices/create?template={t.id}"
							class="btn-primary text-xs py-2 px-3.5 shrink-0 shadow-xs"
						>
							Gunakan &rarr;
						</a>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Fullscreen Preview Modal -->
	{#if activeModalTemplate}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in-0">
			<button
				type="button"
				class="fixed inset-0 cursor-default"
				on:click={() => (activeModalTemplate = null)}
				aria-label="Tutup modal"
			></button>

			<div class="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-surfaceDark border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 overflow-hidden">
				<!-- Modal Header -->
				<div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
					<div class="flex items-center gap-3">
						<span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-primary-500/20 dark:text-primary-300">
							{getTemplateTag(activeModalTemplate.id)}
						</span>
						<h3 class="text-lg font-bold text-slate-900 dark:text-white">
							Template: {activeModalTemplate.name}
						</h3>
					</div>
					<button
						type="button"
						class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
						on:click={() => (activeModalTemplate = null)}
						aria-label="Tutup"
					>
						✕
					</button>
				</div>

				<!-- Modal Body / Rendered Invoice -->
				<div class="flex-1 overflow-y-auto p-6 bg-slate-200/50 dark:bg-slate-950/70">
					<svelte:component this={activeModalTemplate.component} invoice={sampleInvoice} />
				</div>

				<!-- Modal Footer -->
				<div class="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 dark:border-slate-800 bg-white dark:bg-surfaceDark">
					<span class="text-xs text-slate-500 dark:text-slate-400">{activeModalTemplate.description}</span>
					<div class="flex items-center gap-2">
						<button
							type="button"
							class="btn-ghost text-xs"
							on:click={() => (activeModalTemplate = null)}
						>
							Tutup
						</button>
						<a
							href="/invoices/create?template={activeModalTemplate.id}"
							class="btn-primary text-xs py-2 px-4 shadow-sm"
						>
							Gunakan Template Ini &rarr;
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}
</AppShell>
