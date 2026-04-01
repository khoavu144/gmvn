import { test, expect, type Page } from '@playwright/test';

const mockUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'critical-user@gymerviet.test',
  full_name: 'Critical User',
  user_type: 'trainer',
  avatar_url: null,
  onboarding_completed: true,
  created_at: '2026-03-23T00:00:00.000Z',
};

const mockAthleteUser = {
  ...mockUser,
  id: '22222222-2222-4222-8222-222222222222',
  email: 'athlete-user@gymerviet.test',
  full_name: 'Athlete Tester',
  user_type: 'athlete',
};

async function bootstrapAuthenticatedSession(page: Page, user = mockUser) {
  await page.addInitScript(({ accessToken, refreshToken }) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, {
    accessToken: 'access-token-critical',
    refreshToken: 'refresh-token-critical',
  });

  await page.route('**/socket.io/**', async (route) => {
    await route.abort();
  });

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: user,
      }),
    });
  });
}

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
    await bootstrapAuthenticatedSession(page);

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

  test('dashboard shows athlete workspace with mocked overview', async ({ page }) => {
    await bootstrapAuthenticatedSession(page, mockAthleteUser);

    await page.route('**/api/v1/dashboard/athlete/overview', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          overview: {
            week_sessions: 3,
            active_relationships: 2,
            unread_notifications: 4,
            unread_messages: 1,
          },
        }),
      });
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Xin chào, Tester');
    await expect(page.getByText('Không gian làm việc Vận động viên')).toBeVisible();
    await expect(page.getByText('Lịch tập và hồ sơ vận động viên')).toBeVisible();
    await expect(page.getByText('Buổi trong tuần')).toBeVisible();
    await expect(page.getByText('Chương trình tham gia')).toBeVisible();
    await expect(page.getByRole('link', { name: /tìm huấn luyện viên/i })).toBeVisible();
  });

  test('messages keeps partner and context visible in mocked thread', async ({ page }) => {
    await bootstrapAuthenticatedSession(page, mockAthleteUser);

    await page.route('**/api/v1/messages/conversations/coach-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          messages: [
            {
              id: 'msg-1',
              sender_id: 'coach-123',
              receiver_id: mockAthleteUser.id,
              content: 'Mình xem hồ sơ rồi, có thể bắt đầu từ tuần sau.',
              context_type: 'program',
              context_id: 'program-1',
              context_label: 'Gói tập 12 buổi',
              created_at: '2026-03-24T09:00:00.000Z',
              is_read: true,
            },
          ],
        }),
      });
    });

    await page.route('**/api/v1/messages/conversations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          conversations: [
            {
              partner_id: 'coach-123',
              partner: {
                id: 'coach-123',
                full_name: 'HLV An',
                avatar_url: null,
              },
              last_message: {
                content: 'Mình xem hồ sơ rồi, có thể bắt đầu từ tuần sau.',
                context_type: 'program',
                context_label: 'Gói tập 12 buổi',
                created_at: '2026-03-24T09:00:00.000Z',
                is_read: true,
              },
              unread_count: 0,
            },
          ],
        }),
      });
    });

    await page.goto('/messages?to=coach-123&name=HLV%20An&profile_path=%2Fcoaches%2Fcoach-123&context_type=program&context_id=program-1&context_label=G%C3%B3i%20t%E1%BA%ADp%2012%20bu%E1%BB%95i', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tin nhắn');
    await expect(page.getByRole('link', { name: 'HLV An' })).toHaveAttribute('href', '/coaches/coach-123');
    await expect(page.getByText('Ngữ cảnh đang trao đổi: Gói tập 12 buổi')).toBeVisible();
    await expect(
      page.getByText('Về: Gói tập 12 buổiMình xem hồ sơ rồi, có thể bắt đầu từ tuần sau.', { exact: true })
    ).toBeVisible();
  });
});
