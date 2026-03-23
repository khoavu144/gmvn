import { test, expect } from '@playwright/test';

const mockUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'critical-user@gymerviet.test',
  full_name: 'Critical User',
  user_type: 'trainer',
  avatar_url: null,
  onboarding_completed: true,
  created_at: '2026-03-23T00:00:00.000Z',
};

test.describe('critical flows', () => {
  test('login failure shows API envelope message', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            message: 'Sai email hoặc mật khẩu',
            code: 'INVALID_CREDENTIALS',
          },
          requestId: 'req-login-failed',
        }),
      });
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill('critical-user@gymerviet.test');
    await page.getByLabel('Mật khẩu').fill('wrong-password');
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    await expect(page.getByRole('alert')).toContainText('Sai email hoặc mật khẩu');
  });

  test('login success redirects into onboarding when account is incomplete', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            access_token: 'access-token-critical',
            refresh_token: 'refresh-token-critical',
            user: {
              ...mockUser,
              onboarding_completed: false,
            },
          },
        }),
      });
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill('critical-user@gymerviet.test');
    await page.getByLabel('Mật khẩu').fill('correct-password');
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    await expect(page).toHaveURL(/\/onboarding$/);
  });

  test('pricing checkout success shows transfer instructions for authenticated user', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'access-token-critical');
      localStorage.setItem('refresh_token', 'refresh-token-critical');
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockUser,
        }),
      });
    });

    await page.route('**/api/v1/platform/checkout', async (route) => {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          description: `GYMERVIET-PLAN-${String(body.plan).toUpperCase()}-ABCD1234`,
          amount: 499999,
          plan: body.plan,
        }),
      });
    });

    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Nâng cấp ngay$/ }).first().click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Thanh toán qua SePay')).toBeVisible();
    await expect(page.getByText('Nội dung CK')).toBeVisible();
    await expect(page.getByText(/GYMERVIET-PLAN-/)).toBeVisible();
  });

  test('pricing checkout failure shows envelope error without silent fallback', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'access-token-critical');
      localStorage.setItem('refresh_token', 'refresh-token-critical');
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockUser,
        }),
      });
    });

    await page.route('**/api/v1/platform/checkout', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            message: 'Hệ thống thu phí chưa được kích hoạt',
            code: 'BILLING_DISABLED',
          },
          requestId: 'req-pricing-failed',
        }),
      });
    });

    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Nâng cấp ngay$/ }).first().click();
    await expect(page.getByRole('alert')).toContainText('Hệ thống thu phí chưa được kích hoạt');
  });
});
