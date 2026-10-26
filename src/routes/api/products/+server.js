import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';

export async function GET() {
	try {
		await initDb();
		const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC;');
		return json({ status: 'success', data: result.rows });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		await initDb();
		const body = await request.json();
		const id = body.id || `prod-${Date.now()}`;
		const result = await pool.query(
			`INSERT INTO products (id, name, category, price, unit)
			 VALUES ($1, $2, $3, $4, $5)
			 ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				category = EXCLUDED.category,
				price = EXCLUDED.price,
				unit = EXCLUDED.unit
			 RETURNING *;`,
			[id, body.name || 'Produk Baru', body.category || 'Umum', body.price || 0, body.unit || 'Unit']
		);
		return json({ status: 'success', data: result.rows[0] });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
