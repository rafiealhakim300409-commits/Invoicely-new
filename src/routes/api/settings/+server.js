import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';

export async function GET() {
	try {
		await initDb();
		const result = await pool.query('SELECT * FROM business_settings WHERE id = $1 LIMIT 1;', ['default']);
		if (result.rows.length === 0) {
			return json({ status: 'success', data: null });
		}
		const row = result.rows[0];
		return json({
			status: 'success',
			data: {
				business: {
					name: row.name || '',
					email: row.email || '',
					phone: row.phone || '',
					address: row.address || '',
					bankInfo: row.bank_info || '',
					logo: row.logo || null
				},
				preferences: {
					currency: row.currency || 'IDR',
					defaultTax: Number(row.default_tax) || 0,
					defaultTemplate: row.default_template || 'modern-minimal'
				},
				updatedAt: row.updated_at
			}
		});
	} catch (err) {
		console.error('Error fetching settings from PostgreSQL:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		await initDb();
		const body = await request.json();
		const business = body.business || {};
		const preferences = body.preferences || {};

		const query = `
			INSERT INTO business_settings (
				id, name, email, phone, address, bank_info, logo, currency, default_tax, default_template, updated_at
			) VALUES (
				'default', $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
			)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				email = EXCLUDED.email,
				phone = EXCLUDED.phone,
				address = EXCLUDED.address,
				bank_info = EXCLUDED.bank_info,
				logo = EXCLUDED.logo,
				currency = EXCLUDED.currency,
				default_tax = EXCLUDED.default_tax,
				default_template = EXCLUDED.default_template,
				updated_at = CURRENT_TIMESTAMP
			RETURNING *;
		`;

		const values = [
			business.name || '',
			business.email || '',
			business.phone || '',
			business.address || '',
			business.bankInfo || '',
			business.logo || null,
			preferences.currency || 'IDR',
			Number(preferences.defaultTax) || 0,
			preferences.defaultTemplate || 'modern-minimal'
		];

		const result = await pool.query(query, values);
		const row = result.rows[0];
		return json({
			status: 'success',
			data: {
				business: {
					name: row.name,
					email: row.email,
					phone: row.phone,
					address: row.address,
					bankInfo: row.bank_info,
					logo: row.logo
				},
				preferences: {
					currency: row.currency,
					defaultTax: Number(row.default_tax),
					defaultTemplate: row.default_template
				},
				updatedAt: row.updated_at
			}
		});
	} catch (err) {
		console.error('Error saving settings to PostgreSQL:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}

export const PUT = POST;
