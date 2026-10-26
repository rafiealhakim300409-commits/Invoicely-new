import { pool, initDb } from '$lib/server/db.js';

export async function GET({ params }) {
	try {
		await initDb();
		const { id } = params;
		const result = await pool.query(
			'SELECT * FROM invoices WHERE id = $1 OR invoice_number = $1 LIMIT 1;',
			[id]
		);

		if (result.rows.length === 0) {
			return new Response('Invoice not found', { status: 404 });
		}

		const inv = result.rows[0];
		const items = Array.isArray(inv.items) ? inv.items : JSON.parse(inv.items || '[]');
		const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.price) || 0), 0);
		const discount = subtotal * ((Number(inv.discount_percent) || 0) / 100);
		const tax = (subtotal - discount) * ((Number(inv.tax_percent) || 0) / 100);
		const total = Math.round(subtotal - discount + tax);

		const html = `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<title>Invoice #${inv.invoice_number}</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
		.header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
		.brand { font-size: 24px; font-weight: bold; color: #0284c7; }
		.inv-num { font-size: 20px; font-weight: bold; text-align: right; }
		.details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
		.label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px; }
		table { width: 100%; border-collapse: collapse; margin-top: 20px; }
		th { text-align: left; padding: 12px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #475569; }
		td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
		.text-right { text-align: right; }
		.totals { margin-top: 20px; width: 300px; margin-left: auto; }
		.totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
		.totals-row.grand { font-size: 18px; font-weight: bold; border-top: 2px solid #0284c7; padding-top: 10px; margin-top: 6px; }
		.notes { margin-top: 40px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569; }
		@media print {
			body { padding: 0; }
			.no-print { display: none; }
		}
	</style>
</head>
<body>
	<div class="no-print" style="margin-bottom: 20px; text-align: right;">
		<button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🖨️ Cetak / Simpan PDF</button>
	</div>

	<div class="header">
		<div>
			<div class="brand">${inv.from_name || 'Bisnis Anda'}</div>
			<div style="font-size: 13px; color: #64748b; margin-top: 4px;">${inv.from_address || ''}</div>
			<div style="font-size: 13px; color: #64748b;">${inv.from_email || ''} ${inv.from_phone ? '• ' + inv.from_phone : ''}</div>
		</div>
		<div class="inv-num">
			<div>INVOICE</div>
			<div style="color: #0284c7; font-size: 16px;">#${inv.invoice_number}</div>
			<div style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 6px;">Status: <strong>${inv.status}</strong></div>
		</div>
	</div>

	<div class="details">
		<div>
			<div class="label">Tagihan Kepada:</div>
			<div style="font-weight: bold; font-size: 15px;">${inv.to_name || 'Klien'}</div>
			<div style="font-size: 13px; color: #64748b;">${inv.to_address || ''}</div>
			<div style="font-size: 13px; color: #64748b;">${inv.to_email || ''} ${inv.to_phone ? '• ' + inv.to_phone : ''}</div>
		</div>
		<div style="text-align: right;">
			<div class="label">Tanggal Faktur:</div>
			<div style="font-size: 14px; margin-bottom: 8px;">${inv.issue_date || '-'}</div>
			<div class="label">Jatuh Tempo:</div>
			<div style="font-size: 14px; color: #e11d48; font-weight: bold;">${inv.due_date || '-'}</div>
		</div>
	</div>

	<table>
		<thead>
			<tr>
				<th>Deskripsi</th>
				<th class="text-right">Qty</th>
				<th class="text-right">Harga</th>
				<th class="text-right">Total</th>
			</tr>
		</thead>
		<tbody>
			${items.map(it => `
				<tr>
					<td>${it.description || '-'}</td>
					<td class="text-right">${it.qty || 1}</td>
					<td class="text-right">${inv.currency || 'Rp'} ${(Number(it.price) || 0).toLocaleString('id-ID')}</td>
					<td class="text-right">${inv.currency || 'Rp'} ${((Number(it.qty) || 1) * (Number(it.price) || 0)).toLocaleString('id-ID')}</td>
				</tr>
			`).join('')}
		</tbody>
	</table>

	<div class="totals">
		<div class="totals-row">
			<span>Subtotal:</span>
			<span>${inv.currency || 'Rp'} ${subtotal.toLocaleString('id-ID')}</span>
		</div>
		${discount > 0 ? `
		<div class="totals-row" style="color: #10b981;">
			<span>Diskon (${inv.discount_percent}%):</span>
			<span>-${inv.currency || 'Rp'} ${discount.toLocaleString('id-ID')}</span>
		</div>` : ''}
		${tax > 0 ? `
		<div class="totals-row">
			<span>Pajak / PPN (${inv.tax_percent}%):</span>
			<span>+${inv.currency || 'Rp'} ${tax.toLocaleString('id-ID')}</span>
		</div>` : ''}
		<div class="totals-row grand">
			<span>Total Akhir:</span>
			<span>${inv.currency || 'Rp'} ${total.toLocaleString('id-ID')}</span>
		</div>
	</div>

	${inv.notes ? `
	<div class="notes">
		<div class="label">Catatan & Ketentuan:</div>
		<div>${inv.notes}</div>
	</div>` : ''}

	<script>
		// Auto print prompt if opened directly
		if (window.location.search.includes('print=1')) {
			window.onload = () => window.print();
		}
	</script>
</body>
</html>`;

		return new Response(html, {
			headers: { 'Content-Type': 'text/html; charset=utf-8' }
		});
	} catch (err) {
		return new Response(`Error: ${err.message}`, { status: 500 });
	}
}
