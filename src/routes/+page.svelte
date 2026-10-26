<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import { INVOICE_TEMPLATES } from '$lib/utils/invoiceTemplates.js';

	let activeTemplateId = 'modern';
	$: activeTemplate = INVOICE_TEMPLATES.find((t) => t.id === activeTemplateId) || INVOICE_TEMPLATES[0];

	// Interactive scenarios for the Hero preview
	let activeScenario = 'agency';

	const scenarios = {
		agency: {
			label: '💻 Web Agency',
			invoice: {
				number: 'INV-2026-001',
				date: '10 Sep 2026',
				dueDate: '24 Sep 2026',
				currency: 'IDR',
				business: {
					name: 'Nusantara Studio',
					address: 'Jl. Sudirman No. 45, Jakarta Selatan',
					email: 'billing@nusantarastudio.id'
				},
				client: {
					name: 'PT Digital Solusindo',
					address: 'Cyber Tower Lt. 8, Mega Kuningan',
					email: 'finance@digitalsolusindo.com'
				},
				items: [
					{ description: 'Perancangan UI/UX Desain Sistem', qty: 1, price: 4500000 },
					{ description: 'Pengembangan Frontend Web App (SvelteKit)', qty: 1, price: 7500000 },
					{ description: 'Optimasi Performa & Konsultasi Cloud', qty: 2, price: 1000000 }
				],
				discount: { type: 'percent', value: 5 },
				taxRate: 11,
				notes: 'Pembayaran transfer ke Bank Mandiri No. Rek: 123-000-888999 a.n. Nusantara Studio.'
			}
		},
		designer: {
			label: '🎨 Freelance Designer',
			invoice: {
				number: 'INV-2026-088',
				date: '08 Sep 2026',
				dueDate: '15 Sep 2026',
				currency: 'IDR',
				business: {
					name: 'Alif Visual Works',
					address: 'Jl. Riau No. 12, Bandung',
					email: 'halo@alifvisual.com'
				},
				client: {
					name: 'Kopi Kenangan Senja',
					address: 'Jl. Setiabudi No. 99, Bandung',
					email: 'admin@kopikenangansenja.id'
				},
				items: [
					{ description: 'Rebranding Logo & Brand Style Guide', qty: 1, price: 3500000 },
					{ description: 'Desain Kemasan Paper Cup & Dus Takeaway', qty: 2, price: 1200000 },
					{ description: 'Feed & Story Instagram Template Kit', qty: 1, price: 1500000 }
				],
				discount: { type: 'percent', value: 0 },
				taxRate: 0,
				notes: 'Terima kasih atas kerja samanya! File master vector akan dikirim via Google Drive setelah pelunasan.'
			}
		},
		umkm: {
			label: '☕ UMKM & Kuliner',
			invoice: {
				number: 'INV-2026-042',
				date: '05 Sep 2026',
				dueDate: '12 Sep 2026',
				currency: 'IDR',
				business: {
					name: 'Dapur Berkah Katering',
					address: 'Jl. Ahmad Yani No. 100, Surabaya',
					email: 'order@dapurberkah.id'
				},
				client: {
					name: 'Bina Bangsa Foundation',
					address: 'Jl. Darmo No. 45, Surabaya',
					email: 'event@binabangsa.org'
				},
				items: [
					{ description: 'Paket Buffet Prasmanan 100 Porsi (Menu A)', qty: 100, price: 45000 },
					{ description: 'Pondokan Es Doger & Jajanan Pasar', qty: 100, price: 15000 },
					{ description: 'Service Crew & Dekorasi Meja Buffet', qty: 1, price: 500000 }
				],
				discount: { type: 'fixed', value: 200000 },
				taxRate: 0,
				notes: 'Pelunasan H-1 acara. Transfer BCA: 018-999-3321 a.n Dapur Berkah Katering.'
			}
		}
	};

	$: currentSampleInvoice = scenarios[activeScenario].invoice;

	const features = [
		{
			title: '10 Template Eksklusif',
			desc: 'Pilihan template dari gaya modern, minimalis, korporat hingga elegan yang siap mencerminkan profesionalitas brand Anda.',
			icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
			color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-400'
		},
		{
			title: 'Preview Nyata & Cepat',
			desc: 'Setiap ketikan langsung diperbarui seketika di layar pratinjau tanpa perlu reload atau klik simpan berulang-ulang.',
			icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
			color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400'
		},
		{
			title: 'Export PDF Resolusi Tinggi',
			desc: 'Cetak dan unduh PDF berformat standar A4 yang presisi dengan satu klik, siap dikirim ke klien kapan saja.',
			icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
			color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-400'
		},
		{
			title: 'Kalkulasi Diskon & Pajak',
			desc: 'Hitung subtotal, diskon persentase maupun nominal, serta PPN/pajak secara otomatis dan akurat.',
			icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
			color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400'
		},
		{
			title: 'Salin Ringkasan WhatsApp',
			desc: 'Format pesan teks rapi lengkap dengan nomor invoice, daftar item, dan nomor rekening yang siap dikirim via WA.',
			icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
			color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/15 dark:text-violet-400'
		},
		{
			title: 'Privasi & Keamanan Maksimal',
			desc: 'Data invoice diproses langsung di browser Anda tanpa risiko kebocoran data sensitif ke pihak ketiga.',
			icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
			color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-400'
		}
	];

	const testimonials = [
		{
			name: 'Dimas Prasetyo',
			role: 'Freelance Frontend Engineer',
			avatar: 'D',
			text: 'Invoicely bener-bener ngebantu banget. Dulu bikin invoice pake Canva atau Word makan waktu 30 menit. Sekarang tinggal buka Invoicely, ketik 2 menit, langsung dapet PDF yang rapi banget.'
		},
		{
			name: 'Sarah Amalia',
			role: 'Founder, Bloom Studio Design',
			avatar: 'S',
			text: 'Fitur 10 templatenya keren-keren, klien korporat saya selalu kagum sama tampilan invoice yang clean dan formal. Dan yang paling saya suka ada fitur salin teks ke WhatsApp!'
		},
		{
			name: 'Budi Santoso',
			role: 'Owner, Katering Berkah Jaya',
			avatar: 'B',
			text: 'Simpel dan gak ribet harus daftar akun atau bayar bulanan. Buat UMKM seperti kami, Invoicely adalah solusi terbaik buat penagihan ke kantor-kantor rekanan.'
		}
	];

	// FAQ state
	let openFaq = 0; // index of open FAQ
	const faqs = [
		{
			q: 'Apakah Invoicely benar-benar gratis?',
			a: 'Ya, Invoicely 100% gratis digunakan. Anda dapat membuat invoice tanpa batas, memilih seluruh 10 template premium, dan mengekspor dokumen PDF tanpa watermark atau biaya tersembunyi.'
		},
		{
			q: 'Apakah data keuangan dan data klien saya aman?',
			a: 'Sangat aman. Aplikasi Invoicely memproses seluruh data langsung di browser Anda secara client-side. Tidak ada data invoice atau informasi pelanggan yang disimpan di server kami.'
		},
		{
			q: 'Bagaimana cara mengirim invoice yang sudah dibuat ke klien?',
			a: 'Anda bisa mengunduh invoice dalam bentuk file PDF beresolusi tinggi, mencetaknya secara langsung, atau menggunakan tombol "Salin WA" untuk mengirim ringkasan tagihan beserta nomor rekening ke chat WhatsApp klien Anda.'
		},
		{
			q: 'Apakah saya bisa mengubah mata uang atau menambahkan diskon dan pajak?',
			a: 'Tentu saja! Invoicely mendukung Rupiah (IDR), USD ($), EUR (€), dan SGD (S$), serta kalkulasi diskon (persen atau nominal) dan PPN otomatis.'
		},
		{
			q: 'Apakah saya harus mendaftar akun terlebih dahulu?',
			a: 'Tidak perlu. Anda bisa langsung membuka website Invoicely dan mulai membuat invoice detik itu juga tanpa perlu login atau registrasi.'
		}
	];
