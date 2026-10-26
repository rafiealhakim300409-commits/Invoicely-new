import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { calcInvoiceTotals } from '$lib/utils/invoiceCalc.js';

// Default starter products
const DEFAULT_PRODUCTS = [
	{ id: 'prod-1', name: 'Desain Logo & Brand Guideline', category: 'Desain', price: 2500000, unit: 'Paket' },
	{ id: 'prod-2', name: 'Pengembangan Website Landing Page', category: 'Development', price: 4500000, unit: 'Proyek' },
	{ id: 'prod-3', name: 'Sesi Konsultasi Bisnis & UI/UX (per jam)', category: 'Konsultasi', price: 600000, unit: 'Jam' },
	{ id: 'prod-4', name: 'Setup Cloud Hosting & SSL Domain', category: 'DevOps', price: 1200000, unit: 'Setup' },
	{ id: 'prod-5', name: 'Paket Maintenance & Dukungan Teknis Bulanan', category: 'Maintenance', price: 1500000, unit: 'Bulan' }
];

// Default starter clients / PT
const DEFAULT_CUSTOMERS = [
	{
		id: 'cust-1',
		name: 'PT Sumber Makmur Sejahtera',
		email: 'finance@sumbermakmur.co.id',
		phone: '081122334455',
		address: 'Gedung Wisma Niaga Lt. 4, Jakarta Pusat',
		totalInvoices: 6,
		outstanding: 4500000
	},
	{
		id: 'cust-2',
		name: 'CV Karya Digital Nusantara',
		email: 'admin@karyadigital.id',
		phone: '081234567890',
		address: 'Cyber Tower 2 Lt. 9, Jakarta Selatan',
		totalInvoices: 3,
		outstanding: 2100000
	},
	{
		id: 'cust-3',
		name: 'PT Mitra Retail Indonesia',
		email: 'procurement@mitraretail.co.id',
		phone: '081398765432',
		address: 'Menara Sudirman Lt. 14, Jakarta',
		totalInvoices: 4,
		outstanding: 8500000
	},
	{
		id: 'cust-4',
		name: 'PT Sinar Abadi Sentosa',
		email: 'legal@sinarabadi.co.id',
		phone: '081900112233',
		address: 'Kawasan Industri GIIC Cikarang, Bekasi',
		totalInvoices: 2,
		outstanding: 0
	}
];

