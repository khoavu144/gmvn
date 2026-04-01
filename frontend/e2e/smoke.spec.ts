import { test, expect } from '@playwright/test';

const mockCoach = {
  id: 'coach-smoke-id',
  profile_slug: 'coach-smoke',
  full_name: 'Nguyen Smoke Coach',
  headline: 'Huấn luyện sức mạnh',
  avatar_url: null,
  bio: 'Huấn luyện viên mẫu cho smoke test.',
  specialties: ['Gym tổng hợp'],
  base_price_monthly: 1200000,
  is_verified: true,
  city: 'TP. Hồ Chí Minh',
  avg_rating: 4.8,
  review_count: 12,
  is_accepting_clients: true,
  user_type: 'trainer',
};

async function mockCoachDirectoryFlow(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/users/trainers?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          trainers: [mockCoach],
          total: 1,
          page: 1,
          totalPages: 1,
        },
      }),
    });
  });

  await page.route('**/api/v1/users/trainers/slug/coach-smoke', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: mockCoach.id },
      }),
    });
  });

  await page.route(`**/api/v1/users/trainers/${mockCoach.id}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: mockCoach,
      }),
    });
  });

  await page.route(`**/api/v1/programs/trainers/${mockCoach.id}/programs`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        programs: [],
      }),
    });
  });

  await page.route(`**/api/v1/users/trainers/${mockCoach.id}/testimonials?limit=6`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        testimonials: [],
      }),
    });
  });

  await page.route(`**/api/v1/users/trainers/${mockCoach.id}/before-after`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(`**/api/v1/users/trainers/${mockCoach.id}/similar?limit=3`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [],
      }),
    });
  });

  await page.route(`**/api/v1/profiles/trainer/${mockCoach.id}/full`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        profile: {
          slug: mockCoach.profile_slug,
        },
        skills: [],
        experience: [],
        packages: [],
        premium: null,
      }),
    });
  });
}

test.describe('public smoke', () => {
  test('home loads without fatal errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/GYMERVIET/i);
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('gyms listing loads', async ({ page }) => {
    await page.goto('/gyms', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('coaches listing loads', async ({ page }) => {
    await page.goto('/coaches', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('coach detail discovered from listing loads', async ({ page }) => {
    await mockCoachDirectoryFlow(page);

    await page.goto('/coaches', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();

    const detailLink = page.locator(`a[href="/coach/${mockCoach.profile_slug}"]`).first();
    await expect(detailLink).toBeVisible({ timeout: 15_000 });

    const detailPath = await detailLink.getAttribute('href');
    expect(detailPath).toBeTruthy();

    await page.goto(detailPath!, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(mockCoach.full_name, { timeout: 15_000 });
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible({ timeout: 10_000 });
  });

  test('news listing loads', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('marketplace loads', async ({ page }) => {
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('pricing loads', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /^Nâng cấp ngay$/ })).toHaveCount(0);
  });
});
