import { buildMockDataset } from '../seeds/mock-v2/buildMockDataset';
import { assertDatasetIntegrity, collectDatasetImageUrls } from '../seeds/mock-v2/integrity';

async function main() {
    const dataset = buildMockDataset();
    assertDatasetIntegrity(dataset);

    const summary = {
        coaches: dataset.coaches.length,
        athletes: dataset.athletes.length,
        members: dataset.members.length,
        gymOwners: dataset.gymOwners.length,
        gyms: dataset.gyms.length,
        shops: dataset.shops.length,
        products: dataset.products.length,
        communityGallery: dataset.communityGallery.length,
        messageThreads: dataset.messageThreads.length,
        messages: dataset.messageThreads.reduce((sum, thread) => sum + thread.messages.length, 0),
        gymReviews: dataset.gyms.reduce((sum, gym) => sum + gym.review_templates.length, 0),
        productReviews: dataset.productReviews.length,
        wishlists: dataset.wishlists.length,
        productOrders: dataset.productOrders.length,
        imageUrlsUsed: collectDatasetImageUrls(dataset).length,
    };

    console.log('Seed dataset integrity OK');
    console.table(summary);
}

main().catch((error) => {
    console.error('Seed dataset integrity failed');
    console.error(error);
    process.exit(1);
});