// Default starter invoices
const DEFAULT_INVOICES = [
	{
		id: 'inv-2026-0004',
		number: 'INV-2026-0004',
		date: '2026-08-10',
		dueDate: '2026-08-24',
		status: 'paid',
		currency: 'IDR',
		client: {
			name: 'PT Sumber Makmur Sejahtera',
			email: 'finance@sumbermakmur.co.id',
			phone: '081122334455',
			address: 'Gedung Wisma Niaga Lt. 4, Jakarta Pusat'
		},
		business: {
			name: 'Bisnis Kamu',
			address: 'Jl. Pemuda No. 12, Surabaya',
			email: 'billing@bisniskamu.com'
		},
		items: [
			{ description: 'Pengembangan Web App SvelteKit & API', qty: 1, price: 4500000 }
		],
		discount: { type: 'percent', value: 0 },
		taxRate: 0,
		amount: 4500000,
		templateId: 'modern',
		notes: 'Pembayaran telah diterima lunas. Terima kasih atas kerja samanya.'
	},
	{
		id: 'inv-2026-0003',
		number: 'INV-2026-0003',
		date: '2026-08-05',
		dueDate: '2026-08-19',
		status: 'unpaid',
		currency: 'IDR',
		client: {
			name: 'CV Karya Digital Nusantara',
			email: 'admin@karyadigital.id',
			phone: '081234567890',
			address: 'Cyber Tower 2 Lt. 9, Jakarta Selatan'
		},
		business: {
			name: 'Bisnis Kamu',
			address: 'Jl. Pemuda No. 12, Surabaya',
			email: 'billing@bisniskamu.com'
		},
		items: [
			{ description: 'Setup Cloud Hosting & SSL Domain', qty: 1, price: 1200000 },
			{ description: 'Sesi Konsultasi Bisnis & UI/UX (per jam)', qty: 1, price: 600000 }
		],
		discount: { type: 'percent', value: 0 },
		taxRate: 11,
		amount: 1998000,
		templateId: 'professional',
		notes: 'Pembayaran transfer ke Bank BCA: 8870-1234-56 a.n Bisnis Kamu.'
	},
	{
		id: 'inv-2026-0002',
		number: 'INV-2026-0002',
		date: '2026-07-28',
		dueDate: '2026-08-11',
		status: 'overdue',
		currency: 'IDR',
		client: {
			name: 'Studio Kreatif Bandung',
			email: 'hello@studiokreatif.com',
			phone: '081398765432',
			address: 'Jl. Riau No. 12, Bandung'
		},
		business: {
			name: 'Bisnis Kamu',
			address: 'Jl. Pemuda No. 12, Surabaya',
			email: 'billing@bisniskamu.com'
		},
		items: [
			{ description: 'Setup Cloud Hosting & SSL Domain', qty: 1, price: 1200000 }
		],
		discount: { type: 'percent', value: 0 },
		taxRate: 0,
		amount: 1200000,
		templateId: 'corporate',
		notes: 'Invoice telah melewati jatuh tempo. Harap segera lakukan pembayaran.'
	},
	{
		id: 'inv-2026-0001',
		number: 'INV-2026-0001',
		date: '2026-07-20',
		dueDate: '2026-08-03',
		status: 'draft',
		currency: 'IDR',
		client: {
			name: 'PT Mitra Retail Indonesia',
			email: 'procurement@mitraretail.co.id',
			phone: '081398765432',
			address: 'Menara Sudirman Lt. 14, Jakarta'
		},
		business: {
			name: 'Bisnis Kamu',
			address: 'Jl. Pemuda No. 12, Surabaya',
			email: 'billing@bisniskamu.com'
		},
		items: [
			{ description: 'Desain Logo & Brand Guideline', qty: 1, price: 2500000 }
		],
		discount: { type: 'percent', value: 0 },
		taxRate: 0,
		amount: 2500000,
		templateId: 'modern',
		notes: 'Draft penawaran faktur.'
	}
];

import {
	getProducts as apiGetProducts,
	saveProduct as apiSaveProduct,
	deleteProduct as apiDeleteProduct,
	getCustomers as apiGetCustomers,
	saveCustomer as apiSaveCustomer,
	deleteCustomer as apiDeleteCustomer,
	getInvoices as apiGetInvoices,
	deleteInvoice as apiDeleteInvoice
} from '$lib/services/api.js';

