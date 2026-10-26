import { browser } from '$app/environment';

export const DEFAULT_API_BASE_URL = '';

export const API_STATUS_LIST = ['Draft', 'Terkirim', 'Belum Dibayar', 'Lunas'];

export const API_TEMPLATES = [
	'modern-minimal',
	'corporate-blue',
	'creative-gradient',
	'dark-elegant',
	'bold-editorial',
	'classic-serif',
	'playful-pastel',
	'tech-mono',
	'luxury-gold'
];

/**
 * Get current configured API Base URL
 */
export function getApiBaseUrl() {
	if (browser) {
		const stored = localStorage.getItem('invoicely_api_url');
		// Clear deprecated dead demo URL if present
		if (stored && stored.includes('invoice-app-backend-production-997b')) {
			localStorage.removeItem('invoicely_api_url');
			return DEFAULT_API_BASE_URL;
		}
		if (stored && stored.trim()) {
			return stored.trim().replace(/\/+$/, '');
		}
	}
	return DEFAULT_API_BASE_URL;
}

/**
 * Update API Base URL in localStorage
 */
export function setApiBaseUrl(url) {
	if (browser) {
		if (!url || url.trim() === '' || url.trim() === DEFAULT_API_BASE_URL) {
			localStorage.removeItem('invoicely_api_url');
		} else {
			localStorage.setItem('invoicely_api_url', url.trim().replace(/\/+$/, ''));
		}
	}
}

/**
 * Maps any internal template id to one of the 9 official backend template slugs
 */
export function mapToApiTemplateId(id) {
	if (API_TEMPLATES.includes(id)) return id;
	const mapping = {
		modern: 'modern-minimal',
		minimal: 'modern-minimal',
		corporate: 'corporate-blue',
		creative: 'creative-gradient',
		elegant: 'dark-elegant',
		bold: 'bold-editorial',
		classic: 'classic-serif',
		simple: 'playful-pastel',
		professional: 'tech-mono',
		luxury: 'luxury-gold'
	};
	return mapping[id] || 'modern-minimal';
}

/**
 * Maps backend template slug to internal template ID
 */
export function mapFromApiTemplateId(apiId) {
	const reverseMapping = {
		'modern-minimal': 'modern',
		'corporate-blue': 'corporate',
		'creative-gradient': 'creative',
		'dark-elegant': 'elegant',
		'bold-editorial': 'bold',
		'classic-serif': 'classic',
		'playful-pastel': 'simple',
		'tech-mono': 'professional',
		'luxury-gold': 'luxury'
	};
	return reverseMapping[apiId] || apiId || 'modern';
}

/**
 * Maps internal/display status to official API contract status:
 * "Draft" | "Terkirim" | "Belum Dibayar" | "Lunas"
 */
export function mapToApiStatus(status) {
	if (!status) return 'Draft';
	const s = String(status).toLowerCase().trim();
	if (s === 'draft') return 'Draft';
	if (s === 'terkirim' || s === 'sent' || s === 'overdue') return 'Terkirim';
	if (s === 'belum dibayar' || s === 'unpaid' || s === 'pending') return 'Belum Dibayar';
	if (s === 'lunas' || s === 'paid') return 'Lunas';
	if (API_STATUS_LIST.includes(status)) return status;
	return 'Draft';
}

/**
 * Maps backend API status to internal frontend status
 */
export function mapFromApiStatus(apiStatus) {
	if (!apiStatus) return 'draft';
	const s = String(apiStatus).toLowerCase().trim();
	if (s === 'draft') return 'draft';
	if (s === 'terkirim' || s === 'sent') return 'overdue';
	if (s === 'belum dibayar' || s === 'unpaid') return 'unpaid';
	if (s === 'lunas' || s === 'paid') return 'paid';
	return 'draft';
}

/**
 * Converts frontend invoice model to exact Section 3 JSON API Contract
 */
