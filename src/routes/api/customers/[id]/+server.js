import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';

export async function GET({ params }) {
	try {
		await initDb();
		const { id } = params;
		const result = await pool.query('SELECT * FROM customers WHERE id = $1 LIMIT 1;', [id]);
		if (result.rows.length === 0) {
			return json({ status: 'error', message: 'Customer not found' }, { status: 404 });
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

		const totalInvoices = body.total_invoices !== undefined ? Number(body.total_invoices) : (body.totalInvoices !== undefined ? Number(body.totalInvoices) : undefined);
		const outstanding = body.outstanding !== undefined ? Number(body.outstanding) : undefined;

		const result = await pool.query(
			`UPDATE customers SET
				name = COALESCE($1, name),
				email = COALESCE($2, email),
				phone = COALESCE($3, phone),
				address = COALESCE($4, address),
				outstanding = COALESCE($5, outstanding),
				total_invoices = COALESCE($6, total_invoices)
			 WHERE id = $7
			 RETURNING *;`,
			[body.name, body.email, body.phone, body.address, outstanding, totalInvoices, id]
		);

		if (result.rows.length === 0) {
			return json({ status: 'error', message: 'Customer not found' }, { status: 404 });
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
		await pool.query('DELETE FROM customers WHERE id = $1;', [id]);
		return json({ status: 'success', message: 'Customer deleted successfully' });
	} catch (err) {
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
