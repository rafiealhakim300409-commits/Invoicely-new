import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';

export async function GET({ params }) {
	try {
		await initDb();
		const { id } = params;
		const result = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1;', [id]);
		if (result.rows.length === 0) {
			return json({ status: 'error', message: 'Product not found' }, { status: 404 });
		}
		return json({ status: 'success', data: result.rows[0] });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function PUT({ params, request }) {
	try {
		await initDb();
		const { id } = params;
		const body = await request.json();

		const result = await pool.query(
			`UPDATE products SET
				name = COALESCE($1, name),
				category = COALESCE($2, category),
				price = COALESCE($3, price),
				unit = COALESCE($4, unit)
			 WHERE id = $5
			 RETURNING *;`,
			[body.name, body.category, body.price !== undefined ? Number(body.price) : undefined, body.unit, id]
		);

		if (result.rows.length === 0) {
			return json({ status: 'error', message: 'Product not found' }, { status: 404 });
		}
		return json({ status: 'success', data: result.rows[0] });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		await initDb();
		const { id } = params;
		await pool.query('DELETE FROM products WHERE id = $1;', [id]);
		return json({ status: 'success', message: 'Product deleted successfully' });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
