import pg from 'pg';
import { env } from '$env/dynamic/private';

const { Pool } = pg;

const connectionString =
	env.DATABASE_URL ||
	process.env.DATABASE_URL ||
	'postgresql://postgres:rjZrCMtjDUqBbWktmDTyKLOjXxbwGsns@iriguchi.proxy.rlwy.net:21397/railway';

export const pool = new Pool({
	connectionString,
	ssl: connectionString.includes('proxy.rlwy.net') ? false : { rejectUnauthorized: false }
});

let isInitialized = false;

export async function initDb() {
	if (isInitialized) return;

	try {
		// 1. Table: invoices
		await pool.query(`
			CREATE TABLE IF NOT EXISTS invoices (
				id VARCHAR(100) PRIMARY KEY,
				invoice_number VARCHAR(100) UNIQUE NOT NULL,
				template_id VARCHAR(100) DEFAULT 'modern-minimal',
				status VARCHAR(50) DEFAULT 'Draft',
				issue_date VARCHAR(50),
				due_date VARCHAR(50),
				from_name VARCHAR(255),
				from_address TEXT,
				from_email VARCHAR(255),
				from_phone VARCHAR(100),
				to_name VARCHAR(255),
				to_address TEXT,
				to_email VARCHAR(255),
				to_phone VARCHAR(100),
				discount_percent NUMERIC DEFAULT 0,
				tax_percent NUMERIC DEFAULT 0,
				currency VARCHAR(20) DEFAULT 'Rp',
				notes TEXT,
				items JSONB DEFAULT '[]'::jsonb,
				last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`);

		// Ensure last_reminder_sent_at exists for existing databases
		await pool.query(`
			ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE;
		`);

		// 2. Table: products
		await pool.query(`
			CREATE TABLE IF NOT EXISTS products (
				id VARCHAR(100) PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				category VARCHAR(100),
				price NUMERIC DEFAULT 0,
				unit VARCHAR(50) DEFAULT 'Unit',
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`);

		// 3. Table: customers
		await pool.query(`
			CREATE TABLE IF NOT EXISTS customers (
				id VARCHAR(100) PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email VARCHAR(255),
				phone VARCHAR(100),
				address TEXT,
				outstanding NUMERIC DEFAULT 0,
				total_invoices INTEGER DEFAULT 0,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`);

		// 4. Table: business_settings
		await pool.query(`
			CREATE TABLE IF NOT EXISTS business_settings (
				id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
				name VARCHAR(255),
				email VARCHAR(255),
				phone VARCHAR(100),
				address TEXT,
				bank_info TEXT,
				logo TEXT,
				currency VARCHAR(20) DEFAULT 'IDR',
				default_tax NUMERIC DEFAULT 11,
				default_template VARCHAR(100) DEFAULT 'modern-minimal',
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`);

		// Seed initial default products if table is empty
		const prodCount = await pool.query('SELECT count(*) FROM products;');
		if (parseInt(prodCount.rows[0].count, 10) === 0) {
			await pool.query(`
				INSERT INTO products (id, name, category, price, unit) VALUES
				('prod-1', 'Desain Logo & Brand Guideline', 'Desain', 2500000, 'Paket'),
				('prod-2', 'Pengembangan Website Landing Page', 'Development', 4500000, 'Proyek'),
				('prod-3', 'Sesi Konsultasi Bisnis & UI/UX (per jam)', 'Konsultasi', 600000, 'Jam'),
				('prod-4', 'Setup Cloud Hosting & SSL Domain', 'DevOps', 1200000, 'Setup'),
				('prod-5', 'Paket Maintenance & Dukungan Teknis Bulanan', 'Maintenance', 1500000, 'Bulan')
				ON CONFLICT (id) DO NOTHING;
			`);
		}

		// Seed initial default customers if table is empty
		const custCount = await pool.query('SELECT count(*) FROM customers;');
		if (parseInt(custCount.rows[0].count, 10) === 0) {
			await pool.query(`
				INSERT INTO customers (id, name, email, phone, address, outstanding, total_invoices) VALUES
				('cust-1', 'PT Sumber Makmur Sejahtera', 'finance@sumbermakmur.co.id', '081122334455', 'Gedung Wisma Niaga Lt. 4, Jakarta Pusat', 4500000, 6),
				('cust-2', 'CV Karya Digital Nusantara', 'admin@karyadigital.id', '081234567890', 'Cyber Tower 2 Lt. 9, Jakarta Selatan', 2100000, 3),
				('cust-3', 'PT Mitra Retail Indonesia', 'procurement@mitraretail.co.id', '081398765432', 'Menara Sudirman Lt. 14, Jakarta', 8500000, 4),
				('cust-4', 'PT Sinar Abadi Sentosa', 'legal@sinarabadi.co.id', '081900112233', 'Kawasan Industri GIIC Cikarang, Bekasi', 0, 2)
				ON CONFLICT (id) DO NOTHING;
			`);
		}

		// Seed initial business settings if table is empty
		const settingsCount = await pool.query('SELECT count(*) FROM business_settings;');
		if (parseInt(settingsCount.rows[0].count, 10) === 0) {
			await pool.query(`
				INSERT INTO business_settings (id, name, email, phone, address, bank_info, currency, default_tax, default_template) VALUES
				('default', 'Bisnis Kamu', 'billing@bisniskamu.com', '0812-3456-7890', 'Jl. Pemuda No. 12, Surabaya', 'Transfer ke Bank BCA: 8870-1234-56 a.n Bisnis Kamu', 'IDR', 11, 'modern-minimal')
				ON CONFLICT (id) DO NOTHING;
			`);
		}

		isInitialized = true;
		console.log('PostgreSQL Railway tables initialized successfully!');
	} catch (err) {
		console.error('Failed to initialize database tables:', err);
		throw err;
	}
}
