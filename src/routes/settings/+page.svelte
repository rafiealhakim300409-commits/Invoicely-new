<script>
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { theme } from '$lib/stores/theme.js';
	import { INVOICE_TEMPLATES } from '$lib/utils/invoiceTemplates.js';
	import { products, customers, invoices } from '$lib/stores/data.js';
	import { getSettings, saveSettings as apiSaveSettings, triggerCronReminders } from '$lib/services/api.js';

	let toastVisible = false;
	let toastMessage = '';
	let isSaving = false;

	// Cron settings & test state
	let cronOrigin = '';
	let isRunningCronTest = false;
	let cronTestResult = null;
	let cronSecretInput = 'invoicely_cron_secret';

	let business = {
		name: 'Bisnis Kamu',
		email: 'billing@bisniskamu.com',
		phone: '0812-3456-7890',
		address: 'Jl. Pemuda No. 12, Surabaya',
		bankInfo: 'Transfer ke Bank BCA: 8870-1234-56 a.n Bisnis Kamu',
		logo: null
	};

	let preferences = {
		currency: 'IDR',
		defaultTax: 11,
		defaultTemplate: 'modern-minimal'
	};

	onMount(async () => {
		try {
			const saved = localStorage.getItem('invoicely_business_settings');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.business) business = { ...business, ...parsed.business };
				if (parsed.preferences) preferences = { ...preferences, ...parsed.preferences };
			}
		} catch (e) {}

		try {
			const remote = await getSettings();
			if (remote) {
				if (remote.business) business = { ...business, ...remote.business };
				if (remote.preferences) preferences = { ...preferences, ...remote.preferences };
				localStorage.setItem('invoicely_business_settings', JSON.stringify({ business, preferences }));
			}
		} catch (e) {
			console.warn('Could not fetch settings from backend:', e.message);
		}

		if (typeof window !== 'undefined') {
			cronOrigin = window.location.origin;
		}
	});

	async function runCronTest() {
		isRunningCronTest = true;
		cronTestResult = null;
		try {
			const res = await triggerCronReminders(cronSecretInput);
			cronTestResult = res;
			const sent = res.summary?.reminders_sent ?? 0;
			toastMessage = `✨ Tes Cron selesai! ${sent} email pengingat berhasil dikirim.`;
			toastVisible = true;
			setTimeout(() => { toastVisible = false; }, 4000);
		} catch (err) {
			console.error('Error running cron test:', err);
			cronTestResult = { status: 'error', message: err.message };
			toastMessage = `⚠️ Gagal tes cron: ${err.message}`;
			toastVisible = true;
			setTimeout(() => { toastVisible = false; }, 4000);
		} finally {
			isRunningCronTest = false;
		}
	}

	function copyCronUrl() {
		const fullUrl = `${cronOrigin || 'http://localhost:5173'}/api/cron/reminders?key=${cronSecretInput}`;
		navigator.clipboard.writeText(fullUrl);
		toastMessage = '📋 URL Cron Job berhasil disalin!';
		toastVisible = true;
		setTimeout(() => { toastVisible = false; }, 3000);
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
			business.logo = event.target.result;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		business.logo = null;
	}

	async function saveSettings() {
		isSaving = true;
		try {
			localStorage.setItem(
				'invoicely_business_settings',
				JSON.stringify({ business, preferences })
			);

			await apiSaveSettings({ business, preferences });

			toastMessage = '✨ Pengaturan profil & preferensi berhasil disimpan!';
			toastVisible = true;
			setTimeout(() => {
				toastVisible = false;
			}, 3500);
		} catch (e) {
			console.error('Error saving settings:', e);
			toastMessage = '⚠️ Gagal menyimpan pengaturan: ' + e.message;
			toastVisible = true;
			setTimeout(() => {
				toastVisible = false;
			}, 3500);
		} finally {
			isSaving = false;
		}
	}

	function backupAllData() {
		try {
			const backup = {
				version: '1.0',
				exportedAt: new Date().toISOString(),
				businessSettings: { business, preferences },
				products: JSON.parse(localStorage.getItem('invoicely_products') || '[]'),
				customers: JSON.parse(localStorage.getItem('invoicely_customers') || '[]'),
				invoices: JSON.parse(localStorage.getItem('invoicely_invoices') || '[]')
			};

			const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `backup-invoicely-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toastMessage = '📥 Cadangan data (JSON) berhasil diunduh!';
			toastVisible = true;
			setTimeout(() => {
				toastVisible = false;
			}, 3500);
		} catch (err) {
			alert('Gagal membuat cadangan data.');
		}
	}

	function handleRestoreData(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const parsed = JSON.parse(event.target.result);
				if (!parsed.version && !parsed.products && !parsed.invoices) {
					alert('Format file cadangan tidak valid.');
					return;
				}

				if (confirm('Pulihkan data dari file cadangan ini? Data yang ada saat ini akan ditimpa.')) {
					if (parsed.businessSettings) {
						localStorage.setItem('invoicely_business_settings', JSON.stringify(parsed.businessSettings));
						if (parsed.businessSettings.business) business = { ...business, ...parsed.businessSettings.business };
						if (parsed.businessSettings.preferences) preferences = { ...preferences, ...parsed.businessSettings.preferences };
					}
					if (Array.isArray(parsed.products)) {
						products.set(parsed.products);
					}
					if (Array.isArray(parsed.customers)) {
						customers.set(parsed.customers);
					}
					if (Array.isArray(parsed.invoices)) {
						invoices.set(parsed.invoices);
					}

					toastMessage = '🎉 Data berhasil dipulihkan dari cadangan!';
					toastVisible = true;
					setTimeout(() => {
						toastVisible = false;
					}, 3500);
				}
			} catch (err) {
				alert('Gagal membaca file cadangan. Pastikan file berupa JSON valid.');
			}
		};
		reader.readAsText(file);
	}
</script>

<svelte:head><title>Pengaturan Bisnis — Invoicely</title></svelte:head>

<AppShell title="Pengaturan Bisnis">
	<div class="mx-auto max-w-3xl space-y-6">
		<!-- Header Info -->
		<div class="glass-card p-6">
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary text-xl dark:bg-primary-500/20">
					🏢
				</div>
				<div>
					<h2 class="text-xl font-bold text-slate-900 dark:text-white">Profil Usaha & Preferensi</h2>
					<p class="text-xs text-slate-500 dark:text-slate-400">Data ini akan otomatis dimuat saat Anda membuat invoice baru.</p>
				</div>
			</div>
		</div>

		<!-- Form Bisnis & Logo -->
		<div class="card p-6 space-y-4 shadow-soft">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
				<h3 class="font-bold text-slate-900 dark:text-white text-base">Identitas Bisnis & Logo</h3>
				<span class="text-xs text-slate-400">Tampil di header invoice</span>
			</div>

			<!-- Logo Uploader -->
			<div class="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
				<div class="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
					{#if business.logo}
						<img src={business.logo} alt="Logo" class="max-h-full max-w-full object-contain" />
					{:else}
						<span class="text-2xl text-slate-300">🏢</span>
					{/if}
				</div>
				<div class="flex-1 space-y-1">
					<p class="text-sm font-bold text-slate-800 dark:text-slate-200">Logo Resmi Perusahaan / Brand</p>
					<p class="text-xs text-slate-400">Format PNG, JPG, SVG (maksimal 2MB). Disarankan berlatar transparan.</p>
					<div class="flex items-center gap-2 pt-1">
						<label class="btn-primary text-xs py-1.5 px-3 cursor-pointer">
							<span>{business.logo ? 'Ganti Logo' : 'Upload Logo'}</span>
							<input type="file" accept="image/*" class="hidden" on:change={handleLogoUpload} />
						</label>
						{#if business.logo}
							<button type="button" class="btn-ghost text-xs text-rose-500 hover:text-rose-700 py-1.5" on:click={removeLogo}>
								Hapus Logo
							</button>
						{/if}
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="field-label" for="biz-name">Nama Bisnis / Brand / PT</label>
					<input id="biz-name" class="field-input" bind:value={business.name} placeholder="cth. Studio Kreatif Nusantara" />
				</div>
				<div>
					<label class="field-label" for="biz-email">Email Bisnis Resmi</label>
					<input id="biz-email" type="email" class="field-input" bind:value={business.email} placeholder="billing@bisnis.com" />
				</div>
				<div>
					<label class="field-label" for="biz-phone">Nomor Telepon / WhatsApp</label>
					<input id="biz-phone" class="field-input" bind:value={business.phone} placeholder="0812-3456-7890" />
				</div>
				<div>
					<label class="field-label" for="biz-address">Alamat Lengkap Kantor / Studio</label>
					<input id="biz-address" class="field-input" bind:value={business.address} placeholder="Gedung Wisma, Kota" />
				</div>
			</div>

			<div class="pt-2">
				<label class="field-label" for="biz-bank">Rekening Bank & Catatan Pembayaran Bawaan</label>
				<p class="text-xs text-slate-400 mb-2">Informasi ini akan muncul di bagian bawah setiap faktur yang Anda buat.</p>
				<textarea id="biz-bank" class="field-input" rows="3" bind:value={business.bankInfo} placeholder="cth. Rekening BCA: 123-456-7890 a.n Nama Anda"></textarea>
			</div>
		</div>

		<!-- Preferensi Invoice -->
		<div class="card p-6 shadow-soft space-y-4">
			<h3 class="font-bold text-slate-900 dark:text-white text-base">Preferensi Format Faktur</h3>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div>
					<label class="field-label" for="pref-currency">Mata Uang Utama</label>
					<select id="pref-currency" class="field-select" bind:value={preferences.currency}>
						<option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
						<option value="USD">USD - US Dollar ($)</option>
						<option value="EUR">EUR - Euro (€)</option>
						<option value="SGD">SGD - Singapore Dollar (S$)</option>
					</select>
				</div>
				<div>
					<label class="field-label" for="pref-tax">Pajak / PPN Default (%)</label>
					<input id="pref-tax" type="number" min="0" max="100" class="field-input" bind:value={preferences.defaultTax} />
				</div>
				<div>
					<label class="field-label" for="pref-template">Template Favorit</label>
					<select id="pref-template" class="field-select" bind:value={preferences.defaultTemplate}>
						{#each INVOICE_TEMPLATES as t}
							<option value={t.id}>{t.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- Tampilan Tema -->
		<div class="card flex items-center justify-between p-6 shadow-soft">
			<div>
				<h3 class="font-bold text-slate-900 dark:text-white">Tema Tampilan Aplikasi</h3>
				<p class="text-xs text-slate-500 dark:text-slate-400">Pilih antara mode terang yang bersih atau mode gelap yang nyaman di mata.</p>
			</div>
			<button type="button" class="btn-secondary text-xs sm:text-sm" on:click={() => theme.toggle()}>
				{$theme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
			</button>
		</div>

		<!-- Pengingat Jatuh Tempo & Cron Job -->
		<div class="card p-6 shadow-soft space-y-5 border border-indigo-100 dark:border-indigo-950/40">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<div class="flex items-center gap-2">
						<span class="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
						<h3 class="font-bold text-slate-900 dark:text-white text-base">⏰ Pengingat Jatuh Tempo Otomatis (Cron Job)</h3>
					</div>
					<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
						Sistem otomatis memeriksa faktur yang belum lunas (H-3, H-1, Hari H, dan Overdue) lalu mengirim email ramah ke klien.
					</p>
				</div>
				<button
					type="button"
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
					on:click={runCronTest}
					disabled={isRunningCronTest}
				>
					{#if isRunningCronTest}
						<span>⏳ Menjalankan Tes...</span>
					{:else}
						<span>⚡ Uji Kirim Pengingat Sekarang</span>
					{/if}
				</button>
			</div>

			<!-- Webhook URL & Key -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
				<div class="lg:col-span-2">
					<label class="field-label" for="cron-url">URL Endpoint Cron Webhook</label>
					<div class="flex items-center gap-2">
						<input
							id="cron-url"
							type="text"
							readonly
							class="field-input font-mono text-xs bg-slate-50 dark:bg-slate-900/50"
							value="{cronOrigin || 'http://localhost:5173'}/api/cron/reminders?key={cronSecretInput}"
						/>
						<button
							type="button"
							class="btn-secondary text-xs px-3 py-2 flex-shrink-0"
							on:click={copyCronUrl}
							title="Salin URL Cron"
						>
							📋 Salin
						</button>
					</div>
					<p class="text-[11px] text-slate-400 mt-1">Gunakan URL ini di penyedia cron job gratis (seperti Cron-Job.org atau Vercel Cron).</p>
				</div>

				<div>
					<label class="field-label" for="cron-key">Cron Secret Key</label>
					<input
						id="cron-key"
						type="text"
						class="field-input font-mono text-xs"
						bind:value={cronSecretInput}
						placeholder="invoicely_cron_secret"
					/>
					<p class="text-[11px] text-slate-400 mt-1">Cocokkan dengan nilai <code>CRON_SECRET</code> di file <code>.env</code>.</p>
				</div>
			</div>

			<!-- Hasil Tes Cron (Jika Ada) -->
			{#if cronTestResult}
				<div class="rounded-xl border p-4 text-xs transition {cronTestResult.status === 'success' ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/40 text-slate-800 dark:text-slate-200' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40 text-rose-800 dark:text-rose-200'}">
					<div class="flex items-center justify-between pb-2 border-b border-indigo-200/50 dark:border-indigo-800/50">
						<span class="font-bold">
							{cronTestResult.status === 'success' ? '📊 Hasil Eksekusi Pengingat:' : '⚠️ Terjadi Kesalahan:'}
						</span>
						<button type="button" class="text-slate-400 hover:text-slate-600" on:click={() => (cronTestResult = null)}>✕</button>
					</div>

					{#if cronTestResult.status === 'success'}
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
							<div class="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg text-center">
								<div class="text-[10px] text-slate-500">Total Unpaid</div>
								<div class="text-base font-extrabold text-slate-900 dark:text-white">{cronTestResult.summary?.total_unpaid_invoices || 0}</div>
							</div>
							<div class="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg text-center">
								<div class="text-[10px] text-slate-500">Mendekati Tempo</div>
								<div class="text-base font-extrabold text-indigo-600">{cronTestResult.summary?.eligible_for_reminder || 0}</div>
							</div>
							<div class="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg text-center">
								<div class="text-[10px] text-slate-500">Email Terkirim</div>
								<div class="text-base font-extrabold text-emerald-600">{cronTestResult.summary?.reminders_sent || 0}</div>
							</div>
							<div class="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg text-center">
								<div class="text-[10px] text-slate-500">Gagal / Belum SMTP</div>
								<div class="text-base font-extrabold text-rose-600">{cronTestResult.summary?.reminders_failed || 0}</div>
							</div>
						</div>

						{#if cronTestResult.results?.some((r) => r.unconfigured)}
							<div class="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-200 text-[11px] leading-relaxed">
								💡 <strong>Catatan:</strong> Layanan pengiriman email (SMTP) belum diisi di file <code>.env</code>. Silakan isi <code>SMTP_USER</code> dan <code>SMTP_PASS</code> agar email dapat terkirim secara nyata ke inbox klien.
							</div>
						{/if}

						{#if cronTestResult.results && cronTestResult.results.length > 0}
							<div class="mt-3 space-y-1">
								<div class="font-semibold text-[11px] text-slate-600 dark:text-slate-400">Rincian Invoice:</div>
								{#each cronTestResult.results as r}
									<div class="flex items-center justify-between py-1 px-2 rounded bg-white/50 dark:bg-slate-900/40 text-[11px]">
										<span><strong>{r.invoice_number}</strong> ({r.to_email})</span>
										<span class="font-semibold {r.status === 'sent' ? 'text-emerald-600' : 'text-rose-600'}">
											{r.status === 'sent' ? '✓ Terkirim' : `✗ ${r.error || 'Gagal'}`}
										</span>
									</div>
								{/each}
							</div>
						{/if}
					{:else}
						<p class="pt-2">{cronTestResult.message}</p>
					{/if}
				</div>
			{/if}

			<!-- Panduan Setup Singkat -->
			<div class="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 text-xs space-y-2 border border-slate-200/60 dark:border-slate-800">
				<h4 class="font-bold text-slate-800 dark:text-slate-200">🚀 Panduan Setup Cron Otomatis Gratis (Cron-Job.org):</h4>
				<ol class="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
					<li>Buka dan daftar akun gratis di <a href="https://cron-job.org" target="_blank" rel="noreferrer" class="text-primary font-bold underline">cron-job.org</a>.</li>
					<li>Klik <strong>"Create Cronjob"</strong>, lalu paste <em>URL Endpoint Cron Webhook</em> di atas.</li>
					<li>Pilih jadwal eksekusi (misalnya: <strong>Setiap hari pukul 08:00 pagi</strong> / <code>0 8 * * *</code>).</li>
					<li>Klik <strong>Save</strong>. Sistem akan otomatis berjalan di cloud setiap hari tanpa perlu membuka browser!</li>
				</ol>
			</div>
		</div>



		<!-- Backup & Pulihkan Data -->
		<div class="card p-6 shadow-soft space-y-3">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="font-bold text-slate-900 dark:text-white text-base">Cadangkan & Pulihkan Data (Backup & Restore)</h3>
					<p class="text-xs text-slate-500 dark:text-slate-400">Amankan seluruh invoice, pelanggan, produk, dan profil bisnis Anda ke dalam file cadangan JSON.</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-3 pt-2">
				<button type="button" class="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5" on:click={backupAllData}>
					<span>📥 Unduh Cadangan Data (JSON)</span>
				</button>

				<label class="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 cursor-pointer">
					<span>📤 Pulihkan dari File JSON</span>
					<input type="file" accept=".json,application/json" class="hidden" on:change={handleRestoreData} />
				</label>
			</div>
		</div>

		<!-- Action Save Button -->
		<div class="flex justify-end gap-3 pt-2">
			<button type="button" class="btn-primary px-8 py-3 text-sm shadow-md shadow-primary/30" on:click={saveSettings}>
				Simpan Perubahan
			</button>
		</div>
	</div>

	<!-- Floating Toast Notification -->
	{#if toastVisible}
		<div class="fixed bottom-6 right-6 z-50 toast-enter">
			<div class="flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-slate-900 border border-slate-700 dark:border-slate-200">
				<span>{toastMessage}</span>
			</div>
		</div>
	{/if}
</AppShell>
