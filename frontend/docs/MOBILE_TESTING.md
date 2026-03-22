# Kiểm thử mobile — GYMERVIET frontend

## Playwright (tự động, viewport + touch)

**Lần đầu trên máy dev:** cài đủ browser (kể cả WebKit cho `mobile-safari`):

```bash
cd frontend && npx playwright install
```

Cấu hình: [`playwright.config.ts`](../playwright.config.ts) — ba project:

| Project | Thiết bị mô phỏng |
|---------|-------------------|
| `chromium` | Desktop Chrome |
| `mobile-chrome` | Pixel 7 (Android Chrome) |
| `mobile-safari` | iPhone 13 (WebKit) |

**Chạy local** (cần build trước; preview 4173 được webServer tự bật):

```bash
cd frontend
npm run build:ci
npm run test:e2e
```

Chỉ desktop hoặc chỉ mobile:

```bash
npm run test:e2e:desktop
npm run test:e2e:mobile
```

**Prod / staging:**

```bash
PLAYWRIGHT_BASE_URL=https://gymerviet.com npm run test:e2e:prod
```

**Giới hạn:** Playwright mobile **không** thay thế Safari thật trên iOS (scroll, keyboard, safe-area, 100vh). Dùng để hồi quy layout và lỗi JS trên viewport hẹp.

---

## Máy thật (bắt buộc cho scroll “đơ”, navigation khựng)

1. Build + preview bind LAN:

   ```bash
   cd frontend && npm run build && npm run preview -- --host 0.0.0.0 --port 4173
   ```

2. Trên điện thoại: mở `http://<IP-Mac>:4173` (cùng Wi‑Fi).

3. **Remote debug:** Safari (iOS) Web Inspector từ Mac; Android `chrome://inspect`.

---

## Phase tiếp theo (đề xuất)

1. **Ghi issue theo route:** Home, Coaches, Gyms, Marketplace, Gym detail, Profile, Login — mỗi issue: thiết bị, bước tái hiện, video/GIF nếu có.
2. **Ưu tiên sửa:** `position: fixed` / `sticky` + `BottomNav` + `Header` (chiều cao `pt-header` / `pb-nav`), khóa scroll `body` khi mở modal/menu, `100dvh` / `safe-area-inset`, long task sau lazy load.
3. **Mở rộng E2E:** thêm spec `*.mobile.spec.ts` hoặc `test.describe` với `project: 'mobile-chrome'` cho: mở menu, tap filter, cuộn tới section gym detail (nếu ổn định).
4. **CI:** nếu thời gian chạy test tăng gấp 3, có thể chạy `test:e2e:mobile` trên nhánh/đêm; PR chỉ `test:e2e:desktop` (cấu hình workflow tùy team).
