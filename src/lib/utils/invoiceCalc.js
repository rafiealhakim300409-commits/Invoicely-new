/**
 * Centralized invoice math so every template renders identical totals.
 * @typedef {{ description: string, qty: number, price: number }} LineItem
 */

/** @param {LineItem[]} items */
export function calcSubtotal(items = []) {
	return items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
}

/**
 * @param {number} subtotal
 * @param {{ type: 'percent' | 'fixed', value: number }} discount
 */
export function calcDiscount(subtotal, discount) {
	if (!discount || !discount.value) return 0;
	return discount.type === 'percent' ? subtotal * (discount.value / 100) : Number(discount.value);
}

/**
 * @param {number} taxableAmount
 * @param {number} taxRatePercent
 */
export function calcTax(taxableAmount, taxRatePercent = 0) {
	return taxableAmount * (Number(taxRatePercent) / 100);
}

/**
 * Full breakdown used by every template + the create-invoice preview.
 * @param {{ items: LineItem[], discount?: { type: string, value: number }, taxRate?: number }} invoice
 */
export function calcInvoiceTotals(invoice) {
	const subtotal = calcSubtotal(invoice.items);
	const discountAmount = calcDiscount(subtotal, invoice.discount);
	const taxableAmount = Math.max(subtotal - discountAmount, 0);
	const taxAmount = calcTax(taxableAmount, invoice.taxRate);
	const total = taxableAmount + taxAmount;

	return { subtotal, discountAmount, taxAmount, total };
}

/** @param {number} amount @param {string} currency */
export function formatCurrency(amount, currency = 'IDR') {
	try {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount || 0);
	} catch (e) {
		return `${currency} ${Math.round(amount || 0).toLocaleString('id-ID')}`;
	}
}

/**
 * Konversi angka nominal ke kalimat terbilang Bahasa Indonesia resmi.
 * @param {number} nominal
 * @returns {string} Contoh: "Empat Juta Lima Ratus Ribu Rupiah"
 */
export function angkaTerbilang(nominal) {
	const n = Math.floor(Math.abs(Number(nominal) || 0));
	if (n === 0) return 'Nol Rupiah';

	const bil = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

	function pembilang(nilai) {
		if (nilai < 12) {
			return bil[nilai];
		} else if (nilai < 20) {
			return pembilang(nilai - 10) + ' Belas';
		} else if (nilai < 100) {
			return pembilang(Math.floor(nilai / 10)) + ' Puluh ' + pembilang(nilai % 10);
		} else if (nilai < 200) {
			return 'Seratus ' + pembilang(nilai - 100);
		} else if (nilai < 1000) {
			return pembilang(Math.floor(nilai / 100)) + ' Ratus ' + pembilang(nilai % 100);
		} else if (nilai < 2000) {
			return 'Seribu ' + pembilang(nilai - 1000);
		} else if (nilai < 1000000) {
			return pembilang(Math.floor(nilai / 1000)) + ' Ribu ' + pembilang(nilai % 1000);
		} else if (nilai < 1000000000) {
			return pembilang(Math.floor(nilai / 1000000)) + ' Juta ' + pembilang(nilai % 1000000);
		} else if (nilai < 1000000000000) {
			return pembilang(Math.floor(nilai / 1000000000)) + ' Milyar ' + pembilang(nilai % 1000000000);
		} else {
			return pembilang(Math.floor(nilai / 1000000000000)) + ' Triliun ' + pembilang(nilai % 1000000000000);
		}
	}

	const result = pembilang(n).replace(/\s+/g, ' ').trim();
	return `${result} Rupiah`;
}

