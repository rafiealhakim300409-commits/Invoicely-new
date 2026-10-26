import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { calcInvoiceTotals, formatCurrency } from '$lib/utils/invoiceCalc.js';

/**
 * Returns a configured Nodemailer transporter or null if credentials are not set.
 */
export function getEmailTransporter() {
	const host = env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
	const port = parseInt(env.SMTP_PORT || process.env.SMTP_PORT || '465', 10);
	const secure = env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'true' || port === 465;
	const user = env.SMTP_USER || process.env.SMTP_USER;
	const pass = env.SMTP_PASS || process.env.SMTP_PASS;

	if (!user || !pass) {
		return null;
	}

	return nodemailer.createTransport({
		host,
		port,
		secure,
		auth: {
			user,
			pass
		}
	});
}

/**
 * Generates an aesthetic, responsive HTML email template for due date reminders.
 */
export function generateDueDateReminderHtml({ invoice, business, daysRemaining, totals }) {
	const bizName = business?.name || invoice.from_name || 'Invoicely';
	const bizEmail = business?.email || invoice.from_email || '';
	const bizPhone = business?.phone || invoice.from_phone || '';
	const clientName = invoice.to_name || 'Pelanggan yang Terhormat';
	const invNumber = invoice.invoice_number || invoice.id;
	const dueDate = invoice.due_date || '-';
	const currency = invoice.currency || 'IDR';
	const totalFormatted = formatCurrency(totals.total, currency);

	// Status banner style & text based on days remaining
	let bannerTitle = 'Pengingat Pembayaran Faktur';
	let bannerBg = '#4f46e5'; // Indigo
	let badgeText = `Jatuh Tempo dalam ${daysRemaining} Hari`;
	let badgeBg = '#e0e7ff';
	let badgeColor = '#3730a3';

	if (daysRemaining < 0) {
		const overdueDays = Math.abs(daysRemaining);
		bannerTitle = 'Tagihan Telah Melewati Jatuh Tempo';
		bannerBg = '#dc2626'; // Red
		badgeText = `Terlambat ${overdueDays} Hari`;
		badgeBg = '#fee2e2';
		badgeColor = '#991b1b';
	} else if (daysRemaining === 0) {
		bannerTitle = 'Jatuh Tempo Hari Ini';
		bannerBg = '#ea580c'; // Orange
		badgeText = 'Hari Ini Adalah Batas Terakhir';
		badgeBg = '#ffedd5';
		badgeColor = '#9a3412';
	}

	const bankInfo = business?.bank_info || business?.bankInfo || 'Silakan hubungi kami untuk rekening tujuan pembayaran.';
	const notes = invoice.notes ? `<div style="margin-top: 15px; padding: 12px 16px; background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 4px; font-size: 13px; color: #475569;"><strong>Catatan Pembayaran:</strong><br/>${invoice.notes.replace(/\n/g, '<br/>')}</div>` : '';

	return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bannerTitle} - ${invNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);">
          
          <!-- Top Header -->
          <tr>
            <td style="background-color: ${bannerBg}; padding: 32px 30px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${bizName}</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Pengingat Tagihan Faktur Resmi</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px;">
                ${badgeText}
              </div>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Halo <strong>${clientName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Kami ingin menginformasikan bahwa tagihan faktur berikut memerlukan perhatian Anda:
              </p>

              <!-- Invoice Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px; border-bottom: 1px solid #e2e8f0; width: 45%; font-size: 13px; color: #64748b;">
                    Nomor Invoice
                  </td>
                  <td style="padding: 18px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">
                    ${invNumber}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
                    Tanggal Jatuh Tempo
                  </td>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: ${daysRemaining < 0 ? '#dc2626' : '#0f172a'}; text-align: right;">
                    ${dueDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px; font-size: 14px; font-weight: 700; color: #0f172a;">
                    Total Tagihan
                  </td>
                  <td style="padding: 18px 20px; font-size: 18px; font-weight: 800; color: #4f46e5; text-align: right;">
                    ${totalFormatted}
                  </td>
                </tr>
              </table>

              <!-- Payment Instructions -->
              <div style="background-color: #eef2ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #c7d2fe;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #3730a3; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  💳 Informasi Rekening Pembayaran
                </h4>
                <div style="font-size: 14px; line-height: 1.6; color: #1e1b4b; white-space: pre-line;">
                  ${bankInfo}
                </div>
              </div>

              ${notes}

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                *Apabila pembayaran telah Anda selesaikan sebelum email ini diterima, mohon abaikan pesan pengingat ini atau hubungi kami untuk konfirmasi. Terima kasih atas kerja sama Anda yang baik! 🙏
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">${bizName}</p>
              <p style="margin: 0;">${bizEmail ? 'Email: ' + bizEmail : ''} ${bizPhone ? '• Telp/WA: ' + bizPhone : ''}</p>
              <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 11px;">Dikirim secara otomatis melalui sistem Invoicely</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Sends a reminder email for an invoice.
 */
export async function sendDueDateReminderEmail({ invoice, business, daysRemaining }) {
	const transporter = getEmailTransporter();
	const toEmail = invoice.to_email;

	if (!toEmail || !toEmail.includes('@')) {
		return {
			success: false,
			error: `Invoice ${invoice.invoice_number || invoice.id} tidak memiliki alamat email klien yang valid.`
		};
	}

	if (!transporter) {
		return {
			success: false,
			unconfigured: true,
			error: 'Layanan email (SMTP) belum dikonfigurasi di file .env (Membutuhkan SMTP_USER dan SMTP_PASS).'
		};
	}

	const bizName = business?.name || invoice.from_name || 'Invoicely';
	const fromEmail = env.SMTP_FROM || process.env.SMTP_FROM || `"${bizName}" <${env.SMTP_USER || process.env.SMTP_USER}>`;

	// Calculate totals safely
	const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items || '[]') : (invoice.items || []);
	const totals = calcInvoiceTotals({
		items,
		discount: { type: 'percent', value: Number(invoice.discount_percent) || 0 },
		taxRate: Number(invoice.tax_percent) || 0
	});

	let subject = `[Pengingat Tagihan] Faktur ${invoice.invoice_number} Jatuh Tempo: ${invoice.due_date}`;
	if (daysRemaining < 0) {
		subject = `[PENTING] Tagihan Faktur ${invoice.invoice_number} Telah Melewati Jatuh Tempo`;
	} else if (daysRemaining === 0) {
		subject = `[HARI INI] Tagihan Faktur ${invoice.invoice_number} Jatuh Tempo Hari Ini`;
	}

	const html = generateDueDateReminderHtml({ invoice, business, daysRemaining, totals });

	try {
		const info = await transporter.sendMail({
			from: fromEmail,
			to: toEmail,
			subject,
			html
		});

		return {
			success: true,
			messageId: info.messageId,
			recipient: toEmail
		};
	} catch (err) {
		console.error('Error sending reminder email:', err);
		return {
			success: false,
			error: err.message
		};
	}
}
