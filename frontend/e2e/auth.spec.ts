import { test, expect } from '@playwright/test';

/**
 * Chạy chỉ khi set E2E_LOGIN_EMAIL + E2E_LOGIN_PASSWORD (không commit).
 * CI: thêm secrets và bật job tương ứng.
 */
test.describe('authenticated smoke', () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL || !process.env.E2E_LOGIN_PASSWORD,
      'Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD to run login smoke',
    );
  });

  test('login reaches dashboard', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email', { exact: true }).fill(process.env.E2E_LOGIN_EMAIL!);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(process.env.E2E_LOGIN_PASSWORD!);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|gym-owner|onboarding)/, { timeout: 25_000 });
  });
});