export function toApiPayload(inv, templateId) {
	const rawTemplate = templateId || inv.template_id || inv.templateId || 'modern-minimal';
	const apiTemplate = mapToApiTemplateId(rawTemplate);
	const apiStatus = mapToApiStatus(inv.status);

	let discountPercent = 0;
	if (inv.discount_percent !== undefined) {
		discountPercent = Number(inv.discount_percent) || 0;
	} else if (typeof inv.discount === 'object' && inv.discount?.type === 'percent') {
		discountPercent = Number(inv.discount.value || 0);
	}

	let taxPercent = 0;
	if (inv.tax_percent !== undefined) {
		taxPercent = Number(inv.tax_percent) || 0;
	} else if (inv.taxRate !== undefined) {
		taxPercent = Number(inv.taxRate) || 0;
	}

	const rawItems = Array.isArray(inv.items) ? inv.items : [];
	const items = rawItems.map((item) => ({
		description: String(item.description || '').trim() || 'Item Deskripsi',
		qty: Number(item.qty) || 1,
		price: Number(item.price) || 0
	}));

	if (items.length === 0) {
		items.push({ description: 'Item 1', qty: 1, price: 0 });
	}

	let currency = inv.currency || 'Rp';
	if (currency === 'IDR') currency = 'Rp';

	return {
		invoice_number: String(inv.invoice_number || inv.number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`),
		template_id: apiTemplate,
		status: apiStatus,
		issue_date: String(inv.issue_date || inv.date || new Date().toISOString().split('T')[0]),
		due_date: String(inv.due_date || inv.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
		from_name: String(inv.from_name || inv.business?.name || 'Bisnis Anda'),
		from_address: String(inv.from_address || inv.business?.address || ''),
		from_email: String(inv.from_email || inv.business?.email || ''),
		from_phone: String(inv.from_phone || inv.business?.phone || ''),
		to_name: String(inv.to_name || (typeof inv.client === 'string' ? inv.client : inv.client?.name) || 'Klien'),
		to_address: String(inv.to_address || inv.client?.address || ''),
		to_email: String(inv.to_email || inv.client?.email || ''),
		to_phone: String(inv.to_phone || inv.client?.phone || ''),
		discount_percent: discountPercent,
		tax_percent: taxPercent,
		notes: String(inv.notes || ''),
		currency: currency,
		items: items
	};
}

/**
 * Converts backend API invoice response to frontend model
 */
export function fromApiPayload(apiData) {
	if (!apiData) return null;

	const num = apiData.invoice_number || `INV-${apiData.id || Date.now()}`;
	const rawItems = Array.isArray(apiData.items) ? apiData.items : [];
	const items = rawItems.map((it) => ({
		description: it.description || '',
		qty: Number(it.qty) || 1,
		price: Number(it.price) || 0
	}));

	// Calculate totals for UI display
	const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
	const discountAmount = subtotal * ((Number(apiData.discount_percent) || 0) / 100);
	const taxable = Math.max(0, subtotal - discountAmount);
	const taxAmount = taxable * ((Number(apiData.tax_percent) || 0) / 100);
	const totalAmount = Math.round(taxable + taxAmount);

	return {
		id: String(apiData.id || num),
		backendId: apiData.id || null,
		number: num,
		invoice_number: num,
		templateId: mapFromApiTemplateId(apiData.template_id),
		template_id: apiData.template_id,
		status: mapFromApiStatus(apiData.status),
		statusLabel: apiData.status,
		date: apiData.issue_date || new Date().toISOString().split('T')[0],
		issue_date: apiData.issue_date,
		dueDate: apiData.due_date || new Date().toISOString().split('T')[0],
		due_date: apiData.due_date,
		business: {
			name: apiData.from_name || '',
			address: apiData.from_address || '',
			email: apiData.from_email || '',
			phone: apiData.from_phone || '',
			logo: null
		},
		from_name: apiData.from_name,
		from_address: apiData.from_address,
		from_email: apiData.from_email,
		from_phone: apiData.from_phone,
		client: {
			name: apiData.to_name || '',
			address: apiData.to_address || '',
			email: apiData.to_email || '',
			phone: apiData.to_phone || ''
		},
		to_name: apiData.to_name,
		to_address: apiData.to_address,
		to_email: apiData.to_email,
		to_phone: apiData.to_phone,
		items: items,
		discount: {
			type: 'percent',
			value: Number(apiData.discount_percent || 0)
		},
		discount_percent: Number(apiData.discount_percent || 0),
		taxRate: Number(apiData.tax_percent || 0),
		tax_percent: Number(apiData.tax_percent || 0),
		amount: totalAmount,
		notes: apiData.notes || '',
		currency: apiData.currency || 'Rp',
		createdAt: apiData.created_at || null,
		updatedAt: apiData.updated_at || null
	};
}

/**
 * Ping backend API to check availability
 */
export async function testBackendConnection() {
	const baseUrl = getApiBaseUrl();
	try {
		const res = await fetch(`${baseUrl}/api/templates`, {
			method: 'GET',
			headers: { Accept: 'application/json' },
			signal: AbortSignal.timeout(6000)
		});

		if (res.ok) {
			const data = await res.json();
			return {
				success: true,
				status: res.status,
				message: 'Terhubung ke Database PostgreSQL Railway!',
				templates: Array.isArray(data) ? data : (data.templates || API_TEMPLATES)
			};
		}

		return {
			success: false,
			status: res.status,
			message: `Server merespons status ${res.status}: ${res.statusText}`
		};
	} catch (err) {
		return {
			success: false,
			status: 0,
			message: `Gagal menghubungi server (${err.message}). Pastikan layanan Railway aktif.`
		};
	}
}

/**
 * GET /api/templates
 */
export async function getTemplates() {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/templates`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`HTTP error ${res.status} fetching templates`);
	}
	const data = await res.json();
	return Array.isArray(data) ? data : (data.templates || API_TEMPLATES);
}