</script>

<svelte:head>
	<title>Invoicely — Buat Invoice Profesional dalam Hitungan Detik</title>
	<meta name="description" content="Aplikasi pembuat invoice online gratis dengan 10 template profesional, preview real-time, dan export PDF berkualitas tinggi." />
</svelte:head>

<div class="min-h-screen bg-bg dark:bg-bgDark selection:bg-primary selection:text-white">
	<!-- Navbar Header -->
	<Navbar />

	<!-- Hero Section -->
	<section class="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
		<!-- Subtle background gradient glow -->
		<div class="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-transparent blur-3xl dark:from-primary/10"></div>

		<div class="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-50/60 px-4 py-1.5 text-xs font-bold text-primary dark:bg-primary-500/10 dark:text-primary-300 dark:border-primary-500/30 backdrop-blur">
				<span class="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
				<span>Aplikasi Pembuat Invoice #1 Gratis & Praktis</span>
			</div>

			<!-- Main Heading -->
			<h1 class="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl sm:leading-[1.15]">
				Buat invoice profesional,<br />
				<span class="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">
					langsung dari browser Anda.
				</span>
			</h1>

			<!-- Subtitle -->
			<p class="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-xl sm:leading-relaxed">
				Tingkatkan citra bisnis Anda dengan 10 pilihan template modern, preview instan saat mengetik, dan ekspor PDF siap cetak — tanpa ribet, tanpa biaya berlangganan.
			</p>

			<!-- Action CTAs -->
			<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
				<a
					href="/invoices/create"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
					</svg>
					<span>Buat Invoice Sekarang</span>
				</a>
				<a
					href="/templates"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-700 shadow-soft backdrop-blur transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-surfaceDark/80 dark:text-slate-200 dark:hover:bg-slate-800"
				>
					<svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 4h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />
					</svg>
					<span>Lihat 10 Template</span>
				</a>
			</div>

			<!-- Social Proof / Trust Indicators -->
			<div class="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
				<div class="flex items-center gap-1.5">
					<span class="text-amber-500">★★★★★</span>
					<span class="font-bold text-slate-700 dark:text-slate-300">4.9/5 Rating Pengguna</span>
				</div>
				<span>•</span>
				<div class="flex items-center gap-1.5">
					<svg class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<span>100% Gratis Tanpa Batasan</span>
				</div>
				<span>•</span>
				<div class="flex items-center gap-1.5">
					<svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
					<span>Data Tersimpan di Browser</span>
				</div>
			</div>
		</div>

		<!-- Interactive Live Invoice Preview Mockup -->
		<div class="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
			<div class="glass-card overflow-hidden p-3 sm:p-5 shadow-xl border-slate-200/90 dark:border-slate-800">
				<!-- Mockup Controls: Business Scenarios + Template Switcher -->
				<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
					<!-- Scenario switcher -->
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold text-slate-400">Pilih Contoh:</span>
						<div class="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
							{#each Object.entries(scenarios) as [key, scn]}
								<button
									type="button"
									class="rounded-md px-2.5 py-1 text-xs font-semibold transition
										{activeScenario === key
											? 'bg-white text-slate-900 shadow-xs dark:bg-surfaceDark dark:text-white'
											: 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
									on:click={() => (activeScenario = key)}
								>
									{scn.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Template Quick Pills -->
					<div class="flex flex-wrap items-center gap-1.5">
						<span class="text-xs text-slate-400 mr-1 hidden md:inline">Ganti Template:</span>
						{#each INVOICE_TEMPLATES.slice(0, 5) as t}
							<button
								type="button"
								class="rounded-lg px-2.5 py-1 text-xs font-semibold transition
									{activeTemplateId === t.id
										? 'bg-primary text-white shadow-xs'
										: 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
								on:click={() => (activeTemplateId = t.id)}
							>
								{t.name}
							</button>
						{/each}
						<a href="/templates" class="text-xs font-bold text-primary hover:underline ml-1">
							+5 lainnya
						</a>
					</div>
				</div>

				<!-- Live Rendered Invoice Area -->
				<div class="rounded-xl bg-slate-50/90 p-4 dark:bg-slate-950/60 sm:p-6 overflow-hidden max-h-[520px] overflow-y-auto shadow-inner">
					<svelte:component this={activeTemplate.component} invoice={currentSampleInvoice} />
				</div>

				<!-- Mockup Bottom Bar -->
				<div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
					<span>Template aktif: <strong class="text-slate-900 dark:text-white">{activeTemplate.name}</strong> — {activeTemplate.description}</span>
					<a
						href="/invoices/create?template={activeTemplate.id}"
						class="font-bold text-primary hover:text-primary-700 dark:hover:text-primary-400 flex items-center gap-1"
					>
						Gunakan template ini sekarang &rarr;
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Grid Section -->
	<section id="features" class="border-t border-slate-200/80 bg-white/50 py-20 dark:border-slate-800/80 dark:bg-slate-900/40">
		<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-xs font-black uppercase tracking-wider text-primary">Fitur Lengkap</h2>
				<p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
					Semua kemudahan penagihan dalam satu genggaman
				</p>
				<p class="mt-3 text-slate-600 dark:text-slate-400">
					Didesain khusus untuk freelancer, konsultan, agensi, dan pelaku usaha yang mengutamakan kecepatan dan kepraktisan.
				</p>
			</div>

			<div class="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as f}
					<div class="glass-card card-hover p-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-2xl {f.color}">
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d={f.icon} />
							</svg>
						</div>
						<h3 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Testimonials Section (Social Proof) -->
	<section class="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
		<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-2xl mx-auto">
				<h2 class="text-xs font-black uppercase tracking-wider text-primary">Testimoni</h2>
				<p class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
					Dipercaya oleh Freelancer & Pelaku Usaha
				</p>
			</div>

			<div class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each testimonials as t}
					<div class="card p-6 flex flex-col justify-between hover:shadow-card transition">
						<div>
							<div class="flex items-center gap-1 text-amber-400 text-sm">★★★★★</div>
							<p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
								"{t.text}"
							</p>
						</div>
						<div class="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
								{t.avatar}
							</div>
							<div>
								<p class="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
								<p class="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Interactive FAQ Section -->
	<section class="py-20 border-t border-slate-200/80 bg-white/40 dark:border-slate-800/80 dark:bg-slate-900/30">
		<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h2 class="text-xs font-black uppercase tracking-wider text-primary">Tanya Jawab (FAQ)</h2>
				<p class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
					Pertanyaan yang Sering Diajukan
				</p>
			</div>

			<div class="mt-12 space-y-3">
				{#each faqs as faq, i}
					<div class="card overflow-hidden transition-all duration-200">
						<button
							type="button"
							class="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white hover:text-primary transition"
							on:click={() => (openFaq = openFaq === i ? -1 : i)}
							aria-expanded={openFaq === i}
						>
							<span class="text-base sm:text-lg">{faq.q}</span>
							<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform {openFaq === i ? 'rotate-180 text-primary' : ''}">
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</span>
						</button>
						{#if openFaq === i}
							<div class="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 pt-3">
								{faq.a}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Bottom CTA Section -->
	<section class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-700 px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
			<div class="relative z-10 max-w-2xl mx-auto">
				<h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
					Mulai Buat Invoice Pertama Anda Sekarang
				</h2>
				<p class="mt-4 text-base text-indigo-100 sm:text-lg">
					Tidak perlu kartu kredit, tidak perlu registrasi rumit. Cukup buka browser dan buat invoice Anda dalam 1 menit.
				</p>
				<div class="mt-8 flex flex-col sm:flex-row justify-center gap-4">
					<a
						href="/invoices/create"
						class="rounded-xl bg-white px-7 py-3.5 text-base font-bold text-primary shadow-lg transition hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5"
					>
						+ Buat Invoice Gratis
					</a>
					<a
						href="/dashboard"
						class="rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
					>
						Buka Dashboard
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Polished Footer -->
	<footer class="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-surfaceDark">
		<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
				<div class="flex items-center gap-2.5">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
						IN
					</div>
					<span class="text-lg font-bold text-slate-900 dark:text-white">Invoicely</span>
					<span class="text-xs text-slate-400">© 2026 Invoicely. All rights reserved.</span>
				</div>

				<div class="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
					<a href="/templates" class="hover:text-primary transition">Template</a>
					<a href="/invoices" class="hover:text-primary transition">Invoices</a>
					<a href="/dashboard" class="hover:text-primary transition">Dashboard</a>
					<a href="/settings" class="hover:text-primary transition">Pengaturan</a>
				</div>
			</div>
		</div>
	</footer>
</div>
