/**
 * PATCH SCRIPT: Fix broken image URL for Magnesium Balm 100ml variant
 *
 * Broken photo: photo-1515377905703-c4788e51af15 (skateboard image — wrong category)
 * Fixed photo:  photo-1556228578-dd6e4b9f1f31 (lotion/body product — correct)
 *
 * Run via:  npm run patch:balm
 *        or ts-node src/scripts/patchBalmImage.ts
 */
import 'reflect-metadata';
import { AppDataSource } from '../config/database';

const BROKEN_PHOTO_ID = 'photo-1515377905703-c4788e51af15';
const FIXED_PHOTO_ID  = 'photo-1556228578-dd6e4b9f1f31';

async function main() {
    console.log('🔧 Connecting to database …');
    await AppDataSource.initialize();

    const result: { id: number; sku: string; image_url: string }[] = await AppDataSource.query(`
        UPDATE product_variants
        SET    image_url = replace(image_url, $1, $2),
               updated_at = NOW()
        WHERE  image_url LIKE '%' || $1 || '%'
        RETURNING id, sku, image_url
    `, [BROKEN_PHOTO_ID, FIXED_PHOTO_ID]);

    if (!result.length) {
        console.log('ℹ️  No rows matched – the broken URL may have already been fixed or not yet seeded.');
    } else {
        console.log(`✅ Patched ${result.length} variant(s):`);
        result.forEach(r => console.log(`   SKU=${r.sku}  image_url=${r.image_url}`));
    }

    await AppDataSource.destroy();
    console.log('Done.');
}

main().catch(err => {
    console.error('❌ Patch failed:', err);
    process.exit(1);
});
