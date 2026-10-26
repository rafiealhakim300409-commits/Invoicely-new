import { json } from '@sveltejs/kit';
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
			return json({ status: 'error', message: 'Invoice not found' }, { status: 404 });
		}

		return json({ status: 'success', data: result.rows[0] });
	} catch (err) {
		console.error('Error fetching invoice by id:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function PUT({ params, request }) {
	try {
		await initDb();
		const { id } = params;
		const body = await request.json();

		const templateId = body.template_id || 'modern-minimal';
		const status = body.status || 'Draft';
		const issueDate = body.issue_date || new Date().toISOString().split('T')[0];
		const dueDate = body.due_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		const fromName = body.from_name || '';
		const fromAddress = body.from_address || '';
		const fromEmail = body.from_email || '';
		const fromPhone = body.from_phone || '';
		const toName = body.to_name || '';
		const toAddress = body.to_address || '';
		const toEmail = body.to_email || '';
		const toPhone = body.to_phone || '';
		const discountPercent = Number(body.discount_percent) || 0;
		const taxPercent = Number(body.tax_percent) || 0;
		const currency = body.currency || 'Rp';
		const notes = body.notes || '';
		const items = JSON.stringify(body.items || []);

		const query = `
			UPDATE invoices SET
				template_id = $1,
				status = $2,
				issue_date = $3,
				due_date = $4,
				from_name = $5,
				from_address = $6,
				from_email = $7,
				from_phone = $8,
				to_name = $9,
				to_address = $10,
				to_email = $11,
				to_phone = $12,
				discount_percent = $13,
				tax_percent = $14,
				currency = $15,
				notes = $16,
				items = $17,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $18 OR invoice_number = $18
			RETURNING *;
		`;

		const values = [
			templateId, status, issueDate, dueDate,
			fromName, fromAddress, fromEmail, fromPhone,
			toName, toAddress, toEmail, toPhone,
			discountPercent, taxPercent, currency, notes, items,
			id
		];

		const result = await pool.query(query, values);

		if (result.rows.length === 0) {
			return json({ status: 'error', message: 'Invoice not found to update' }, { status: 404 });
		}

		return json({ status: 'success', data: result.rows[0] });
	} catch (err) {
		console.error('Error updating invoice:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		await initDb();
		const { id } = params;
		await pool.query('DELETE FROM invoices WHERE id = $1 OR invoice_number = $1;', [id]);
		return json({ status: 'success', message: 'Invoice deleted successfully' });
	} catch (err) {
		console.error('Error deleting invoice:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
