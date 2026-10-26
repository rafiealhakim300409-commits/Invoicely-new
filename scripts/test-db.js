import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://postgres:rjZrCMtjDUqBbWktmDTyKLOjXxbwGsns@iriguchi.proxy.rlwy.net:21397/railway';
const pool = new Pool({
	connectionString,
	ssl: connectionString.includes('proxy.rlwy.net') ? false : { rejectUnauthorized: false }
});

async function main() {
	console.log('Testing Railway PostgreSQL connection...');

	// 1. Test Invoices
	const resInv = await pool.query('SELECT count(*) FROM invoices;');
	console.log('📄 Invoices count:', resInv.rows[0].count);

	// 2. Test Products
	const resProd = await pool.query('SELECT count(*) FROM products;');
	console.log('📦 Products count:', resProd.rows[0].count);

	// 3. Test Customers
	const resCust = await pool.query('SELECT count(*) FROM customers;');
	console.log('👥 Customers count:', resCust.rows[0].count);

	// 4. Test Business Settings
	const resSet = await pool.query('SELECT count(*) FROM business_settings;');
	console.log('⚙️ Business Settings count:', resSet.rows[0].count);

	console.log('\n✅ All 4 Railway PostgreSQL tables are connected and accessible!');
	await pool.end();
}

main().catch(console.error);
