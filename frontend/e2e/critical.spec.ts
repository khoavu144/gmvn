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

  test('pricing announces free-first access for authenticated user', async ({ page }) => {
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

    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('miễn phí');
    await expect(page.getByRole('link', { name: /vào dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Nâng cấp ngay$/ })).toHaveCount(0);
    await expect(page.getByText('Thanh toán qua SePay')).toHaveCount(0);
  });

  test('pricing for guest focuses on free access instead of checkout', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: /tạo tài khoản miễn phí/i })).toBeVisible();
    await expect(page.getByText('Platform billing đã tắt vĩnh viễn')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Nâng cấp ngay$/ })).toHaveCount(0);
    await expect(page.getByText('Nội dung CK')).toHaveCount(0);
  });
});
