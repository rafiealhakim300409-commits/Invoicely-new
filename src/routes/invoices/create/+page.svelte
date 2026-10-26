<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AppShell from '$lib/components/AppShell.svelte';
	import { INVOICE_TEMPLATES, getTemplateById } from '$lib/utils/invoiceTemplates.js';
	import { calcInvoiceTotals, formatCurrency, angkaTerbilang } from '$lib/utils/invoiceCalc.js';
	import { products, customers, invoices } from '$lib/stores/data.js';
	import confetti from 'canvas-confetti';
	import {
		createInvoice,
		updateInvoice,
		downloadBackendPdf,
		mapToApiStatus,
		mapFromApiStatus,
		mapToApiTemplateId,
		API_STATUS_LIST,
		getSettings
	} from '$lib/services/api.js';

	let selectedTemplateId = 'modern-minimal';
	$: SelectedTemplate = getTemplateById(selectedTemplateId).component;

	let mobileView = 'edit'; // 'edit' | 'preview'
	let activePartyTab = 'business'; // 'business' | 'client'
	let isExporting = false;
	let isSavingToApi = false;
	let backendSyncStatus = null; // 'synced' | 'local_only' | 'error'
	let zoomScale = 1;
	let invoiceId = null;

	// Modals
	let showProductPickerModal = false;
	let showAutoSendModal = false;

	// Toast feedback
	let toastMessage = '';
	let toastVisible = false;
	let toastTimer;

	function showToast(msg) {
		toastMessage = msg;
		toastVisible = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastVisible = false;
		}, 3500);
	}

	const currencies = [
		{ code: 'IDR', label: 'IDR (Rp)' },
		{ code: 'USD', label: 'USD ($)' },
		{ code: 'EUR', label: 'EUR (€)' },
		{ code: 'SGD', label: 'SGD (S$)' }
	];

	// Presets
	const presets = [
		{
			id: 'webdev',
			name: 'Web & Tech',
			icon: '💻',
			data: {
				business: { name: 'Nexus Digital Tech', address: 'Tech Park Kav 7, BSD City', email: 'billing@nexusdigital.id' },
				client: { name: 'PT Mitra Retail Indonesia', address: 'Menara Sudirman Lt. 14, Jakarta', email: 'procurement@mitraretail.co.id', phone: '081398765432' },
				items: [
					{ description: 'Pengembangan Web App SvelteKit & API', qty: 1, price: 8500000 },
					{ description: 'Setup Server Cloud, SSL & Domain', qty: 1, price: 1500000 },
					{ description: 'Pemeliharaan & SLA Bulanan', qty: 2, price: 750000 }
				],
				discount: { type: 'percent', value: 5 },
				taxRate: 11,
				notes: 'Pembayaran transfer ke Bank BCA: 8870-1234-56 a.n Nexus Digital.'
			}
		},
		{
			id: 'design',
			name: 'Desain & Brand',
			icon: '🎨',
			data: {
				business: { name: 'Artisan Creative Studio', address: 'Jl. Ranggamalela No. 8, Bandung', email: 'hello@artisanstudio.id' },
				client: { name: 'CV Kopi Senja Nusantara', address: 'Jl. Malioboro No. 45, Yogyakarta', email: 'owner@kopisenja.com', phone: '081900112233' },
				items: [
					{ description: 'Perancangan Brand Identity & Logo Masterfile', qty: 1, price: 3500000 },
					{ description: 'Desain Kemasan Produk (3 Varian Rasa)', qty: 3, price: 900000 },
					{ description: 'Feed & Story Instagram Template Kit', qty: 1, price: 1800000 }
				],
				discount: { type: 'percent', value: 0 },
				taxRate: 0,
				notes: 'Terima kasih atas kepercayaannya! File master vector akan dikirim via Google Drive setelah pelunasan.'
			}
		},
		{
			id: 'catering',
			name: 'Katering & UMKM',
			icon: '🍱',
			data: {
				business: { name: 'Dapur Bunda Rasa', address: 'Jl. Ketintang Baru No. 19, Surabaya', email: 'pesanan@dapurbunda.com' },
				client: { name: 'PT Sumber Makmur Sejahtera', address: 'Gedung Wisma Niaga Lt. 4, Jakarta Pusat', email: 'finance@sumbermakmur.co.id', phone: '081122334455' },
				items: [
					{ description: 'Paket Nasi Kotak Premium Ayam Bakar Madu', qty: 150, price: 35000 },
					{ description: 'Snack Box (3 Macam Kue + Air Mineral)', qty: 150, price: 15000 },
					{ description: 'Biaya Pengiriman & Antar Lokasi', qty: 1, price: 150000 }
				],
				discount: { type: 'fixed', value: 100000 },
				taxRate: 0,
				notes: 'Pesanan akan diantar pukul 10:30 WIB. Transfer ke Rekening Mandiri: 142-00-112233-4 a.n Dapur Bunda.'
			}
		},
		{
			id: 'consulting',
			name: 'Konsultasi Legal',
			icon: '⚖️',
			data: {
				business: { name: 'Aksara Konsultan Bisnis', address: 'Kuningan City Tower 2, Lt. 18, Jakarta', email: 'partner@aksaraconsulting.com' },
				client: { name: 'PT Sinar Abadi Sentosa', address: 'Kawasan Industri GIIC Cikarang', email: 'legal@sinarabadi.co.id', phone: '081900112233' },
				items: [
					{ description: 'Audit Kepatuhan Legal & Penyusunan Kontrak Kerja', qty: 1, price: 7500000 },
					{ description: 'Sesi Pendampingan & Konsultasi Pajak Perusahaan', qty: 4, price: 1250000 }
				],
				discount: { type: 'percent', value: 10 },
				taxRate: 11,
				notes: 'Termin pembayaran: Net 14 Days. Rekening BNI: 088-999-7766 a.n Aksara Konsultan.'
			}
		}
	];

	let invoice = {
		id: `inv-${Date.now()}`,
		number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
		date: new Date().toISOString().split('T')[0],
		dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		currency: 'IDR',
		status: 'unpaid',
		business: {
			name: 'Bisnis Kamu',
			address: 'Jl. Pemuda No. 12, Surabaya',
			email: 'billing@bisniskamu.com',
			logo: null
		},
		client: {
			name: 'PT Sumber Makmur Sejahtera',
			address: 'Gedung Wisma Niaga Lt. 4, Jakarta Pusat',
			email: 'finance@sumbermakmur.co.id',
			phone: '081122334455'
		},
		items: [
			{ description: 'Pengembangan Web App SvelteKit & API', qty: 1, price: 4500000 },
			{ description: 'Setup Cloud Hosting & SSL Domain', qty: 1, price: 1200000 }
		],
		discount: { type: 'percent', value: 0 },
		taxRate: 11,
		notes: 'Pembayaran jatuh tempo dalam 14 hari kerja. Transfer ke Rekening BCA: 8870-1234-56 a.n Bisnis Kamu.'
	};

	$: totals = calcInvoiceTotals(invoice);

	onMount(async () => {
		// 1. Template from URL
		const paramTemplate = $page.url.searchParams.get('template');
		if (paramTemplate && INVOICE_TEMPLATES.some((t) => t.id === paramTemplate)) {
			selectedTemplateId = paramTemplate;
		}

		// 2. Load persistent business profile if available
		try {
			const saved = localStorage.getItem('invoicely_business_settings');
			let parsed = saved ? JSON.parse(saved) : null;
			if (!parsed) {
				const remote = await getSettings();
				if (remote) parsed = remote;
			}
			if (parsed) {
				if (parsed.business?.name) {
					invoice.business.name = parsed.business.name;
					if (parsed.business.email) invoice.business.email = parsed.business.email;
					if (parsed.business.address) invoice.business.address = parsed.business.address;
					if (parsed.business.bankInfo) invoice.notes = parsed.business.bankInfo;
					if (parsed.business.logo) invoice.business.logo = parsed.business.logo;
				}
				if (parsed.preferences?.currency) invoice.currency = parsed.preferences.currency;
				if (parsed.preferences?.defaultTax !== undefined) invoice.taxRate = Number(parsed.preferences.defaultTax);
				if (!paramTemplate && parsed.preferences?.defaultTemplate) {
					selectedTemplateId = parsed.preferences.defaultTemplate;
				}
			}
		} catch (e) {}

		// 3. Load existing invoice if ?id=... is provided
		const paramId = $page.url.searchParams.get('id');
		if (paramId) {
			const found = $invoices.find((i) => i.id === paramId);
			if (found) {
				invoiceId = found.id;
				invoice = JSON.parse(JSON.stringify(found));
				if (found.templateId) selectedTemplateId = found.templateId;
				showToast(`📂 Invoice ${found.number} berhasil dimuat!`);
				return;
			}
		}

		// 4. Client parameter from URL (e.g. from /customers or /products)
		const paramClient = $page.url.searchParams.get('client');
		if (paramClient) {
			selectClientByName(paramClient);
			activePartyTab = 'client';
		}

		// 5. Product parameter from URL (e.g. from /products)
		const paramProductId = $page.url.searchParams.get('productId');
		if (paramProductId) {
			const foundProd = $products.find((p) => p.id === paramProductId);
			if (foundProd) {
				const qty = Number($page.url.searchParams.get('qty')) || 1;
				invoice.items = [{ description: foundProd.name, qty, price: foundProd.price }];
				showToast(`✨ Produk "${foundProd.name}" berhasil dimuat!`);
			}
		}

		// 6. Auto Send trigger from URL
		const paramAutoSend = $page.url.searchParams.get('autoSend');
		if (paramAutoSend === 'true') {
			setTimeout(() => {
				showAutoSendModal = true;
			}, 400);
		}
	});

	async function handleSaveInvoice() {
		if (!invoice.client.name.trim()) {
			alert('Mohon isi nama klien / PT terlebih dahulu.');
			return;
		}
		if (invoice.items.length === 0 || !invoice.items[0].description) {
			alert('Mohon isi minimal 1 item tagihan.');
			return;
		}

		// Ensure valid status from PDF contract
		const normalizedStatus = mapToApiStatus(invoice.status);
		invoice.status = normalizedStatus;

		const toSave = {
			...invoice,
			id: invoiceId || invoice.id || `inv-${Date.now()}`,
			templateId: selectedTemplateId,
			template_id: mapToApiTemplateId(selectedTemplateId),
			status: normalizedStatus
		};

		const saved = invoices.saveInvoice(toSave);
		invoiceId = saved.id;
		invoice.id = saved.id;

		// 1. Confetti animation per PDF requirement
		try {
			confetti({
				particleCount: 80,
				spread: 60,
				origin: { y: 0.6 }
			});
		} catch (e) {
			console.warn('Confetti error:', e);
		}

		// 2. Simpan data invoice
		isSavingToApi = true;
		showToast(`⏳ Menyimpan invoice...`);

		try {
			let remoteResult;
			if (saved.backendId) {
				remoteResult = await updateInvoice(saved.backendId, saved, selectedTemplateId);
			} else {
				remoteResult = await createInvoice(saved, selectedTemplateId);
			}

			if (remoteResult && remoteResult.backendId) {
				saved.backendId = remoteResult.backendId;
				invoices.saveInvoice({ ...saved, backendId: remoteResult.backendId });
			}
			backendSyncStatus = 'synced';
			showToast(`🎉 Invoice berhasil disimpan!`);
		} catch (err) {
			backendSyncStatus = 'local_only';
			console.warn('Sync status:', err.message);
			showToast(`🎉 Invoice berhasil disimpan!`);
		} finally {
			isSavingToApi = false;
		}
	}

	function handleDuplicateCurrent() {
		if (invoiceId) {
			const dup = invoices.duplicateInvoice(invoiceId);
			if (dup) {
				invoiceId = dup.id;
				invoice = JSON.parse(JSON.stringify(dup));
				showToast(`✨ Invoice diduplikasi sebagai ${dup.number}!`);
			}
		} else {
			invoice.number = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
			invoice.date = new Date().toISOString().split('T')[0];
			invoice.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			invoice.status = 'draft';
			showToast(`✨ Invoice disalin dengan nomor ${invoice.number}!`);
		}
	}

	function handleLogoUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			alert('Ukuran file logo maksimal 2MB.');
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			invoice.business.logo = event.target.result;
			try {
				const savedSettings = JSON.parse(localStorage.getItem('invoicely_business_settings') || '{}');
				savedSettings.business = { ...(savedSettings.business || {}), logo: event.target.result };
				localStorage.setItem('invoicely_business_settings', JSON.stringify(savedSettings));
			} catch (err) {}
			showToast('🖼️ Logo bisnis berhasil diunggah!');
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		invoice.business.logo = null;
		try {
			const savedSettings = JSON.parse(localStorage.getItem('invoicely_business_settings') || '{}');
			if (savedSettings.business) {
				delete savedSettings.business.logo;
				localStorage.setItem('invoicely_business_settings', JSON.stringify(savedSettings));
			}
		} catch (err) {}
		showToast('Logo bisnis telah dihapus.');
	}

	function selectClientByName(name) {
		const found = $customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
		if (found) {
			invoice.client = {
				name: found.name,
				email: found.email || '',
				phone: found.phone || '',
				address: found.address || ''
			};
			showToast(`🏢 Klien "${found.name}" berhasil dipilih!`);
		} else {
			invoice.client.name = name;
		}
	}

	function saveCurrentClientToStore() {
		if (!invoice.client.name.trim()) {
			alert('Nama PT / Klien belum diisi.');
			return;
		}
		const existing = $customers.find((c) => c.name.toLowerCase() === invoice.client.name.toLowerCase());
		if (existing) {
			customers.updateCustomer(existing.id, {
				email: invoice.client.email,
				phone: invoice.client.phone,
				address: invoice.client.address
			});
			showToast(`✨ Data "${invoice.client.name}" diperbarui di daftar pelanggan!`);
		} else {
			customers.addCustomer({
				name: invoice.client.name,
				email: invoice.client.email || '',
				phone: invoice.client.phone || '',
				address: invoice.client.address || ''
			});
			showToast(`✨ "${invoice.client.name}" disimpan ke daftar pelanggan!`);
		}
	}

	function addItem(desc = '', qty = 1, price = 0) {
		invoice.items = [...invoice.items, { description: desc, qty, price }];
	}

	function addProductFromCatalog(prod) {
		if (invoice.items.length === 1 && !invoice.items[0].description) {
			invoice.items = [{ description: prod.name, qty: 1, price: prod.price }];
		} else {
			invoice.items = [...invoice.items, { description: prod.name, qty: 1, price: prod.price }];
		}
		showProductPickerModal = false;
		showToast(`+ "${prod.name}" ditambahkan ke invoice!`);
	}

	function removeItem(index) {
		if (invoice.items.length <= 1) {
			invoice.items = [{ description: '', qty: 1, price: 0 }];
			return;
		}
		invoice.items = invoice.items.filter((_, i) => i !== index);
	}

	function applyPreset(preset) {
		invoice = {
			...invoice,
			number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
			...preset.data
		};
		showToast(`✨ Preset "${preset.name}" berhasil dimuat!`);
	}

	function insertBankNote(bankName, contohRek) {
		const addition = `Transfer ke Bank ${bankName}: ${contohRek} a.n ${invoice.business.name || 'Bisnis Anda'}`;
		if (invoice.notes) {
			invoice.notes = `${invoice.notes}\n${addition}`;
		} else {
			invoice.notes = addition;
		}
		showToast(`+ Info Bank ${bankName} ditambahkan ke catatan!`);
	}

	function formatPhoneForWhatsApp(raw) {
		if (!raw) return '';
		let clean = raw.replace(/\D/g, '');
		if (clean.startsWith('0')) {
			clean = '62' + clean.slice(1);
		} else if (clean.startsWith('8')) {
			clean = '62' + clean;
		}
		return clean;
	}

	function generateWhatsAppMessage() {
		const bizName = invoice.business.name || 'Bisnis Anda';
		const clientName = invoice.client.name || 'Klien / PT';
		const itemsText = invoice.items
			.filter((it) => it.description)
			.map((it, idx) => `  ${idx + 1}. ${it.description} (${it.qty}x) = ${formatCurrency((it.qty || 0) * (it.price || 0), invoice.currency)}`)
			.join('\n');

		const terbilangStr = invoice.currency === 'IDR' ? angkaTerbilang(totals.total) : '';

		return [
			`Kepada Yth. Tim Finance / Manajemen`,
			`*${clientName}*`,
			``,
			`Berikut kami sampaikan Faktur Tagihan (Invoice) resmi dari *${bizName}*:`,
			``,
			`📄 *No. Invoice:* ${invoice.number}`,
			`📅 *Tanggal Terbit:* ${invoice.date}`,
			`⏳ *Jatuh Tempo:* ${invoice.dueDate}`,
			``,
			`*Rincian Tagihan:*`,
			itemsText || '  (Belum ada item tagihan)',
			``,
			`💰 *Subtotal:* ${formatCurrency(totals.subtotal, invoice.currency)}`,
			totals.discountAmount > 0 ? `🏷️ *Diskon:* -${formatCurrency(totals.discountAmount, invoice.currency)}` : null,
			invoice.taxRate > 0 ? `🏛️ *Pajak (${invoice.taxRate}%):* +${formatCurrency(totals.taxAmount, invoice.currency)}` : null,
			`💵 *TOTAL AKHIR:* *${formatCurrency(totals.total, invoice.currency)}*`,
			terbilangStr ? `🔤 *Terbilang:* _${terbilangStr}_` : null,
			``,
			invoice.notes ? `📌 *Petunjuk Pembayaran / Rekening:*\n${invoice.notes}\n` : null,
			`Mohon konfirmasi jika pembayaran telah diproses. Terima kasih atas kerja samanya! 🙏`
		]
			.filter(Boolean)
			.join('\n');
	}

	function autoSendToWhatsApp() {
		const phone = formatPhoneForWhatsApp(invoice.client.phone);
		const message = generateWhatsAppMessage();

		if (!phone) {
			alert('Nomor WhatsApp PT belum diisi. Silakan lengkapi nomor telepon/WA klien terlebih dahulu.');
			return;
		}

		invoice.status = 'paid' === invoice.status ? 'paid' : 'unpaid';
		handleSaveInvoice();
		showAutoSendModal = false;
		showToast(`🚀 Membuka WhatsApp untuk mengirim ke ${invoice.client.name}...`);

		const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
		window.open(waUrl, '_blank');
	}

	function autoSendToEmail() {
		const email = invoice.client.email;
		if (!email) {
			alert('Email PT belum diisi. Silakan lengkapi alamat email klien.');
			return;
		}

		const subject = `[Invoice Tagihan] ${invoice.number} - ${invoice.business.name || 'Bisnis Anda'} untuk ${invoice.client.name}`;
		const message = generateWhatsAppMessage().replace(/\*/g, '');

		invoice.status = 'paid' === invoice.status ? 'paid' : 'unpaid';
		handleSaveInvoice();
		showAutoSendModal = false;
		showToast(`✉️ Membuka email untuk mengirim ke ${invoice.client.name}...`);

		const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
		window.location.href = mailtoUrl;
	}

	function copyWhatsAppSummary() {
		const msg = generateWhatsAppMessage();
		navigator.clipboard.writeText(msg).then(() => {
			showToast('📱 Ringkasan siap kirim berhasil disalin untuk WhatsApp!');
		}).catch(() => {
			showToast('Gagal menyalin, periksa izin peramban.');
		});
	}

	function resetForm() {
		if (confirm('Apakah Anda yakin ingin mengosongkan formulir invoice ini?')) {
			invoiceId = null;
			invoice = {
				id: `inv-${Date.now()}`,
				number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
				date: new Date().toISOString().split('T')[0],
				dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				currency: 'IDR',
				status: 'unpaid',
				business: { name: '', address: '', email: '', logo: null },
				client: { name: '', address: '', email: '', phone: '' },
				items: [{ description: '', qty: 1, price: 0 }],
				discount: { type: 'percent', value: 0 },
				taxRate: 0,
				notes: ''
			};
			showToast('Formulir telah direset.');
		}
	}

	async function exportPDF() {
		isExporting = true;
		try {
			const html2pdf = (await import('html2pdf.js')).default;
			const element = document.getElementById('invoice-preview');
			if (!element) {
				showToast('Preview invoice tidak ditemukan.');
				return;
			}
			await html2pdf()
				.set({
					margin: 0,
					filename: `${invoice.number || 'invoice'}.pdf`,
					image: { type: 'jpeg', quality: 0.98 },
					html2canvas: { scale: 2, useCORS: true },
					jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
				})
				.from(element)
				.save();
			showToast('🎉 PDF berhasil diunduh!');
		} catch (err) {
			console.error('Gagal export PDF:', err);
			showToast('Gagal membuat PDF. Coba fitur Cetak.');
		} finally {
			isExporting = false;
		}
	}

	async function exportPNG() {
		isExporting = true;
		try {
			const html2pdf = (await import('html2pdf.js')).default;
			const element = document.getElementById('invoice-preview');
			if (!element) {
				showToast('Preview invoice tidak ditemukan.');
				return;
			}
			const worker = html2pdf().from(element).set({
				html2canvas: { scale: 2, useCORS: true }
			});
			const canvas = await worker.toCanvas();
			const imgData = canvas.toDataURL('image/png');
			const link = document.createElement('a');
			link.href = imgData;
			link.download = `${invoice.number || 'invoice'}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			showToast('🖼️ Gambar PNG invoice berhasil diunduh!');
		} catch (err) {
			console.error('Gagal export PNG:', err);
			showToast('Gagal mengunduh gambar PNG.');
		} finally {
			isExporting = false;
		}
	}
</script>

<svelte:head>
	<title>Buat Invoice — Invoicely</title>
</svelte:head>

<AppShell title="Buat Invoice">
	<!-- Dedicated Action Navbar for Invoice Editor -->
	<div class="mb-6 card p-4 shadow-md space-y-4">
		<!-- Row 1: Header Info & Action Buttons -->
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
			<!-- Left: Breadcrumb / Number / Status -->
			<div class="flex flex-wrap items-center gap-2.5">
				<a
					href="/invoices"
					class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 transition"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span>Daftar Invoice</span>
				</a>
				<span class="text-slate-300 dark:text-slate-700">/</span>
				<div class="flex items-center gap-2">
					<span class="text-base font-black tracking-tight text-slate-900 dark:text-white">
						{invoice.number || 'Draft'}
					</span>

					<!-- Status Pill Dropdown -->
					<select
						class="text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
							{['Lunas', 'paid'].includes(invoice.status) ? 'text-emerald-600 border-emerald-300 dark:text-emerald-400' : ['Terkirim', 'overdue'].includes(invoice.status) ? 'text-blue-600 border-blue-300 dark:text-blue-400' : ['Belum Dibayar', 'unpaid'].includes(invoice.status) ? 'text-amber-600 border-amber-300 dark:text-amber-400' : 'text-slate-600 border-slate-300 dark:text-slate-400'}"
						bind:value={invoice.status}
						on:change={handleSaveInvoice}
						title="Pilih status invoice (sesuai kontrak backend)"
					>
						<option value="Draft">Draft</option>
						<option value="Belum Dibayar">⏳ Belum Dibayar</option>
						<option value="Terkirim">📤 Terkirim</option>
						<option value="Lunas">✓ Lunas</option>
					</select>

					<!-- Backend DB sync badge -->
					{#if backendSyncStatus === 'synced'}
						<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" title="Invoice berhasil disimpan">
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
							<span>Tersimpan</span>
						</span>
					{:else if backendSyncStatus === 'local_only'}
						<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" title="Data berhasil disimpan">
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
							<span>Tersimpan</span>
						</span>
					{/if}
				</div>
			</div>

			<!-- Right: Action Buttons Group -->
			<div class="flex flex-wrap items-center gap-2">
				<!-- SIMPAN INVOICE KE RIWAYAT -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-soft hover:bg-primary-700 transition"
					on:click={handleSaveInvoice}
					title="Simpan invoice ke daftar riwayat"
				>
					<span>💾 Simpan</span>
				</button>

				<!-- AUTO KIRIM KE PT BUTTON -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition"
					on:click={() => (showAutoSendModal = true)}
					title="Kirim otomatis ke WhatsApp atau Email PT"
				>
					<span>🚀 Auto Kirim PT</span>
				</button>

				<!-- Duplikat -->
				<button
					type="button"
					class="btn-secondary text-xs py-2 px-3"
					on:click={handleDuplicateCurrent}
					title="Duplikat invoice ini"
				>
					<span>📄 Duplikat</span>
				</button>

				<!-- Copy WhatsApp Button -->
				<button
					type="button"
					class="btn-secondary text-xs py-2 px-3"
					on:click={copyWhatsAppSummary}
					title="Salin ringkasan pesan WhatsApp"
				>
					<span>💬 WA</span>
				</button>

				<!-- Unduh PNG Gambar -->
				<button
					type="button"
					class="btn-secondary text-xs py-2 px-3"
					on:click={exportPNG}
					disabled={isExporting}
					title="Unduh sebagai Gambar PNG (siap kirim WhatsApp)"
				>
					<span>🖼️ PNG</span>
				</button>

				<!-- Unduh PDF -->
				<button
					type="button"
					class="btn-secondary text-xs py-2 px-3"
					on:click={exportPDF}
					disabled={isExporting}
				>
					{#if isExporting}
						<svg class="h-3.5 w-3.5 animate-spin text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
						</svg>
					{:else}
						<span>📄 PDF</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Row 2: Preset Quick Selectors -->
		<div class="flex flex-wrap items-center gap-2 pt-0.5">
			<span class="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
				<span>⚡</span>
				<span>Preset Contoh:</span>
			</span>
			<div class="flex flex-wrap items-center gap-1.5">
				{#each presets as p}
					<button
						type="button"
						class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:bg-primary-50 hover:text-primary dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-primary-500/20 transition"
						on:click={() => applyPreset(p)}
						title={`Isi otomatis dengan preset ${p.name}`}
					>
						<span>{p.icon}</span>
						<span>{p.name}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Visual Template Strip (Wrapped pills without clipping) -->
	<div class="mb-6 card p-4">
		<div class="flex items-center justify-between mb-3">
			<p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
				Pilih Desain Template ({INVOICE_TEMPLATES.length} Pilihan)
			</p>
			<span class="text-xs text-primary font-bold">Aktif: {getTemplateById(selectedTemplateId).name}</span>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			{#each INVOICE_TEMPLATES as t}
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition border
						{selectedTemplateId === t.id
							? 'border-primary bg-primary-50 text-primary shadow-xs dark:bg-primary-500/20 dark:text-primary-300 dark:border-primary-500'
							: 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}"
					on:click={() => (selectedTemplateId = t.id)}
				>
					<span class="h-2 w-2 rounded-full {selectedTemplateId === t.id ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}"></span>
					<span>{t.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Mobile tab switcher -->
	<div class="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 lg:hidden">
		<button
			type="button"
			class="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition
				{mobileView === 'edit'
					? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white'
					: 'text-slate-500 hover:text-slate-700'}"
			on:click={() => (mobileView = 'edit')}
		>
			<span>Form Editor</span>
		</button>
		<button
			type="button"
			class="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition
				{mobileView === 'preview'
					? 'bg-white text-slate-900 shadow-soft dark:bg-surfaceDark dark:text-white'
					: 'text-slate-500 hover:text-slate-700'}"
			on:click={() => (mobileView = 'preview')}
		>
			<span>Pratinjau ({formatCurrency(totals.total, invoice.currency)})</span>
		</button>
	</div>

	<!-- Main Editor & Preview Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-[11fr_13fr] xl:grid-cols-[10fr_14fr]">
		<!-- Form Editor Column -->
		<div class="space-y-5 {mobileView === 'preview' ? 'hidden lg:block' : ''}">
			<!-- Rincian Nomor & Tanggal -->
			<div class="card p-5">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2">
						<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary-500/20">
							📅
						</span>
						<h2 class="font-bold text-slate-900 dark:text-white">Rincian Nomor & Tanggal</h2>
					</div>
					<button type="button" class="text-xs text-slate-400 hover:text-rose-500" on:click={resetForm}>
						Kosongkan
					</button>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label class="field-label" for="inv-number">Nomor Faktur</label>
						<input id="inv-number" class="field-input font-mono" bind:value={invoice.number} />
					</div>
					<div>
						<label class="field-label" for="select-currency">Mata Uang</label>
						<select id="select-currency" class="field-select" bind:value={invoice.currency}>
							{#each currencies as c}
								<option value={c.code}>{c.label}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="field-label" for="inv-date">Tanggal Terbit</label>
						<input id="inv-date" type="date" class="field-input" bind:value={invoice.date} />
					</div>
					<div>
						<label class="field-label" for="inv-due">Jatuh Tempo</label>
						<input id="inv-due" type="date" class="field-input" bind:value={invoice.dueDate} />
					</div>
				</div>
			</div>

			<!-- Info Entitas: Bisnis & Klien (Satu Card dengan Sistem Tab) -->
			<div class="card p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
				<!-- Tab Navigation Header -->
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
					<!-- Tab Buttons -->
					<div class="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl">
						<button
							type="button"
							class="flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all {activePartyTab === 'business'
								? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60'
								: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}"
							on:click={() => (activePartyTab = 'business')}
						>
							<span class="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary-500/20 text-xs">
								🏢
							</span>
							<span>Bisnis Anda</span>
							{#if invoice.business?.name}
								<span class="max-w-[110px] truncate text-[10px] font-normal text-slate-400">
									({invoice.business.name})
								</span>
							{/if}
						</button>

						<button
							type="button"
							class="flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all {activePartyTab === 'client'
								? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30 dark:ring-emerald-500/30'
								: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}"
							on:click={() => (activePartyTab = 'client')}
						>
							<span class="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 text-xs">
								👤
							</span>
							<span>Klien Ditagih (PT)</span>
							{#if invoice.client?.name}
								<span class="max-w-[120px] truncate text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
									({invoice.client.name})
								</span>
							{/if}
						</button>
					</div>

					<!-- Contextual Header Actions -->
					<div class="flex items-center gap-2">
						{#if activePartyTab === 'business'}
							<!-- Logo Upload Trigger -->
							<label class="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
								<span>{invoice.business?.logo ? '📷 Ganti Logo' : '+ Upload Logo'}</span>
								<input type="file" accept="image/*" class="hidden" on:change={handleLogoUpload} />
							</label>
						{:else}
							<!-- Quick Save PT -->
							<button
								type="button"
								class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
								on:click={saveCurrentClientToStore}
								title="Simpan atau update data PT ini ke kontak pelanggan"
							>
								💾 Simpan ke Kontak
							</button>
						{/if}
					</div>
				</div>

				<!-- Tab 1: Bisnis Anda Content -->
				{#if activePartyTab === 'business'}
					<div>
						{#if invoice.business?.logo}
							<div class="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
								<div class="flex items-center gap-3">
									<img src={invoice.business.logo} alt="Logo" class="h-9 w-auto max-w-[100px] object-contain rounded" />
									<div>
										<div class="text-xs font-medium text-slate-800 dark:text-slate-200">Logo Bisnis Terpasang</div>
										<div class="text-[10px] text-slate-400">Akan tampil otomatis di kop faktur</div>
									</div>
								</div>
								<button type="button" class="text-xs text-rose-500 hover:underline px-2 py-1" on:click={removeLogo}>
									Hapus
								</button>
							</div>
						{/if}

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div>
								<label class="field-label" for="biz-name">Nama Bisnis / Brand</label>
								<input id="biz-name" class="field-input" bind:value={invoice.business.name} placeholder="cth. Bisnis Kamu Official" />
							</div>
							<div>
								<label class="field-label" for="biz-email">Email Bisnis</label>
								<input id="biz-email" type="email" class="field-input" bind:value={invoice.business.email} placeholder="billing@bisniskamu.com" />
							</div>
							<div class="sm:col-span-2">
								<label class="field-label" for="biz-address">Alamat Bisnis / Kantor</label>
								<input id="biz-address" class="field-input" bind:value={invoice.business.address} placeholder="Alamat lengkap, kota, kode pos" />
							</div>
						</div>

						<div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
							<span>Profil pengirim invoice</span>
							<button
								type="button"
								class="text-primary hover:underline font-medium inline-flex items-center gap-1"
								on:click={() => (activePartyTab = 'client')}
							>
								Lanjut isi Klien Ditagih →
							</button>
						</div>
					</div>

				<!-- Tab 2: Klien Ditagih (PT) Content -->
				{:else}
					<div>
						<!-- Dropdown Auto-Fill PT -->
						<div class="mb-4 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
							<div class="flex items-center justify-between mb-1">
								<label class="field-label text-[11px] text-slate-500 mb-0" for="select-saved-pt">
									Pilih PT / Klien Tersimpan (Auto-Fill)
								</label>
								<span class="text-[10px] text-slate-400">{$customers.length} kontak tersedia</span>
							</div>
							<select
								id="select-saved-pt"
								class="field-select text-xs py-1.5"
								on:change={(e) => {
									if (e.target.value) selectClientByName(e.target.value);
								}}
							>
								<option value="">-- Pilih PT Tersimpan --</option>
								{#each $customers as c}
									<option value={c.name} selected={c.name === invoice.client.name}>
										{c.name} {c.phone ? `(${c.phone})` : ''}
									</option>
								{/each}
							</select>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div>
								<label class="field-label" for="client-name">Nama Klien / PT *</label>
								<input id="client-name" class="field-input" bind:value={invoice.client.name} placeholder="cth. PT Sumber Makmur Sejahtera" />
							</div>
							<div>
								<label class="field-label" for="client-phone">No. WhatsApp / HP PT * (Untuk Auto Kirim)</label>
								<div class="relative">
									<span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">💬</span>
									<input id="client-phone" class="field-input pl-8 font-mono text-xs" bind:value={invoice.client.phone} placeholder="cth. 081234567890" />
								</div>
							</div>
							<div>
								<label class="field-label" for="client-email">Email Finance PT</label>
								<input id="client-email" type="email" class="field-input text-xs" bind:value={invoice.client.email} placeholder="finance@perusahaan.co.id" />
							</div>
							<div>
								<label class="field-label" for="client-address">Alamat Kantor PT</label>
								<input id="client-address" class="field-input text-xs" bind:value={invoice.client.address} placeholder="Gedung, Lantai, Jalan, Kota" />
							</div>
						</div>

						<div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
							<button
								type="button"
								class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium inline-flex items-center gap-1"
								on:click={() => (activePartyTab = 'business')}
							>
								← Cek Bisnis Anda
							</button>
							<span class="text-emerald-600 dark:text-emerald-400 font-medium">Data tujuan tagihan</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Item & Tagihan (Dengan Quick Catalog Picker) -->
			<div class="card p-5">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
					<div class="flex items-center gap-2">
						<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary-500/20">
							📋
						</span>
						<h2 class="font-bold text-slate-900 dark:text-white">Daftar Tagihan</h2>
					</div>

					<div class="flex items-center gap-2">
						<!-- Tombol Pilih dari Katalog Produk -->
						<button
							type="button"
							class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 px-3 py-1.5 rounded-xl transition border border-emerald-200 dark:border-emerald-500/30"
							on:click={() => (showProductPickerModal = true)}
						>
							<span>📦 + Dari Katalog Produk</span>
						</button>

						<!-- Tombol Baris Manual -->
						<button
							type="button"
							class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/15 dark:hover:bg-primary-500/25 px-3 py-1.5 rounded-xl transition"
							on:click={() => addItem()}
						>
							+ Baris Manual
						</button>
					</div>
				</div>

				<div class="space-y-3">
					{#each invoice.items as item, i}
						{@const rowTotal = (Number(item.qty) || 0) * (Number(item.price) || 0)}
						<div class="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
							<div class="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
								<div class="flex-1 w-full">
									<label class="field-label text-xs" for={`item-desc-${i}`}>Item #{i + 1}</label>
									<input
										id={`item-desc-${i}`}
										class="field-input"
										bind:value={item.description}
										placeholder="Nama barang atau deskripsi jasa"
									/>
								</div>
								<div class="flex items-end gap-2 w-full sm:w-auto">
									<div class="w-20">
										<label class="field-label text-xs" for={`item-qty-${i}`}>Qty</label>
										<input id={`item-qty-${i}`} type="number" min="1" class="field-input" bind:value={item.qty} />
									</div>
									<div class="w-36">
										<label class="field-label text-xs" for={`item-price-${i}`}>Harga Satuan</label>
										<input id={`item-price-${i}`} type="number" min="0" step="10000" class="field-input" bind:value={item.price} />
									</div>
									<button
										type="button"
										class="rounded-xl p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
										on:click={() => removeItem(i)}
										title="Hapus baris item"
										aria-label="Hapus item"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
							<div class="mt-2 flex justify-end text-xs text-slate-500 dark:text-slate-400">
								<span>Subtotal Baris: <strong class="text-slate-800 dark:text-slate-200">{formatCurrency(rowTotal, invoice.currency)}</strong></span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Diskon, Pajak & Terbilang -->
			<div class="card p-5">
				<div class="flex items-center gap-2 mb-3">
					<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary-500/20">
						🏷️
					</span>
					<h2 class="font-bold text-slate-900 dark:text-white">Diskon & Pajak</h2>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
					<div>
						<label class="field-label" for="disc-type">Jenis Diskon</label>
						<select id="disc-type" class="field-select" bind:value={invoice.discount.type}>
							<option value="percent">Persentase (%)</option>
							<option value="fixed">Nominal Tetap ({invoice.currency})</option>
						</select>
					</div>
					<div>
						<label class="field-label" for="disc-val">Nilai Diskon</label>
						<input id="disc-val" type="number" min="0" class="field-input" bind:value={invoice.discount.value} placeholder="0" />
					</div>
					<div>
						<label class="field-label" for="inv-tax">Pajak / PPN (%)</label>
						<input id="inv-tax" type="number" min="0" max="100" class="field-input" bind:value={invoice.taxRate} placeholder="0" />
					</div>
				</div>

				<!-- Live calculation breakdown box -->
				<div class="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 text-sm">
					<div class="flex justify-between text-slate-600 dark:text-slate-300">
						<span>Subtotal ({invoice.items.length} item)</span>
						<span class="font-medium">{formatCurrency(totals.subtotal, invoice.currency)}</span>
					</div>
					{#if totals.discountAmount > 0}
						<div class="flex justify-between text-emerald-600 dark:text-emerald-400">
							<span>Diskon {invoice.discount.type === 'percent' ? `(${invoice.discount.value}%)` : ''}</span>
							<span>-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
						</div>
					{/if}
					{#if invoice.taxRate > 0}
						<div class="flex justify-between text-slate-600 dark:text-slate-300">
							<span>Pajak PPN ({invoice.taxRate}%)</span>
							<span>+{formatCurrency(totals.taxAmount, invoice.currency)}</span>
						</div>
					{/if}
					<div class="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900 dark:border-slate-700 dark:text-white">
						<span>Total Tagihan Akhir</span>
						<span class="text-primary text-xl">{formatCurrency(totals.total, invoice.currency)}</span>
					</div>

					<!-- Teks Terbilang Resmi -->
					{#if invoice.currency === 'IDR'}
						<div class="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
							<span class="font-bold text-slate-700 dark:text-slate-300">Terbilang:</span>
							<span class="italic text-slate-600 dark:text-slate-400 ml-1">{angkaTerbilang(totals.total)}</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Catatan & Bank Quick Inserter -->
			<div class="card p-5">
				<div class="flex items-center justify-between mb-2">
					<label class="field-label font-bold text-slate-900 dark:text-white mb-0" for="notes">
						Catatan Pembayaran & Rekening
					</label>
				</div>

				<!-- Bank Inserter Chips -->
				<div class="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
					<span class="text-slate-400">Sisipkan Bank:</span>
					<button
						type="button"
						class="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-primary-50 hover:text-primary dark:bg-slate-800 dark:text-slate-300 transition font-medium"
						on:click={() => insertBankNote('BCA', '8870-1234-56')}
					>
						+ BCA
					</button>
					<button
						type="button"
						class="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-primary-50 hover:text-primary dark:bg-slate-800 dark:text-slate-300 transition font-medium"
						on:click={() => insertBankNote('Mandiri', '142-00-112233-4')}
					>
						+ Mandiri
					</button>
					<button
						type="button"
						class="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-primary-50 hover:text-primary dark:bg-slate-800 dark:text-slate-300 transition font-medium"
						on:click={() => insertBankNote('BNI', '088-999-7766')}
					>
						+ BNI
					</button>
					<button
						type="button"
						class="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-primary-50 hover:text-primary dark:bg-slate-800 dark:text-slate-300 transition font-medium"
						on:click={() => insertBankNote('BRI', '0341-01-002233-50-1')}
					>
						+ BRI
					</button>
					<button
						type="button"
						class="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-primary-50 hover:text-primary dark:bg-slate-800 dark:text-slate-300 transition font-medium"
						on:click={() => insertBankNote('QRIS', 'Scan QRIS terlampir')}
					>
						+ QRIS
					</button>
				</div>

				<textarea id="notes" class="field-input" rows="3" bind:value={invoice.notes} placeholder="cth. Transfer ke Rekening BCA: 1234567890 a.n Nama Anda"></textarea>
			</div>
		</div>

		<!-- Live Preview Column -->
		<div class="{mobileView === 'edit' ? 'hidden lg:block' : ''}">
			<div class="sticky top-24 space-y-3">
				<!-- Top Preview Controls & Zoom Toolbar -->
				<div class="flex items-center justify-between rounded-xl bg-slate-200/70 p-2.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-xs backdrop-blur">
					<div class="flex items-center gap-2 font-medium px-1">
						<span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
						<span>Pratinjau: <strong>{getTemplateById(selectedTemplateId).name}</strong></span>
					</div>

					<!-- Zoom controls -->
					<div class="flex items-center gap-1">
						<button
							type="button"
							class="rounded-lg px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-700 transition {zoomScale === 0.85 ? 'bg-slate-300 font-bold dark:bg-slate-700' : ''}"
							on:click={() => (zoomScale = 0.85)}
							title="Zoom 85%"
						>
							85%
						</button>
						<button
							type="button"
							class="rounded-lg px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-700 transition {zoomScale === 1 ? 'bg-slate-300 font-bold dark:bg-slate-700' : ''}"
							on:click={() => (zoomScale = 1)}
							title="Zoom 100%"
						>
							100%
						</button>
						<button
							type="button"
							class="rounded-lg px-2 py-1 hover:bg-slate-300 dark:hover:bg-slate-700 transition {zoomScale === 1.15 ? 'bg-slate-300 font-bold dark:bg-slate-700' : ''}"
							on:click={() => (zoomScale = 1.15)}
							title="Zoom 115%"
						>
							115%
						</button>
					</div>
				</div>

				<!-- Render Container with Paper Shadow & Stempel LUNAS / JATUH TEMPO -->
				<div class="max-h-[calc(100vh-10rem)] overflow-auto rounded-2xl bg-slate-200/60 p-4 sm:p-6 dark:bg-slate-900/70 shadow-inner">
					<div
						class="relative transition-transform origin-top duration-150"
						style="transform: scale({zoomScale}); transform-origin: top center;"
					>
						<!-- Authentic Watermark / Stamp Overlay -->
						{#if invoice.status === 'paid'}
							<div class="pointer-events-none absolute top-12 right-12 z-20 rotate-[-15deg] rounded-2xl border-4 border-emerald-600/80 bg-emerald-50/80 px-6 py-2.5 text-xl sm:text-2xl font-black uppercase tracking-widest text-emerald-600/90 shadow-xl backdrop-blur-xs select-none">
								✓ LUNAS / PAID
							</div>
						{:else if invoice.status === 'overdue'}
							<div class="pointer-events-none absolute top-12 right-12 z-20 rotate-[-15deg] rounded-2xl border-4 border-rose-600/80 bg-rose-50/80 px-6 py-2.5 text-xl sm:text-2xl font-black uppercase tracking-widest text-rose-600/90 shadow-xl backdrop-blur-xs select-none">
								⚠️ JATUH TEMPO
							</div>
						{/if}

						<svelte:component this={SelectedTemplate} {invoice} />
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Modal: Pilih Produk dari Katalog -->
	{#if showProductPickerModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
			<div class="w-full max-w-lg card p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
					<div class="flex items-center gap-2">
						<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
							📦
						</span>
						<h3 class="text-lg font-bold text-slate-900 dark:text-white">Pilih dari Katalog Produk</h3>
					</div>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						on:click={() => (showProductPickerModal = false)}
					>
						✕
					</button>
				</div>

				<p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
					Pilih produk atau jasa yang ingin ditambahkan langsung ke tagihan invoice ini:
				</p>

				<div class="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
					{#each $products as p}
						<button
							type="button"
							class="w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-emerald-500/50 transition text-left group"
							on:click={() => addProductFromCatalog(p)}
						>
							<div>
								<div class="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
									{p.name}
								</div>
								<div class="flex items-center gap-2 mt-1">
									<span class="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
										{p.category}
									</span>
									<span class="text-xs text-slate-400">Satuan: {p.unit || 'Unit'}</span>
								</div>
							</div>
							<div class="text-right">
								<div class="font-black text-slate-900 dark:text-white text-sm">
									{formatCurrency(p.price, invoice.currency)}
								</div>
								<span class="text-[11px] font-bold text-emerald-600 group-hover:underline">
									+ Tambahkan
								</span>
							</div>
						</button>
					{/each}
				</div>

				<div class="mt-4 flex justify-between items-center border-t border-slate-100 pt-3 dark:border-slate-800">
					<a href="/products" class="text-xs font-semibold text-primary hover:underline">
						⚙️ Kelola Katalog Produk &rarr;
					</a>
					<button type="button" class="btn-ghost text-xs" on:click={() => (showProductPickerModal = false)}>
						Tutup
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal: AUTO KIRIM KE PT -->
	{#if showAutoSendModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
			<div class="w-full max-w-lg card p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
				<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
					<div class="flex items-center gap-2">
						<span class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-lg shadow-sm">
							🚀
						</span>
						<div>
							<h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">Auto Kirim ke PT</h3>
							<p class="text-xs text-slate-400">Kirim faktur penagihan resmi ke perusahaan klien</p>
						</div>
					</div>
					<button
						type="button"
						class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
						on:click={() => (showAutoSendModal = false)}
					>
						✕
					</button>
				</div>

				<div class="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
					<!-- Target PT Summary Box -->
					<div class="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white shadow-md">
						<div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Tujuan Pengiriman</div>
						<div class="text-lg font-black tracking-tight text-white mt-0.5">{invoice.client.name || '(Nama PT Belum Diisi)'}</div>
						<div class="mt-2 grid grid-cols-2 gap-2 text-xs border-t border-slate-700/60 pt-2 text-slate-300">
							<div>
								<span class="text-slate-400">Total Tagihan:</span>
								<div class="font-bold text-emerald-400 text-sm">{formatCurrency(totals.total, invoice.currency)}</div>
							</div>
							<div>
								<span class="text-slate-400">Jatuh Tempo:</span>
								<div class="font-semibold">{invoice.dueDate}</div>
							</div>
						</div>
					</div>

					<!-- Option 1: WhatsApp Otomatis ke PT -->
					<div class="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-xl">💬</span>
								<span class="font-bold text-emerald-950 dark:text-emerald-200 text-sm">Kirim via WhatsApp ke PT</span>
							</div>
							<span class="badge-paid text-[10px]">Rekomendasi</span>
						</div>

						<p class="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
							Membuka chat WhatsApp langsung ke nomor PT dengan draf pesan tagihan resmi & instruksi pembayaran.
						</p>

						<div class="mt-3">
							<label class="field-label text-[11px] text-emerald-900 dark:text-emerald-200 mb-1" for="wa-target-phone">
								Nomor WhatsApp PT Penerima:
							</label>
							<div class="flex gap-2">
								<input
									id="wa-target-phone"
									class="field-input text-xs font-mono py-1.5"
									placeholder="cth. 081234567890 atau 62811..."
									bind:value={invoice.client.phone}
								/>
								<button
									type="button"
									class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm shrink-0 transition"
									on:click={autoSendToWhatsApp}
								>
									<span>Buka WA PT</span>
									<span>&rarr;</span>
								</button>
							</div>
						</div>
					</div>

					<!-- Option 2: Email Resmi ke PT -->
					<div class="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
						<div class="flex items-center gap-2">
							<span class="text-xl">✉️</span>
							<span class="font-bold text-slate-900 dark:text-white text-sm">Kirim via Email Resmi ke PT</span>
						</div>

						<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
							Membuka aplikasi email dengan subjek formal dan rincian faktur siap kirim ke bagian Finance PT.
						</p>

						<div class="mt-3">
							<label class="field-label text-[11px] mb-1" for="email-target">
								Email Finance PT:
							</label>
							<div class="flex gap-2">
								<input
									id="email-target"
									type="email"
									class="field-input text-xs py-1.5"
									placeholder="cth. finance@sumbermakmur.co.id"
									bind:value={invoice.client.email}
								/>
								<button
									type="button"
									class="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 text-xs font-bold text-white shadow-sm shrink-0 transition"
									on:click={autoSendToEmail}
								>
									<span>Buka Email</span>
									<span>&rarr;</span>
								</button>
							</div>
						</div>
					</div>

					<!-- Option 3: Salin Pesan Manual -->
					<div class="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800 text-xs">
						<span class="text-slate-600 dark:text-slate-300">Mau salin teks pesan saja?</span>
						<button
							type="button"
							class="font-bold text-primary hover:underline"
							on:click={copyWhatsAppSummary}
						>
							📋 Salin Teks Tagihan
						</button>
					</div>
				</div>

				<div class="mt-4 flex justify-between items-center border-t border-slate-100 pt-3 dark:border-slate-800">
					<button
						type="button"
						class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
						on:click={() => {
							invoice.status = 'paid';
							handleSaveInvoice();
							showAutoSendModal = false;
							showToast(`✅ Status invoice diubah menjadi: Lunas!`);
						}}
					>
						✓ Tandai Sebagai Lunas
					</button>

					<button type="button" class="btn-ghost text-xs" on:click={() => (showAutoSendModal = false)}>
						Tutup
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Floating Toast Notification -->
	{#if toastVisible}
		<div class="fixed bottom-6 right-6 z-50 toast-enter">
			<div class="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-slate-900 border border-slate-700 dark:border-slate-200">
				<span>{toastMessage}</span>
				<button
					type="button"
					class="text-slate-400 hover:text-white dark:hover:text-slate-900 ml-2"
					on:click={() => (toastVisible = false)}
					aria-label="Tutup notifikasi"
				>
					✕
				</button>
			</div>
		</div>
	{/if}
</AppShell>
