import { IMAGE_MANIFEST } from './imageManifest';
import type { MockDataset } from './types';

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

export function collectDatasetImageUrls(dataset: MockDataset): string[] {
    const urls = new Set<string>();

    const add = (value: string | null | undefined) => {
        if (value) urls.add(value);
    };

    dataset.coaches.forEach((coach) => {
        add(coach.avatar_url);
        add(coach.cover_image_url);
        coach.gallery.forEach((item) => add(item.image_url));
        coach.testimonials.forEach((item) => add(item.client_avatar));
        add(coach.before_after.before_url);
        add(coach.before_after.after_url);
        coach.programs.forEach((item) => add(item.cover_image_url));
    });

    dataset.athletes.forEach((athlete) => {
        add(athlete.avatar_url);
        add(athlete.cover_image_url);
        athlete.gallery.forEach((item) => add(item.image_url));
        athlete.progress_photos.forEach((item) => add(item.image_url));
        athlete.achievements.forEach((item) => add(item.certificate_image_url));
    });

    dataset.members.forEach((member) => add(member.avatar_url));
    dataset.gymOwners.forEach((owner) => add(owner.avatar_url));

    dataset.gyms.forEach((gym) => {
        add(gym.logo_url);
        add(gym.cover_image_url);
        gym.gallery.forEach((item) => add(item.image_url));
    });

    dataset.shops.forEach((shop) => {
        add(shop.shop_logo_url);
        add(shop.shop_cover_url);
    });

    dataset.products.forEach((product) => {
        add(product.thumbnail_url);
        product.gallery.forEach((item) => add(item));
        product.variants.forEach((variant) => add(variant.image_url));
    });

    dataset.communityGallery.forEach((item) => add(item.image_url));

    return [...urls];
}