/**
 * GET /api/invoices
 */
export async function getInvoices() {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/invoices`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`HTTP error ${res.status} fetching invoices`);
	}
	const data = await res.json();
	const list = Array.isArray(data) ? data : (data.data || []);
	return list.map(fromApiPayload).filter(Boolean);
}

/**
 * GET /api/invoices/{id}
 */
export async function getInvoice(id) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/invoices/${encodeURIComponent(id)}`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`HTTP error ${res.status} fetching invoice #${id}`);
	}
	const data = await res.json();
	return fromApiPayload(data.data || data);
}

/**
 * POST /api/invoices
 * Sends exact JSON contract per Section 3 of PDF
 */
export async function createInvoice(invoiceData, templateId) {
	const baseUrl = getApiBaseUrl();
	const payload = toApiPayload(invoiceData, templateId);

	const res = await fetch(`${baseUrl}/api/invoices`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		let errMsg = `HTTP ${res.status}`;
		try {
			const errBody = await res.json();
			errMsg = errBody.message || JSON.stringify(errBody);
		} catch (e) {
			errMsg = res.statusText || errMsg;
		}
		throw new Error(`Gagal menyimpan ke database API: ${errMsg}`);
	}

	const data = await res.json();
	return fromApiPayload(data.data || data);
}

/**
 * PUT /api/invoices/{id}
 */
export async function updateInvoice(id, invoiceData, templateId) {
	const baseUrl = getApiBaseUrl();
	const payload = toApiPayload(invoiceData, templateId);

	const res = await fetch(`${baseUrl}/api/invoices/${encodeURIComponent(id)}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		let errMsg = `HTTP ${res.status}`;
		try {
			const errBody = await res.json();
			errMsg = errBody.message || JSON.stringify(errBody);
		} catch (e) {
			errMsg = res.statusText || errMsg;
		}
		throw new Error(`Gagal memperbarui ke database API: ${errMsg}`);
	}

	const data = await res.json();
	return fromApiPayload(data.data || data);
}

/**
 * DELETE /api/invoices/{id}
 */
export async function deleteInvoice(id) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/invoices/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		throw new Error(`Gagal menghapus invoice dari database API: HTTP ${res.status}`);
	}

	return true;
}

/**
 * GET /api/invoices/{id}/pdf
 * Triggers browser download of backend-generated PDF
 */
export function downloadBackendPdf(id, filename) {
	const baseUrl = getApiBaseUrl();
	const url = `${baseUrl}/api/invoices/${encodeURIComponent(id)}/pdf`;
	const link = document.createElement('a');
	link.href = url;
	link.download = filename || `invoice-${id}.pdf`;
	link.target = '_blank';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/**
 * PRODUCTS API
 */
export async function getProducts() {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/products`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`Gagal mengambil data produk: HTTP ${res.status}`);
	}
	const data = await res.json();
	const list = data.data || [];
	return list.map((p) => ({
		id: p.id,
		name: p.name,
		category: p.category || 'Umum',
		price: Number(p.price) || 0,
		unit: p.unit || 'Unit',
		createdAt: p.created_at
	}));
}

