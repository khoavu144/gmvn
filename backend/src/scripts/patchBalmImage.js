/**
 * PATCH SCRIPT (plain JS, no ts-node required)
 * Run: node src/scripts/patchBalmImage.js
 *
 * Fixes broken Magnesium Balm 100ml variant image in live DB.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Client } = require('pg');

const BROKEN = 'photo-1515377905703-c4788e51af15';
const FIXED   = 'photo-1556228578-dd6e4b9f1f31';

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not set. Make sure .env is present and readable.');
        process.exit(1);
    }

    console.log('🔧 Connecting to database …');
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const { rows } = await client.query(
        `UPDATE product_variants
         SET    image_url  = replace(image_url, $1, $2),
                updated_at = NOW()
         WHERE  image_url LIKE '%' || $1 || '%'
         RETURNING id, sku, image_url`,
        [BROKEN, FIXED]
    );

    if (!rows.length) {
        console.log('ℹ️  No rows matched — broken URL may already be fixed or data not yet seeded.');
    } else {
        console.log(`✅ Patched ${rows.length} variant(s):`);
        rows.forEach(r => console.log(`   SKU=${r.sku}  new image_url=${r.image_url.substring(0, 80)}`));
    }

    await client.end();
    console.log('Done.');
}

main().catch(err => {
    console.error('❌ Patch failed:', err.message);
    process.exit(1);
});
