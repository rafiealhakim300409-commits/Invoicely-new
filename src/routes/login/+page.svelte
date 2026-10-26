<script>
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.js';

	let email = '';
	let password = '';
	let showPassword = false;
	let remember = true;
	let errorMessage = '';

	function handleLogin() {
		if (!email.trim() || !password.trim()) {
			errorMessage = 'Mohon masukkan email dan kata sandi Anda.';
			return;
		}

		auth.login(email.trim(), password);
		goto('/dashboard');
	}

	function handleDemoLogin() {
		auth.loginDemo();
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Masuk — Invoicely</title>
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
			Selamat Datang Kembali
		</h2>
		<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
			Masuk ke akun Anda untuk mengelola tagihan & klien bisnis
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

			<!-- Demo Login Banner -->
			<div class="mb-6 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/10 p-4 border border-primary/20 dark:border-primary-500/30 text-center">
				<p class="text-xs font-bold text-primary dark:text-primary-300 mb-2">Ingin mencoba langsung tanpa mengetik?</p>
				<button
					type="button"
					on:click={handleDemoLogin}
					class="btn-primary w-full justify-center text-xs py-2.5 shadow-md shadow-primary/25"
				>
					⚡ Masuk Cepat (Akun Demo Budi Santoso)
				</button>
			</div>

			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-slate-200 dark:border-slate-800"></div>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-white dark:bg-surfaceDark px-3 text-slate-400 font-bold">atau masuk email</span>
				</div>
			</div>

			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				<div>
					<label for="email" class="field-label">Alamat Email *</label>
					<div class="relative mt-1">
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="nama@bisnisanda.com"
							class="field-input pl-10"
							required
						/>
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
							📧
						</span>
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="password" class="field-label">Kata Sandi *</label>
						<a href="#forgot" on:click|preventDefault={() => alert('Fitur pemulihan kata sandi dapat menggunakan login demo.')} class="text-xs font-semibold text-primary hover:underline">
							Lupa Kata Sandi?
						</a>
					</div>
					<div class="relative mt-1">
					{#if showPassword}
						<input
							id="password"
							type="text"
							bind:value={password}
							placeholder="••••••••"
							class="field-input pl-10 pr-10"
							required
						/>
					{:else}
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="••••••••"
							class="field-input pl-10 pr-10"
							required
						/>
					{/if}
						<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
							🔒
						</span>
						<button
							type="button"
							on:click={() => (showPassword = !showPassword)}
							class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
						>
							{showPassword ? 'Sembunyi' : 'Lihat'}
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={remember} class="rounded border-slate-300 text-primary focus:ring-primary" />
						<span class="text-xs text-slate-600 dark:text-slate-400 font-medium">Ingat Saya</span>
					</label>
				</div>

				<button
					type="submit"
					class="btn-primary w-full justify-center text-sm py-3 mt-2 shadow-lg shadow-primary/30"
				>
					Masuk ke Dashboard &rarr;
				</button>
			</form>

			<div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
				Belum memiliki akun?
				<a href="/register" class="font-bold text-primary hover:underline ml-1">
					Daftar Akun Baru
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
