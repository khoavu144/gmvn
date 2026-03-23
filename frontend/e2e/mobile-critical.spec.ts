import { test, expect, type Page, type Route } from '@playwright/test';

const IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="%23e7e5e4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="%233f3f46">GYMERVIET</text></svg>';

const mockGymListItem = {
  id: 'gym-1',
  slug: 'mock-gym',
  name: 'Urban Core Studio',
  listing_thumbnail: { image_url: IMG },
  cover_image_url: IMG,
  logo_url: IMG,
  discovery_blurb: 'Studio tập nhóm cường độ vừa, phù hợp người đi làm.',
  tagline: 'Tập gọn, lịch rõ, coach bám sát.',
  description: 'Không gian sạch, lịch lớp đều và có tư vấn trước buổi.',
  is_verified: true,
  primary_venue_type_slug: 'fitness_club',
  taxonomy_terms: [
    {
      is_primary: true,
      term: { term_type: 'venue_type', label: 'Fitness Club' },
    },
  ],
  branches: [
    {
      id: 'branch-1',
      branch_name: 'Urban Core Q1',
      city: 'TP.HCM',
      district: 'Quận 1',
      neighborhood_label: 'Bến Nghé',
    },
  ],
  trust_summary: { avg_rating: 4.7, review_count: 42 },
  price_from_amount: 350000,
  price_from_billing_cycle: 'per_month',
  response_sla_text: 'Phản hồi trong 15 phút',
  view_count: 1250,
};

const mockGymDetail = {
  ...mockGymListItem,
  default_primary_cta: 'consultation',
  hero_value_props: ['Có lớp sáng sớm', 'Có PT theo nhóm nhỏ'],
  highlights: ['Lịch cố định theo tuần', 'Có theo dõi tiến độ'],
  website_url: 'https://gymerviet.com',
  branches: [
    {
      id: 'branch-1',
      branch_name: 'Urban Core Q1',
      branch_tagline: 'Không gian tập gọn cho dân văn phòng.',
      description: 'Mỗi lớp 8-12 người, coach sửa form trực tiếp.',
      city: 'TP.HCM',
      district: 'Quận 1',
      neighborhood_label: 'Bến Nghé',
      phone: '0909000999',
      email: 'urban-core@gymerviet.com',
      whatsapp_number: '84909000000',
      opening_hours: {
        mon: { open: '06:00', close: '22:00' },
        tue: { open: '06:00', close: '22:00' },
        wed: { open: '06:00', close: '22:00' },
        thu: { open: '06:00', close: '22:00' },
        fri: { open: '06:00', close: '22:00' },
        sat: { open: '07:00', close: '20:00' },
        sun: { is_closed: false, open: '07:00', close: '19:00' },
      },
      branch_status_badges: ['Mở cửa hôm nay'],
      amenities: [{ id: 'amenity-1', label: 'Tủ đồ' }],
      equipment: [{ id: 'equip-1', category: 'cardio', label: 'Treadmill' }],
      zones: [{ id: 'zone-1', zone_type: 'functional_training', label: 'Functional Zone', description: 'Khu tạ và bodyweight.' }],
      trainer_links: [{ id: 'trainer-link-1', trainer: { id: 'trainer-1', full_name: 'Coach Minh', avatar_url: IMG, slug: 'coach-minh' } }],
      pricing: [{ id: 'price-1', name: 'Gói cơ bản', price: 350000, billing_cycle: 'per_month', order_number: 1 }],
      programs: [{ id: 'program-1', title: 'Strength Base', sessions_per_week: 3 }],
      gallery: [{ id: 'gallery-1', image_url: IMG, caption: 'Sảnh tập chính', image_type: 'other', media_role: 'hero', is_hero: true, order_number: 0 }],
      lead_routes: [
        {
          inquiry_type: 'consultation',
          primary_channel: 'phone',
          phone: '0909000999',
          auto_prefill_message: 'Cho mình hỏi lịch lớp thử nhé.',
        },
      ],
      google_maps_embed_url: null,
      latitude: 10.7758,
      longitude: 106.7009,
    },
  ],
};

const mockProduct = {
  id: 'product-1',
  slug: 'mock-product',
  title: 'Gói Coach Online 8 Tuần',
  description: 'Lộ trình online cho người bận rộn, có check-in mỗi tuần.',
  price: 890000,
  compare_at_price: 990000,
  currency: 'VND',
  thumbnail_url: IMG,
  gallery: [IMG],
  product_type: 'service',
  category: {
    id: 'cat-1',
    slug: 'coaching',
    label: 'Coaching',
    icon_emoji: '🎯',
  },
  seller: {
    id: 'seller-1',
    full_name: 'Coach Lan',
    avatar_url: IMG,
  },
  review_count: 12,
  avg_rating: 4.8,
  sale_count: 55,
  variants: [
    {
      id: 'variant-1',
      variant_label: '1:1 qua video call',
      price: 990000,
      compare_at_price: null,
      stock_quantity: 50,
      is_active: true,
    },
  ],
  attributes: {
    Format: 'Online',
    'Phù hợp': 'Người mới quay lại tập',
  },
  training_package: null,
  preview_content: null,
  stock_quantity: 99,
  track_inventory: false,
  digital_file_url: null,
};

