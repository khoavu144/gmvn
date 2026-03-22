import { IMAGE_MANIFEST } from '../seeds/mock-v2/imageManifest';
import { validateSeedImages } from '../seeds/mock-v2/imageValidation';

async function main() {
    const results = await validateSeedImages();
    const failures = results.filter((result) => !result.ok);

    if (failures.length > 0) {
        console.error(`Image validation failed: ${failures.length}/${results.length} URLs invalid`);
        failures.forEach((failure) => {
            console.error(`- [${failure.kind}] ${failure.id} :: ${failure.url}`);
            console.error(`  status=${failure.status ?? 'n/a'} content-type=${failure.contentType ?? 'n/a'} error=${failure.error ?? 'unknown'}`);
        });
        process.exit(1);
    }

    console.log(`Image validation OK: ${results.length} URLs checked from ${IMAGE_MANIFEST.length} manifest entries`);
}

main().catch((error) => {
    console.error('Image validation crashed');
    console.error(error);
    process.exit(1);
});