function createProductsStore() {
	let initial = DEFAULT_PRODUCTS;
	if (browser) {
		try {
			const saved = localStorage.getItem('invoicely_products');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) {
					initial = parsed;
				}
			}
		} catch (e) {
			console.error('Error loading products from localStorage:', e);
		}
	}

	const { subscribe, set, update } = writable(initial);

	function persist(data) {
		if (browser) {
			try {
				localStorage.setItem('invoicely_products', JSON.stringify(data));
			} catch (e) {
				console.error('Error saving products:', e);
			}
		}
	}

	const store = {
		subscribe,
		set: (val) => {
			persist(val);
			set(val);
		},
		addProduct: async (prod) => {
			const item = {
				id: prod.id || `prod-${Date.now()}`,
				unit: 'Unit',
				...prod
			};
			update((list) => {
				const updated = [item, ...list];
				persist(updated);
				return updated;
			});

			try {
				await apiSaveProduct(item);
			} catch (err) {
				console.warn('Backend product save notice:', err.message);
			}
			return item;
		},
		updateProduct: async (id, updatedData) => {
			let updatedItem;
			update((list) => {
				const updated = list.map((p) => {
					if (p.id === id) {
						updatedItem = { ...p, ...updatedData };
						return updatedItem;
					}
					return p;
				});
				persist(updated);
				return updated;
			});

			if (updatedItem) {
				try {
					await apiSaveProduct(updatedItem);
				} catch (err) {
					console.warn('Backend product update notice:', err.message);
				}
			}
		},
		deleteProduct: async (id) => {
			update((list) => {
				const updated = list.filter((p) => p.id !== id);
				persist(updated);
				return updated;
			});

			try {
				await apiDeleteProduct(id);
			} catch (err) {
				console.warn('Backend product delete notice:', err.message);
			}
		},
		syncWithBackend: async () => {
			try {
				const remoteList = await apiGetProducts();
				if (Array.isArray(remoteList) && remoteList.length > 0) {
					update((localList) => {
						const map = new Map();
						for (const p of localList) map.set(p.id, p);
						for (const p of remoteList) map.set(p.id, { ...(map.get(p.id) || {}), ...p });
						const merged = Array.from(map.values());
						persist(merged);
						return merged;
					});
					return { success: true, count: remoteList.length };
				}
				return { success: true, count: 0 };
			} catch (err) {
				return { success: false, error: err.message };
			}
		},
		resetDefaults: () => {
			persist(DEFAULT_PRODUCTS);
			set(DEFAULT_PRODUCTS);
		}
	};

	if (browser) {
		setTimeout(() => {
			store.syncWithBackend();
		}, 300);
	}

	return store;
}

function createCustomersStore() {
	let initial = DEFAULT_CUSTOMERS;
	if (browser) {
		try {
			const saved = localStorage.getItem('invoicely_customers');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) {
					initial = parsed;
				}
			}
		} catch (e) {
			console.error('Error loading customers from localStorage:', e);
		}
	}

	const { subscribe, set, update } = writable(initial);

	function persist(data) {
		if (browser) {
			try {
				localStorage.setItem('invoicely_customers', JSON.stringify(data));
			} catch (e) {
				console.error('Error saving customers:', e);
			}
		}
	}

	const store = {
		subscribe,
		set: (val) => {
			persist(val);
			set(val);
		},
		addCustomer: async (cust) => {
			const item = {
				id: cust.id || `cust-${Date.now()}`,
				totalInvoices: cust.totalInvoices || cust.total_invoices || 0,
				outstanding: cust.outstanding || 0,
				...cust
			};
			update((list) => {
				const updated = [item, ...list];
				persist(updated);
				return updated;
			});

			try {
				await apiSaveCustomer(item);
			} catch (err) {
				console.warn('Backend customer save notice:', err.message);
			}
			return item;
		},
		updateCustomer: async (id, updatedData) => {
			let updatedItem;
			update((list) => {
				const updated = list.map((c) => {
					if (c.id === id) {
						updatedItem = { ...c, ...updatedData };
						return updatedItem;
					}
					return c;
				});
				persist(updated);
				return updated;
			});

			if (updatedItem) {
				try {
					await apiSaveCustomer(updatedItem);
				} catch (err) {
					console.warn('Backend customer update notice:', err.message);
				}
			}
		},
		deleteCustomer: async (id) => {
			update((list) => {
				const updated = list.filter((c) => c.id !== id);
				persist(updated);
				return updated;
			});

			try {
				await apiDeleteCustomer(id);
			} catch (err) {
				console.warn('Backend customer delete notice:', err.message);
			}
		},
		syncWithBackend: async () => {
			try {
				const remoteList = await apiGetCustomers();
				if (Array.isArray(remoteList) && remoteList.length > 0) {
					update((localList) => {
						const map = new Map();
						for (const c of localList) map.set(c.id, c);
						for (const c of remoteList) map.set(c.id, { ...(map.get(c.id) || {}), ...c });
						const merged = Array.from(map.values());
						persist(merged);
						return merged;
					});
					return { success: true, count: remoteList.length };
				}
				return { success: true, count: 0 };
			} catch (err) {
				return { success: false, error: err.message };
			}
		},
		resetDefaults: () => {
			persist(DEFAULT_CUSTOMERS);
			set(DEFAULT_CUSTOMERS);
		}
	};

	if (browser) {
		setTimeout(() => {
			store.syncWithBackend();
		}, 300);
	}

	return store;
}