const mockGalleryItem = {
  id: 'gallery-item-1',
  image_url: IMG,
  caption: 'Buổi tập tối sau giờ làm.',
  category: 'workout',
  source: 'admin_upload',
  is_featured: true,
  created_at: '2026-03-23T00:00:00.000Z',
  linked_user: {
    id: 'trainer-1',
    full_name: 'Coach Minh',
    avatar_url: IMG,
    slug: 'coach-minh',
    user_type: 'trainer',
  },
};

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockMobileApi(page: Page) {
  const handler = async (route: Route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const normalizedPath = path.replace(/^\/api\/v1/, '');

    if (normalizedPath === '/auth/me') {
      await fulfillJson(route, {
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        requestId: 'req-auth-me',
      }, 401);
      return;
    }

    if (normalizedPath === '/gyms/marketplace') {
      await fulfillJson(route, {
        success: true,
        gyms: [mockGymListItem],
        pagination: { total: 1, page: 1, totalPages: 1 },
      });
      return;
    }

    if (normalizedPath === '/gyms/marketplace/taxonomy') {
      await fulfillJson(route, { success: true, terms: [] });
      return;
    }

    if (normalizedPath === '/gyms/marketplace/mock-gym') {
      await fulfillJson(route, {
        success: true,
        gym: mockGymDetail,
        canonical_slug: 'mock-gym',
      });
      return;
    }

    if (
      normalizedPath === '/gyms/marketplace/gym-1/similar'
      || normalizedPath === '/gyms/marketplace/mock-gym/similar'
    ) {
      await fulfillJson(route, {
        success: true,
        gyms: [],
      });
      return;
    }

    if (normalizedPath === '/marketplace/categories') {
      await fulfillJson(route, {
        success: true,
        categories: [mockProduct.category],
      });
      return;
    }

    if (normalizedPath === '/marketplace/featured') {
      await fulfillJson(route, {
        success: true,
        featured: [mockProduct],
        new_arrivals: [mockProduct],
      });
      return;
    }

    if (normalizedPath === '/marketplace/products') {
      await fulfillJson(route, {
        success: true,
        products: [mockProduct],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      return;
    }

    if (normalizedPath === '/marketplace/products/mock-product') {
      await fulfillJson(route, {
        success: true,
        product: mockProduct,
      });
      return;
    }

    if (normalizedPath === '/marketplace/products/product-1/reviews') {
      await fulfillJson(route, {
        success: true,
        reviews: [
          {
            id: 'review-1',
            rating: 5,
            comment: 'Rất dễ theo, coach phản hồi nhanh.',
            is_verified_purchase: true,
            created_at: '2026-03-23T00:00:00.000Z',
            user: { full_name: 'Khánh' },
          },
        ],
      });
      return;
    }

    if (normalizedPath === '/gallery/stats') {
      await fulfillJson(route, {
        success: true,
        total_images: 120,
        featured_images: 16,
        total_contributors: 28,
      });
      return;
    }

    if (normalizedPath === '/gallery') {
      await fulfillJson(route, {
        success: true,
        items: [mockGalleryItem],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/**', handler);
  await page.route('**://localhost:3001/**', handler);
}

async function bodyOverflow(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).overflow);
}

test.describe('mobile deterministic critical interactions', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    void page;
    test.skip(!/mobile/i.test(testInfo.project.name), 'Mobile suite only applies to mobile projects');
    await mockMobileApi(page);
  });

  test('menu open-close keeps body scroll lock stable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const menuToggle = page.locator('button[aria-controls="mobile-menu"]');
    await expect(menuToggle).toBeVisible({ timeout: 20_000 });

    await menuToggle.click();
    await expect(page.getByRole('dialog', { name: /menu điều hướng/i })).toBeVisible();
    await expect.poll(() => bodyOverflow(page)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /menu điều hướng/i })).toBeHidden();
    await expect.poll(() => bodyOverflow(page)).not.toBe('hidden');
  });

  test('gym detail keeps sticky nav active and hides bottom nav', async ({ page }) => {
    await page.goto('/gyms/mock-gym', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/gyms\/mock-gym$/, { timeout: 20_000 });
    await expect(page.locator('.gym-detail-subnav')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.bottom-nav-item')).toHaveCount(0);

    const sectionButton = page.locator('.gym-detail-subnav button').nth(1);
    await sectionButton.click();
    await expect.poll(() => page.evaluate(() => window.location.hash)).not.toBe('');
  });

  test('product detail keeps CTA focus and no bottom-nav overlap', async ({ page }) => {
    await page.goto('/marketplace/product/mock-product', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/marketplace\/product\/mock-product$/, { timeout: 20_000 });
    await expect(page.locator('.mpd-cta-row')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.mpd-section-nav')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.bottom-nav-item')).toHaveCount(0);
  });

  test('gallery lightbox open-close restores body scroll', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });

    const firstCard = page.locator('.cursor-zoom-in').first();
    await expect(firstCard).toBeVisible({ timeout: 20_000 });
    await firstCard.click({ force: true });

    const closeButton = page.getByRole('button', { name: /đóng/i }).first();
    await expect(closeButton).toBeVisible({ timeout: 20_000 });
    await expect.poll(() => bodyOverflow(page)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(closeButton).toBeHidden({ timeout: 20_000 });
    await expect.poll(() => bodyOverflow(page)).not.toBe('hidden');
  });
});
