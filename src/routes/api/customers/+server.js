import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';

export async function GET() {
	try {
		await initDb();
		const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC;');
		return json({ status: 'success', data: result.rows });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		await initDb();
		const body = await request.json();
		const id = body.id || `cust-${Date.now()}`;
		const result = await pool.query(
			`INSERT INTO customers (id, name, email, phone, address, outstanding, total_invoices)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				email = EXCLUDED.email,
				phone = EXCLUDED.phone,
				address = EXCLUDED.address,
				outstanding = EXCLUDED.outstanding,
				total_invoices = EXCLUDED.total_invoices
			 RETURNING *;`,
			[
				id,
				body.name || 'Pelanggan Baru',
				body.email || '',
				body.phone || '',
				body.address || '',
				body.outstanding !== undefined ? Number(body.outstanding) : 0,
				body.total_invoices !== undefined ? Number(body.total_invoices) : (Number(body.totalInvoices) || 0)
			]
		);
		return json({ status: 'success', data: result.rows[0] });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
