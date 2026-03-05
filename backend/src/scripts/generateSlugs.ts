import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

async function generateSlugsForTrainers() {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);

    // Get all trainers without slugs
    const trainers = await userRepo.find({
        where: { user_type: 'trainer' }
    });

    console.log(`Found ${trainers.length} trainers`);

    if (trainers.length === 0) {
        console.log('No trainers found.');
        await AppDataSource.destroy();
        return;
    }

    // Get all existing slugs to ensure uniqueness
    const existingSlugs = trainers
        .filter(t => t.slug)
        .map(t => t.slug as string);

    console.log(`Existing slugs: ${existingSlugs.length}`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const trainer of trainers) {
        if (trainer.slug) {
            console.log(`  Skipping ${trainer.full_name} (already has slug: ${trainer.slug})`);
            skippedCount++;
            continue;
        }

        const slug = generateUniqueSlug(trainer.full_name, existingSlugs);
        trainer.slug = slug;
        existingSlugs.push(slug);

        await userRepo.save(trainer);
        console.log(`  ✅ ${trainer.full_name} -> ${slug}`);
        updatedCount++;
    }

    console.log(`\n✅ Slug generation completed:`);
    console.log(`   - ${updatedCount} trainers updated`);
    console.log(`   - ${skippedCount} trainers skipped (already had slugs)`);

    await AppDataSource.destroy();
}

generateSlugsForTrainers().catch(err => {
    console.error('Error generating slugs:', err);
    process.exit(1);
});
