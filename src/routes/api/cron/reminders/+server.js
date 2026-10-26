import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { pool, initDb } from '$lib/server/db.js';
import { sendDueDateReminderEmail } from '$lib/server/email.js';

async function handleRemindersCron(url, request) {
	try {
		await initDb();

		// Security check: Protect with CRON_SECRET if configured
		const configuredSecret = env.CRON_SECRET || process.env.CRON_SECRET;
		if (configuredSecret) {
			const authHeader = request.headers.get('authorization') || '';
			const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, '');
			const tokenFromQuery = url.searchParams.get('key');

			if (tokenFromHeader !== configuredSecret && tokenFromQuery !== configuredSecret) {
				return json(
					{
						status: 'error',
						message: 'Unauthorized: Kunci rahasia Cron (CRON_SECRET) tidak valid.'
					},
					{ status: 401 }
				);
			}
		}

		// 1. Fetch Business Settings
		const settingsRes = await pool.query('SELECT * FROM business_settings WHERE id = $1 LIMIT 1;', ['default']);
		const business = settingsRes.rows[0] || {};

		// 2. Fetch Unpaid Invoices with client email and due_date
		const invoicesRes = await pool.query(`
			SELECT * FROM invoices
			WHERE LOWER(status) NOT IN ('paid', 'lunas', 'cancelled', 'batal', 'draft')
			  AND to_email IS NOT NULL AND to_email != ''
			  AND due_date IS NOT NULL AND due_date != ''
			ORDER BY due_date ASC;
		`);

		const now = new Date();
		// Normalize today's date to midnight
		const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const eligible = [];
		const skipped = [];
		const results = [];

		for (const invoice of invoicesRes.rows) {
			const dueDateParts = String(invoice.due_date).split('-');
			if (dueDateParts.length !== 3) {
				skipped.push({ invoice_number: invoice.invoice_number, reason: 'Format due_date tidak valid' });
				continue;
			}

			const dueYear = parseInt(dueDateParts[0], 10);
			const dueMonth = parseInt(dueDateParts[1], 10) - 1;
			const dueDay = parseInt(dueDateParts[2], 10);
			const dueDateObj = new Date(dueYear, dueMonth, dueDay);

			const diffDays = Math.round((dueDateObj.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

			// Rule: Kirim jika jatuh tempo dalam 3 hari ke depan (H-3 s.d H-0) ATAU sudah lewat jatuh tempo (Overdue)
			if (diffDays > 3) {
				skipped.push({
					invoice_number: invoice.invoice_number,
					due_date: invoice.due_date,
					reason: `Jatuh tempo masih ${diffDays} hari lagi (> 3 hari)`
				});
				continue;
			}

			// Frequency guard: Jangan kirim berulang kali jika sudah dikirim dalam 20 jam terakhir
			if (invoice.last_reminder_sent_at) {
				const lastSent = new Date(invoice.last_reminder_sent_at);
				const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
				if (hoursSinceLastSent < 20) {
					skipped.push({
						invoice_number: invoice.invoice_number,
						due_date: invoice.due_date,
						reason: `Pengingat sudah dikirim hari ini (${Math.round(hoursSinceLastSent)} jam lalu)`
					});
					continue;
				}
			}

			eligible.push({ invoice, diffDays });
		}

		// 3. Process Sending Emails
		for (const item of eligible) {
			const { invoice, diffDays } = item;
			const sendResult = await sendDueDateReminderEmail({
				invoice,
				business,
				daysRemaining: diffDays
			});

			if (sendResult.success) {
				// Update last_reminder_sent_at in PostgreSQL
				await pool.query(
					'UPDATE invoices SET last_reminder_sent_at = CURRENT_TIMESTAMP WHERE id = $1;',
					[invoice.id]
				);

				results.push({
					invoice_number: invoice.invoice_number,
					to_email: invoice.to_email,
					client_name: invoice.to_name,
					due_date: invoice.due_date,
					days_remaining: diffDays,
					status: 'sent',
					message_id: sendResult.messageId
				});
			} else {
				results.push({
					invoice_number: invoice.invoice_number,
					to_email: invoice.to_email,
					due_date: invoice.due_date,
					days_remaining: diffDays,
					status: 'failed',
					error: sendResult.error,
					unconfigured: sendResult.unconfigured || false
				});
			}
		}

		const sentCount = results.filter((r) => r.status === 'sent').length;
		const failedCount = results.filter((r) => r.status === 'failed').length;

		return json({
			status: 'success',
			timestamp: now.toISOString(),
			summary: {
				total_unpaid_invoices: invoicesRes.rows.length,
				eligible_for_reminder: eligible.length,
				reminders_sent: sentCount,
				reminders_failed: failedCount,
				skipped_count: skipped.length
			},
			results,
			skipped
		});
	} catch (err) {
		console.error('Error running reminders cron:', err);
		return json(
			{
				status: 'error',
				message: err.message
			},
			{ status: 500 }
		);
	}
}

export async function GET({ url, request }) {
	return handleRemindersCron(url, request);
}

export async function POST({ url, request }) {
	return handleRemindersCron(url, request);
}
