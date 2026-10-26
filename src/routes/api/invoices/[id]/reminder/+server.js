import { json } from '@sveltejs/kit';
import { pool, initDb } from '$lib/server/db.js';
import { sendDueDateReminderEmail } from '$lib/server/email.js';

export async function POST({ params }) {
	try {
		await initDb();
		const { id } = params;

		// 1. Fetch invoice
		const invRes = await pool.query(
			'SELECT * FROM invoices WHERE id = $1 OR invoice_number = $1 LIMIT 1;',
			[id]
		);

		if (invRes.rows.length === 0) {
			return json({ status: 'error', message: 'Invoice tidak ditemukan.' }, { status: 404 });
		}

		const invoice = invRes.rows[0];

		if (!invoice.to_email || !invoice.to_email.includes('@')) {
			return json({
				status: 'error',
				message: 'Invoice ini tidak memiliki alamat email klien (to_email) yang valid.'
			}, { status: 400 });
		}

		// 2. Fetch business settings
		const settingsRes = await pool.query('SELECT * FROM business_settings WHERE id = $1 LIMIT 1;', ['default']);
		const business = settingsRes.rows[0] || {};

		// 3. Calculate days remaining
		const now = new Date();
		const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		let diffDays = 0;
		if (invoice.due_date) {
			const dueDateParts = String(invoice.due_date).split('-');
			if (dueDateParts.length === 3) {
				const dueYear = parseInt(dueDateParts[0], 10);
				const dueMonth = parseInt(dueDateParts[1], 10) - 1;
				const dueDay = parseInt(dueDateParts[2], 10);
				const dueDateObj = new Date(dueYear, dueMonth, dueDay);
				diffDays = Math.round((dueDateObj.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
			}
		}

		// 4. Send email
		const sendResult = await sendDueDateReminderEmail({
			invoice,
			business,
			daysRemaining: diffDays
		});

		if (!sendResult.success) {
			return json({
				status: 'error',
				message: sendResult.error || 'Gagal mengirim email pengingat.',
				unconfigured: sendResult.unconfigured || false
			}, { status: sendResult.unconfigured ? 400 : 500 });
		}

		// 5. Update last_reminder_sent_at in database
		await pool.query(
			'UPDATE invoices SET last_reminder_sent_at = CURRENT_TIMESTAMP WHERE id = $1;',
			[invoice.id]
		);

		return json({
			status: 'success',
			message: `Email pengingat berhasil dikirim ke ${invoice.to_email}!`,
			recipient: invoice.to_email,
			messageId: sendResult.messageId
		});
	} catch (err) {
		console.error('Error sending single reminder:', err);
		return json({ status: 'error', message: err.message }, { status: 500 });
	}
}
