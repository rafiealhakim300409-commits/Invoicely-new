<script>
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.js';

	let name = '';
	let businessName = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let agreeTerms = true;
	let errorMessage = '';

	function handleRegister() {
		if (!name.trim() || !email.trim() || !password.trim()) {
			errorMessage = 'Mohon lengkapi seluruh kolom wajib.';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Kata sandi dan konfirmasi kata sandi tidak cocok.';
			return;
		}

		if (!agreeTerms) {
			errorMessage = 'Anda harus menyetujui Syarat & Ketentuan Penggunaan.';
			return;
		}

		auth.register({
			name: name.trim(),
			businessName: businessName.trim() || `${name.trim()} Studio`,
			email: email.trim()
		});

		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Daftar Akun — Invoicely</title>
</svelte:head>

<div class="min-h-screen bg-bg dark:bg-bgDark flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-primary selection:text-white">
	<!-- Background glow effect -->
	<div class="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-transparent blur-3xl dark:from-primary/10"></div>

	<!-- Logo & Header -->
	<div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
		<a href="/" class="inline-flex items-center gap-2.5 group">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 font-bold text-white text-xl shadow-lg shadow-primary/30 transition group-hover:scale-105">
				IN
			</div>
			<div class="flex flex-col text-left">
				<span class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Invoicely</span>
				<span class="text-xs text-slate-400 font-medium">Invoice Generator</span>
			</div>
		</a>

		<h2 class="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
			Buat Akun Bisnis Gratis
		</h2>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			Mulai kelola invoice, template, dan pelanggan profesional
		</p>
	</div>

	<!-- Card Container -->
	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
		<div class="glass-card p-6 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-slate-800">
			{#if errorMessage}
				<div class="mb-5 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between">
					<span>⚠️ {errorMessage}</span>
					<button type="button" on:click={() => (errorMessage = '')} class="text-rose-400 hover:text-rose-600">✕</button>
				</div>
			{/if}

			<form on:submit|preventDefault={handleRegister} class="space-y-4">
				<div>
					<label for="reg-name" class="field-label">Nama Lengkap *</label>
					<input
						id="reg-name"
						type="text"
						bind:value={name}
						placeholder="cth. Ahmad Prasetyo"
						class="field-input mt-1"
						required
					/>
				</div>

				<div>
					<label for="reg-biz" class="field-label">Nama Perusahaan / Studio / Usaha</label>
					<input
						id="reg-biz"
						type="text"
						bind:value={businessName}
						placeholder="cth. PT Digital Studio Nusantara"
						class="field-input mt-1"
					/>
				</div>

				<div>
					<label for="reg-email" class="field-label">Alamat Email *</label>
					<input
						id="reg-email"
						type="email"
						bind:value={email}
						placeholder="ahmad@perusahaan.com"
						class="field-input mt-1"
						required
					/>
				</div>

				<div>
					<label for="reg-pass" class="field-label">Kata Sandi *</label>
					<input
						id="reg-pass"
						type="password"
						bind:value={password}
						placeholder="Minimal 6 karakter"
						class="field-input mt-1"
						required
					/>
				</div>

				<div>
					<label for="reg-confirm-pass" class="field-label">Konfirmasi Kata Sandi *</label>
					<input
						id="reg-confirm-pass"
						type="password"
						bind:value={confirmPassword}
						placeholder="Ulangi kata sandi"
						class="field-input mt-1"
						required
					/>
				</div>

				<div class="flex items-start gap-2 pt-1">
					<input
						id="agree"
						type="checkbox"
						bind:checked={agreeTerms}
						class="rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
					/>
					<label for="agree" class="text-xs text-slate-600 dark:text-slate-400 font-medium">
						Saya menyetujui <span class="text-primary font-semibold">Syarat & Ketentuan</span> serta Kebijakan Privasi Invoicely.
					</label>
				</div>

				<button
					type="submit"
					class="btn-primary w-full justify-center text-sm py-3 mt-2 shadow-lg shadow-primary/30"
				>
					Daftarkan Akun Saya &rarr;
				</button>
			</form>

			<div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
				Sudah memiliki akun?
				<a href="/login" class="font-bold text-primary hover:underline ml-1">
					Masuk Sekarang
				</a>
			</div>
		</div>

		<!-- Back link -->
		<div class="mt-6 text-center">
			<a href="/" class="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1">
				&larr; Kembali ke Beranda
			</a>
		</div>
	</div>
</div>