export async function saveProduct(product) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/products`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify(product)
	});
	if (!res.ok) {
		throw new Error(`Gagal menyimpan produk ke database: HTTP ${res.status}`);
	}
	const data = await res.json();
	const p = data.data;
	return {
		id: p.id,
		name: p.name,
		category: p.category || 'Umum',
		price: Number(p.price) || 0,
		unit: p.unit || 'Unit'
	};
}

export async function deleteProduct(id) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/products/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`Gagal menghapus produk: HTTP ${res.status}`);
	}
	return true;
}

/**
 * CUSTOMERS API
 */
export async function getCustomers() {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/customers`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`Gagal mengambil data pelanggan: HTTP ${res.status}`);
	}
	const data = await res.json();
	const list = data.data || [];
	return list.map((c) => ({
		id: c.id,
		name: c.name,
		email: c.email || '',
		phone: c.phone || '',
		address: c.address || '',
		outstanding: Number(c.outstanding) || 0,
		totalInvoices: Number(c.total_invoices) || 0,
		createdAt: c.created_at
	}));
}

export async function saveCustomer(customer) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/customers`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({
			id: customer.id,
			name: customer.name,
			email: customer.email,
			phone: customer.phone,
			address: customer.address,
			outstanding: customer.outstanding,
			total_invoices: customer.totalInvoices !== undefined ? customer.totalInvoices : customer.total_invoices
		})
	});
	if (!res.ok) {
		throw new Error(`Gagal menyimpan data pelanggan ke database: HTTP ${res.status}`);
	}
	const data = await res.json();
	const c = data.data;
	return {
		id: c.id,
		name: c.name,
		email: c.email || '',
		phone: c.phone || '',
		address: c.address || '',
		outstanding: Number(c.outstanding) || 0,
		totalInvoices: Number(c.total_invoices) || 0
	};
}

export async function deleteCustomer(id) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/customers/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`Gagal menghapus pelanggan: HTTP ${res.status}`);
	}
	return true;
}

/**
 * SETTINGS API
 */
export async function getSettings() {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/settings`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`Gagal mengambil pengaturan bisnis: HTTP ${res.status}`);
	}
	const data = await res.json();
	return data.data;
}

export async function saveSettings(settingsData) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/settings`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify(settingsData)
	});
	if (!res.ok) {
		throw new Error(`Gagal menyimpan pengaturan bisnis: HTTP ${res.status}`);
	}
	const data = await res.json();
	return data.data;
}

/**
 * EMAIL REMINDER API
 */
export async function sendInvoiceEmailReminder(invoiceId) {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}/api/invoices/${encodeURIComponent(invoiceId)}/reminder`, {
		method: 'POST',
		headers: { Accept: 'application/json' }
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.message || `Gagal mengirim email pengingat (HTTP ${res.status})`);
	}
	return data;
}

export async function triggerCronReminders(cronSecret = '') {
	const baseUrl = getApiBaseUrl();
	const keyParam = cronSecret ? `?key=${encodeURIComponent(cronSecret)}` : '';
	const res = await fetch(`${baseUrl}/api/cron/reminders${keyParam}`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.message || `Gagal menjalankan Cron pengingat (HTTP ${res.status})`);
	}
	return data;
}

