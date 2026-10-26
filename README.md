# Invoicely

Aplikasi pembuat invoice frontend-only — SvelteKit + Vite + Tailwind CSS.

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Struktur penting

- `src/app.css` — design tokens & class reusable (`.btn-primary`, `.card`, `.field-input`, dst)
- `src/lib/utils/invoiceCalc.js` — semua kalkulasi subtotal/diskon/pajak/total (satu sumber kebenaran)
- `src/lib/utils/invoiceTemplates.js` — registry 10 template invoice
- `src/lib/components/AppShell.svelte` — layout sidebar + topbar untuk semua halaman internal
- `src/lib/stores/theme.js` — dark mode via Tailwind `class` strategy + localStorage
- `src/routes/invoices/create/` — editor + preview live, export PDF (SSR dimatikan khusus halaman ini karena `html2pdf.js` browser-only)

## Catatan teknis

- `html2pdf.js` di-import secara dinamis di dalam `exportPDF()`, dan `+page.js` di folder `invoices/create` menonaktifkan SSR (`export const ssr = false`) — kombinasi ini yang memperbaiki 500 error sebelumnya.
- `vite.config.js` mengimpor `sveltekit` dari `@sveltejs/kit/vite` (bukan `@sveltejs/vite-plugin-svelte`).

## Belum diverifikasi

Karena dibuat di sandbox tanpa akses `npm install`/`npm run dev`, build ini belum dites jalan end-to-end. Setelah `npm install` di lokal, kalau ada error compile, screenshot terminal-nya dan kirim ke saya.
