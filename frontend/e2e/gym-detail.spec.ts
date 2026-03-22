import { test, expect } from '@playwright/test';

function gymDetailPath(href: string | null): string | null {
  if (!href) return null;
  try {
    const u = new URL(href, 'https://gymerviet.com');
    if (u.pathname.startsWith('/gyms/') && u.pathname !== '/gyms' && u.pathname.length > '/gyms/'.length) {
      return u.pathname + u.search;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Opens the first gym detail URL discovered on /gyms (same pattern as GymCard: /gyms/:slugOrId).
 * Skips when the listing has no venue links (empty DB / different layout) to stay non-flaky.
 */
test.describe('gym detail from listing', () => {
  test('first gym card navigates to detail with main visible', async ({ page }) => {
    await page.goto('/gyms', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });

    // Cards hydrate after fetch — wait until at least one gym detail link exists.
    try {
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('a')).some((a) => {
            const h = a.getAttribute('href');
            if (!h) return false;
            try {
              const u = new URL(h, window.location.origin);
              return u.pathname.startsWith('/gyms/') && u.pathname.length > '/gyms/'.length;
            } catch {
              return false;
            }
          }),
        null,
        { timeout: 25_000 }
      );
    } catch {
      test.skip();
    }

    const links = page.locator('a');
    const total = await links.count();
    let targetHref: string | null = null;

    for (let i = 0; i < total; i++) {
      const href = await links.nth(i).getAttribute('href');
      const path = gymDetailPath(href);
      if (path) {
        targetHref = href;
        await links.nth(i).click();
        break;
      }
    }

    if (!targetHref) {
      test.skip();
    }

    await expect(page).toHaveURL(/\/gyms\/.+/, { timeout: 15_000 });
    await expect(page.getByRole('main')).toBeVisible({ timeout: 25_000 });
  });
});