function createInvoicesStore() {
	let initial = DEFAULT_INVOICES;
	if (browser) {
		try {
			const saved = localStorage.getItem('invoicely_invoices');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed) && parsed.length > 0) {
					initial = parsed;
				}
			}
		} catch (e) {
			console.error('Error loading invoices from localStorage:', e);
		}
	}

	const { subscribe, set, update } = writable(initial);

	function persist(data) {
		if (browser) {
			try {
				localStorage.setItem('invoicely_invoices', JSON.stringify(data));
			} catch (e) {
				console.error('Error saving invoices:', e);
			}
		}
	}

	const store = {
		subscribe,
		set: (val) => {
			persist(val);
			set(val);
		},
		saveInvoice: (invoiceData) => {
			let savedItem;
			update((list) => {
				const totals = calcInvoiceTotals(invoiceData);
				const finalAmount = totals.total;

				// Check if existing by ID
				const existingIndex = list.findIndex((i) => i.id === invoiceData.id);
				if (existingIndex >= 0) {
					savedItem = {
						...list[existingIndex],
						...invoiceData,
						amount: finalAmount
					};
					list[existingIndex] = savedItem;
				} else {
					savedItem = {
						id: invoiceData.id || `inv-${Date.now()}`,
						...invoiceData,
						amount: finalAmount,
						status: invoiceData.status || 'unpaid'
					};
					list = [savedItem, ...list];
				}
				persist(list);
				return list;
			});
			return savedItem;
		},
		updateInvoiceStatus: (id, newStatus) => {
			update((list) => {
				const updated = list.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv));
				persist(updated);
				return updated;
			});
		},
		duplicateInvoice: (id) => {
			let duplicatedItem;
			update((list) => {
				const original = list.find((i) => i.id === id);
				if (!original) return list;

				const newNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
				duplicatedItem = {
					...JSON.parse(JSON.stringify(original)),
					id: `inv-${Date.now()}`,
					number: newNumber,
					date: new Date().toISOString().split('T')[0],
					dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					status: 'draft'
				};
				const updated = [duplicatedItem, ...list];
				persist(updated);
				return updated;
			});
			return duplicatedItem;
		},
		deleteInvoice: async (id) => {
			let toDelete;
			update((list) => {
				toDelete = list.find((inv) => inv.id === id);
				const updated = list.filter((inv) => inv.id !== id);
				persist(updated);
				return updated;
			});

			if (toDelete?.backendId) {
				try {
					await apiDeleteInvoice(toDelete.backendId);
				} catch (e) {
					console.warn('Backend delete sync note:', e.message);
				}
			}
		},
		syncWithBackend: async () => {
			try {
				const remoteList = await apiGetInvoices();
				if (Array.isArray(remoteList) && remoteList.length > 0) {
					update((localList) => {
						// Merge remote into local, prioritizing remote where matching number or backendId
						const map = new Map();
						// Start with local items
						for (const item of localList) {
							map.set(item.number || item.id, item);
						}
						// Merge remote items
						for (const item of remoteList) {
							const existing = map.get(item.number) || localList.find((l) => l.backendId === item.backendId);
							map.set(item.number || item.id, {
								...(existing || {}),
								...item
							});
						}
						const merged = Array.from(map.values());
						persist(merged);
						return merged;
					});
					return { success: true, count: remoteList.length };
				}
				return { success: true, count: 0 };
			} catch (err) {
				return { success: false, error: err.message };
			}
		},
		resetDefaults: () => {
			persist(DEFAULT_INVOICES);
			set(DEFAULT_INVOICES);
		}
	};

	if (browser) {
		setTimeout(() => {
			store.syncWithBackend();
		}, 300);
	}

	return store;
}

export const products = createProductsStore();
export const customers = createCustomersStore();
export const invoices = createInvoicesStore();
