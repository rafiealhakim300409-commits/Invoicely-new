import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';

export async function GET() {
	try {
		await initDb();
		const result = await pool.query(
			'SELECT * FROM invoices ORDER BY created_at DESC;'
		);
		return json({
			status: 'success',
			data: result.rows
		});
	} catch (err) {
		console.error('Error fetching invoices from Railway PostgreSQL:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		await initDb();
		const body = await request.json();

		const id = body.id || `inv-${Date.now()}`;
		const invoiceNumber = body.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
			INSERT INTO invoices (
				id, invoice_number, template_id, status, issue_date, due_date,
				from_name, from_address, from_email, from_phone,
				to_name, to_address, to_email, to_phone,
				discount_percent, tax_percent, currency, notes, items, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6,
				$7, $8, $9, $10,
				$11, $12, $13, $14,
				$15, $16, $17, $18, $19, CURRENT_TIMESTAMP
			)
			ON CONFLICT (invoice_number) DO UPDATE SET
				template_id = EXCLUDED.template_id,
				status = EXCLUDED.status,
				issue_date = EXCLUDED.issue_date,
				due_date = EXCLUDED.due_date,
				from_name = EXCLUDED.from_name,
				from_address = EXCLUDED.from_address,
				from_email = EXCLUDED.from_email,
				from_phone = EXCLUDED.from_phone,
				to_name = EXCLUDED.to_name,
				to_address = EXCLUDED.to_address,
				to_email = EXCLUDED.to_email,
				to_phone = EXCLUDED.to_phone,
				discount_percent = EXCLUDED.discount_percent,
				tax_percent = EXCLUDED.tax_percent,
				currency = EXCLUDED.currency,
				notes = EXCLUDED.notes,
				items = EXCLUDED.items,
				updated_at = CURRENT_TIMESTAMP
			RETURNING *;
		`;

		const values = [
			id, invoiceNumber, templateId, status, issueDate, dueDate,
			fromName, fromAddress, fromEmail, fromPhone,
			toName, toAddress, toEmail, toPhone,
			discountPercent, taxPercent, currency, notes, items
		];

		const result = await pool.query(query, values);
		return json({
			status: 'success',
			data: result.rows[0]
		}, { status: 201 });
	} catch (err) {
		console.error('Error creating invoice in Railway PostgreSQL:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