export function assertDatasetIntegrity(dataset: MockDataset): void {
    assert(dataset.coaches.length === 20, `Expected 20 coaches, got ${dataset.coaches.length}`);
    assert(dataset.athletes.length === 20, `Expected 20 athletes, got ${dataset.athletes.length}`);
    assert(dataset.members.length === 20, `Expected 20 members, got ${dataset.members.length}`);
    assert(dataset.gymOwners.length === 20, `Expected 20 gym owners, got ${dataset.gymOwners.length}`);
    assert(dataset.gyms.length === 20, `Expected 20 gyms, got ${dataset.gyms.length}`);
    assert(dataset.shops.length === 20, `Expected 20 shops, got ${dataset.shops.length}`);
    assert(dataset.products.length === 100, `Expected 100 products, got ${dataset.products.length}`);
    assert(dataset.communityGallery.length === 20, `Expected 20 community gallery items, got ${dataset.communityGallery.length}`);
    assert(dataset.messageThreads.length === 40, `Expected 40 message threads, got ${dataset.messageThreads.length}`);
    assert(dataset.messageThreads.reduce((sum, thread) => sum + thread.messages.length, 0) === 160, 'Expected exactly 160 messages');
    assert(dataset.productOrders.length === 36, `Expected 36 product orders, got ${dataset.productOrders.length}`);
    assert(dataset.wishlists.length === 80, `Expected 80 wishlists, got ${dataset.wishlists.length}`);
    assert(dataset.productReviews.length === 60, `Expected 60 product reviews, got ${dataset.productReviews.length}`);
    assert(
        dataset.gyms.reduce((sum, gym) => sum + gym.review_templates.length, 0) === 40,
        'Expected exactly 40 gym reviews',
    );

    assert(dataset.shops.filter((shop) => shop.business_type === 'coach').length === 10, 'Expected 10 coach shops');
    assert(dataset.shops.filter((shop) => shop.business_type === 'gym').length === 5, 'Expected 5 gym-owner shops');
    assert(dataset.shops.filter((shop) => shop.business_type === 'individual').length === 5, 'Expected 5 member shops');

    const emails = new Set<string>();
    const userSlugs = new Set<string>();
    [...dataset.coaches, ...dataset.athletes, ...dataset.members, ...dataset.gymOwners].forEach((user) => {
        assert(!emails.has(user.email), `Duplicate email: ${user.email}`);
        assert(!userSlugs.has(user.slug), `Duplicate user slug: ${user.slug}`);
        emails.add(user.email);
        userSlugs.add(user.slug);
    });

    const shopSlugs = new Set<string>();
    dataset.shops.forEach((shop) => {
        assert(!shopSlugs.has(shop.shop_slug), `Duplicate shop slug: ${shop.shop_slug}`);
        shopSlugs.add(shop.shop_slug);
    });

    const productSlugs = new Set<string>();
    const skuSet = new Set<string>();
    const shopCounts = new Map<string, number>();
    dataset.products.forEach((product) => {
        assert(!productSlugs.has(product.slug), `Duplicate product slug: ${product.slug}`);
        assert(!skuSet.has(product.sku), `Duplicate product SKU: ${product.sku}`);
        productSlugs.add(product.slug);
        skuSet.add(product.sku);
        product.variants.forEach((variant) => {
            assert(!skuSet.has(variant.sku), `Duplicate variant SKU: ${variant.sku}`);
            skuSet.add(variant.sku);
        });
        shopCounts.set(product.shop_key, (shopCounts.get(product.shop_key) ?? 0) + 1);
    });
    dataset.shops.forEach((shop) => {
        assert(shopCounts.get(shop.key) === 5, `Expected 5 products for ${shop.key}, got ${shopCounts.get(shop.key) ?? 0}`);
    });

    const orderNumbers = new Set<string>();
    dataset.productOrders.forEach((order) => {
        assert(!orderNumbers.has(order.order_number), `Duplicate order number: ${order.order_number}`);
        orderNumbers.add(order.order_number);
    });

    const coachKeys = new Set(dataset.coaches.map((item) => item.key));
    const athleteKeys = new Set(dataset.athletes.map((item) => item.key));
    const userKeys = new Set([...coachKeys, ...athleteKeys, ...dataset.members.map((item) => item.key), ...dataset.gymOwners.map((item) => item.key)]);
    const productKeys = new Set(dataset.products.map((item) => item.key));

    dataset.messageThreads.forEach((thread) => {
        assert(thread.participants.length === 2, `Thread ${thread.key} must have two participants`);
        thread.participants.forEach((participant) => assert(userKeys.has(participant), `Unknown participant ${participant}`));
        thread.messages.forEach((message) => assert(userKeys.has(message.sender_key), `Unknown sender ${message.sender_key}`));
    });

    dataset.wishlists.forEach((item) => {
        assert(userKeys.has(item.user_key), `Wishlist user not found: ${item.user_key}`);
        assert(productKeys.has(item.product_key), `Wishlist product not found: ${item.product_key}`);
    });

    dataset.productReviews.forEach((review) => {
        assert(userKeys.has(review.user_key), `Review user not found: ${review.user_key}`);
        assert(productKeys.has(review.product_key), `Review product not found: ${review.product_key}`);
    });

    dataset.productOrders.forEach((order) => {
        assert(userKeys.has(order.buyer_key), `Order buyer not found: ${order.buyer_key}`);
        order.items.forEach((item) => assert(productKeys.has(item.product_key), `Order item product not found: ${item.product_key}`));
    });

    dataset.gyms.forEach((gym) => {
        assert(gym.linked_trainer_keys.length >= 2, `Gym ${gym.key} should link at least two trainers`);
        gym.linked_trainer_keys.forEach((trainerKey) => assert(coachKeys.has(trainerKey), `Gym ${gym.key} references unknown coach ${trainerKey}`));
        gym.review_templates.forEach((review) => assert(userKeys.has(review.reviewer_key), `Gym ${gym.key} review user missing: ${review.reviewer_key}`));
    });

    dataset.communityGallery.forEach((item) => {
        assert(item.linked_user_key == null || coachKeys.has(item.linked_user_key) || athleteKeys.has(item.linked_user_key), `Community item ${item.key} must link only coach/athlete`);
    });

    dataset.coaches.forEach((coach) => {
        assert(coach.packages.length === 3, `Coach ${coach.key} must have 3 packages`);
        assert(coach.testimonials.length === 2, `Coach ${coach.key} must have 2 testimonials`);
        assert(coach.programs.length >= 1, `Coach ${coach.key} must have at least 1 program`);
        assert(coach.gallery.length >= 4, `Coach ${coach.key} must have at least 4 gallery images`);
    });

    const manifestUrls = new Set(IMAGE_MANIFEST.map((entry) => entry.url));
    collectDatasetImageUrls(dataset).forEach((url) => {
        assert(manifestUrls.has(url), `Dataset image is missing from manifest: ${url}`);
    });
}
