import { test, expect, type Page } from '@playwright/test';

function toPathname(href: string | null): string | null {
  if (!href) return null;
  try {
    const url = new URL(href, 'https://gymerviet.com');
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

async function clickFirstVisibleLinkMatching(page: Page, matcher: RegExp): Promise<string | null> {
  const links = page.locator('a[href]');
  const total = await links.count();

  for (let i = 0; i < total; i++) {
    const link = links.nth(i);
    if (!(await link.isVisible())) continue;

    const href = await link.getAttribute('href');
    const path = toPathname(href);
    if (!path || !matcher.test(path)) continue;

    await link.click();
    return path;
  }

  return null;
}

async function bodyOverflow(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).overflow);
}

test.describe('mobile interaction stability', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    void page;
    test.skip(!/mobile/i.test(testInfo.project.name), 'Mobile interaction suite only applies to mobile projects');
  });

  test('mobile menu toggles body scroll lock cleanly', async ({ page }) => {
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

  test('gym detail keeps sticky interactions usable and hides global bottom nav', async ({ page }) => {
    await page.goto('/gyms', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });

    try {
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('a[href]')).some((a) =>
            /^\/gyms\/[^/]+/.test(a.getAttribute('href') || '')
          ),
        null,
        { timeout: 25_000 }
      );
    } catch {
      test.skip(true, 'No gym detail link available in current dataset');
    }

    const target = await clickFirstVisibleLinkMatching(page, /^\/gyms\/[^/]+/);
    if (!target) test.skip(true, 'No visible gym detail link to validate interaction flow');

    await expect(page).toHaveURL(/\/gyms\/.+/, { timeout: 20_000 });
    await expect(page.locator('.bottom-nav-item')).toHaveCount(0);
    await expect(page.getByText('Chi phí ước tính từ')).toBeVisible({ timeout: 20_000 });

    const sectionButtons = page.locator('.gym-detail-subnav button');
    const sectionCount = await sectionButtons.count();
    if (sectionCount < 2) test.skip(true, 'Not enough sections to validate sticky section navigation');

    await sectionButtons.nth(1).click();
    await expect.poll(() => page.evaluate(() => window.location.hash)).not.toBe('');
  });

  test('product detail CTA does not conflict with global bottom nav', async ({ page }) => {
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });

    try {
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('a[href]')).some((a) =>
            /^\/marketplace\/product\/[^/]+/.test(a.getAttribute('href') || '')
          ),
        null,
        { timeout: 25_000 }
      );
    } catch {
      test.skip(true, 'No product detail link available in current dataset');
    }

    const target = await clickFirstVisibleLinkMatching(page, /^\/marketplace\/product\/[^/]+/);
    if (!target) test.skip(true, 'No visible product detail link to validate CTA behavior');

    await expect(page).toHaveURL(/\/marketplace\/product\/.+/, { timeout: 20_000 });
    await expect(page.locator('.mpd-cta-row')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.mpd-section-nav')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.bottom-nav-item')).toHaveCount(0);
  });

  test('gallery lightbox open-close cycle restores scroll state', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });

    const firstCard = page.locator('.cursor-zoom-in').first();
    if ((await firstCard.count()) === 0) {
      test.skip(true, 'No gallery card available to validate lightbox interactions');
    }

    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.click({ force: true });

    const closeButton = page.getByRole('button', { name: /đóng/i }).first();
    await expect(closeButton).toBeVisible({ timeout: 20_000 });
    await expect.poll(() => bodyOverflow(page)).toBe('hidden');

    await closeButton.click();
    await expect(closeButton).toBeHidden({ timeout: 20_000 });
    await expect.poll(() => bodyOverflow(page)).not.toBe('hidden');

    await firstCard.click({ force: true });
    await expect(closeButton).toBeVisible({ timeout: 20_000 });
    await page.keyboard.press('Escape');
    await expect(closeButton).toBeHidden({ timeout: 20_000 });
    await expect.poll(() => bodyOverflow(page)).not.toBe('hidden');
  });
});
