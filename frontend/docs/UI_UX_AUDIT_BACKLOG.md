# Gymerviet — UI/UX audit backlog & on-air baseline

**Tiến độ theo thời gian:** [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md)  
**QA tay sau release:** [MANUAL_UX_CHECKLIST.md](./MANUAL_UX_CHECKLIST.md)

## Baseline (Phase 0)

| Field | Value |
|--------|--------|
| **Repo revision (local)** | `8293bba59602ffcbfc1fb00fd753a117f8a56fc5` — *Đối chiếu với commit đang deploy trên gymerviet.com trước khi release.* |
| **Production** | https://gymerviet.com |

### Luồng ưu tiên (smoke / manual)

1. `/` — Home  
2. `/gyms` — Danh sách phòng tập  
3. `/gyms/:id` — Chi tiết gym (UUID hoặc slug theo backend)  
4. `/athlete/:slug` — Hồ sơ vận động viên  
5. `/coaches`, `/coaches/:trainerId`, `/coach/:slug`  
6. `/login`, `/register`  
7. `/dashboard`, `/gym-owner` — *Cần tài khoản test; E2E tự động hiện chỉ public routes.*

### Tài khoản test

- **Không lưu credential trong repo.** Có thể dùng `PLAYWRIGHT_BASE_URL` và sau này biến môi trường cho flow đăng nhập (xem [frontend/.env.example](../.env.example)).

---

## Code audit (Phase 1A)

### Static quality

- **`npm run lint`**: 0 errors, 0 warnings (đã dọn wave 2; xác nhận lại bằng `npm run lint` trước release).
- **`npm run build`**: thành công.

### Sửa đã áp dụng (P0 / chất lượng build)

| Vấn đề | Hành động |
|--------|-----------|
| ESLint `react-hooks/set-state-in-effect` / purity | Refactor `GalleryLightbox` (community), `GymProgramsSection` (derive `effectiveProgramId`), `useNotification` (thứ tự callback), `NewsDetailPage` (bỏ `Math.random` skeleton), `ui/GalleryLightbox` (thứ tự hook + disable có ghi chú), các trang fetch có `eslint-disable` có lý do |
| `usePlatformPlan` shadowing `fetch` | Đổi tên `loadPlan` |

### Đối chiếu `final-audit/` vs `frontend/src`

- **[GymCard.tsx](../../final-audit/GymCard.tsx)** và **[frontend/src/components/GymCard.tsx](../src/components/GymCard.tsx)** đồng bộ (badge overlap fix, Tailwind, variants).
- Các file khác trong `final-audit/` (AthleteDetailPage, Button, v.v.) vẫn có thể dùng làm tham chiếu incremental; không bắt buộc merge một lần cho on-air.

---

## Live audit (Phase 1B)

### Lighthouse — https://gymerviet.com/ (mobile emulation, trước khi deploy bản sửa contrast)

| Category | Score |
|----------|------:|
| Performance | 64 |
| Accessibility | 95 |
| Best practices | 100 |
| SEO | 100 |

**Accessibility — `color-contrast` (fail):**

| Vị trí | Mô tả | Viewport |
|--------|--------|----------|
| `Footer` | `text-gray-300` chữ “by khoavu.” trên nền gần trắng | mobile/desktop |
| `nav.lg:hidden` bottom nav | Nhãn `text-[11px]` (Coach, Gym, Đăng nhập) với màu xám quá nhạt so với nền | mobile |

*Sau khi deploy: dùng `text-gray-600` (footer credit), `.bottom-nav-item` → `text-gray-700` ([globals.css](../src/styles/globals.css)), kỳ vọng `color-contrast` pass (đã xác nhận trên build local + Lighthouse a11y 100).*

### Manual / keyboard

- **Khuyến nghị:** Tab qua header, bottom nav, form đăng nhập; kiểm tra focus ring trên custom control sau mỗi release.

---

## Automated tests (Phase 2)

- **Playwright:** [playwright.config.ts](../playwright.config.ts), specs [e2e/smoke.spec.ts](../e2e/smoke.spec.ts).
- **Chạy local (preview):** `npm run build` (lần đầu) rồi `npm run test:e2e` — server `127.0.0.1:4173` tự khởi động nếu không dùng URL từ xa.
- **Chạy production:** `npm run test:e2e:prod` hoặc `PLAYWRIGHT_BASE_URL=https://gymerviet.com npm run test:e2e`.

Routes smoke: `/`, `/gyms`, `/coaches`, `/login`, `/news`, `/marketplace`, `/pricing`; thêm `/gyms/:id` qua [gym-detail.spec.ts](../e2e/gym-detail.spec.ts) trên prod (+ [auth.spec.ts](../e2e/auth.spec.ts) khi có env).

---

## Fixes applied (tóm tắt triển khai)

1. Sạch ESLint errors (hooks / purity / immutability) để CI và chất lượng React 19 ổn định.  
2. A11y P1: contrast footer + mobile bottom navigation.  
3. Playwright smoke + script prod + `.gitignore` artifacts.  
4. Tài liệu baseline & backlog (file này).

### P2 / backlog tiếp (không chặn on-air)

- Giảm warnings ESLint (catch blocks, exhaustive-deps).  
- Lighthouse performance (unused JS/CSS, LCP, CLS) — theo dõi sau deploy.  
- Refactor lớn GymDetailPage split components theo [final-audit/GYMERVIET_UI_REFACTOR_PLAN.md](../../final-audit/GYMERVIET_UI_REFACTOR_PLAN.md) khi có sprint riêng.

---

## Nhật ký deploy & xác minh (ngắn gọn)

Mỗi lần deploy production hoặc đổi rõ rệt A11y/Perf: cập nhật bảng **Phase A** bên dưới **và** thêm một dòng vào [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md).

---

## Phase A — Xác minh production (Wave 2)

**Ngày chạy:** 2026-03-22 (UTC+7, máy dev). **Repo revision (đối chiếu):** `8293bba59602ffcbfc1fb00fd753a117f8a56fc5`. **URL:** https://gymerviet.com

| Kiểm tra | Kết quả |
|----------|---------|
| `npm run test:e2e:prod` | **8 passed**, **1 skipped** (`e2e/auth.spec.ts` — thiếu `E2E_LOGIN_*`). Thêm `e2e/gym-detail.spec.ts` (đợi hydrate link `/gyms/…`); **local preview** có thể skip nếu không có venue. |
| Lighthouse mobile **Performance / Accessibility** | `/` **66** / **95**; `/gyms` **71** / **96**; `/login` **71** / **94** *(vòng đo 2026-03-22 — có dao động ±1 điểm perf giữa các lần chạy)* |
| Accessibility `color-contrast` | Vẫn **fail** trên prod (`cc` score 0). **Deploy** bundle đã sửa contrast trong repo vẫn là bước cần làm (operator / pipeline). |

**Gợi ý sau deploy contrast-fix:** `npx lighthouse https://gymerviet.com/login --only-categories=accessibility` — kỳ vọng `color-contrast` pass khi CSS mới đã lên hosting.

**Ghi chú:** Không có quyền deploy từ agent; mỗi lần release thật — cập nhật cột commit ở Phase 0 + một dòng [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md).

---

## Phase B — Mở rộng E2E & CI

- Smoke thêm **`/marketplace`**, **`/pricing`** ([e2e/smoke.spec.ts](../e2e/smoke.spec.ts)).
- **Chi tiết gym từ listing:** [e2e/gym-detail.spec.ts](../e2e/gym-detail.spec.ts) — đợi hydrate (`waitForFunction`) rồi mở link đầu tiên hợp lệ tới `/gyms/:idOrSlug`; **skip** nếu sau timeout vẫn không có link (DB trống / preview không có dữ liệu).
- **[e2e/auth.spec.ts](../e2e/auth.spec.ts):** login → dashboard/onboarding khi có `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` (mặc định skip).
- **GitHub Actions:** bản workflow nằm tại [frontend/docs/ci/frontend-e2e.workflow.yml](../docs/ci/frontend-e2e.workflow.yml) — copy sang `.github/workflows/frontend-e2e.yml` (GitHub UI hoặc PAT có scope **workflow**). Chi tiết: [frontend/docs/ci/README.md](../docs/ci/README.md). Job: `npm ci`, `playwright install`, `build`, `test:e2e` (preview); env `E2E_LOGIN_*` từ secrets nếu có.
- **Lighthouse cục bộ:** `npm run lh:a11y` (cần `npm run preview` trước đó).

---

## Phase C — ESLint

- **0 errors, 0 warnings** sau khi dọn `catch` không dùng biến, `useCallback`/`useMemo` cho deps (Gyms, GymDetailPage branches/equipment, Programs, Subscriptions, Workouts, GymReviewList, Admin*, v.v.) và bỏ `eslint-disable` thừa ở [App.tsx](../src/App.tsx).
- **Xác nhận 2026-03-22:** `npm run lint` trong `frontend/` — **0 errors, 0 warnings** (tiếp tục giữ khi chỉnh Phase E).

---

## Phase D — Performance / bundle

- **Home:** avatar đầu tiên trong panel “dữ liệu thật” — `width`/`height`, `loading="eager"`, `fetchPriority="high"` để hỗ trợ LCP khi ảnh là candidate ([Home.tsx](../src/pages/Home.tsx)).
- **Bundle budget:** cập nhật [scripts/check-bundle-budget.mjs](../scripts/check-bundle-budget.mjs) cho baseline thực tế; `npm run build:ci` pass.

### LCP / CLS trên production (điền sau khi đo)

| URL (mobile) | LCP (s) trước | LCP (s) sau | CLS trước | CLS sau | Ngày đo | Ghi chú |
|--------------|---------------|-------------|-----------|---------|---------|---------|
| `/` | 5.06 | — | 0.154 | — | 2026-03-22 | Lighthouse mobile default; cột “sau” khi có can thiệp đo lại |
| `/gyms` | 4.79 | — | 0.000 | — | 2026-03-22 | |
| `/login` | 4.80 | — | 0.000 | — | 2026-03-22 | |

*Sau khi có số: thêm một dòng vào [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md).*

**Hành động gợi ý (sau baseline trên):** `/` có CLS **0.154** — ưu tiên giữ chỗ (min-height / aspect-ratio) cho hero hoặc panel LCP trước khi lazy-split charts/maps; đo lại rồi điền cột “sau”.

---

## Phase E — Refactor (incremental)

- **Q9 FadeIn / IntersectionObserver:** đã bỏ trên gym-detail sections + **ProfileCV** (bỏ `FadeSection` và toàn bộ `IntersectionObserver`; count-up và skill bar chạy sau mount) — 2026-03-22.
- **Gym detail — tách component:** [GymSimilarSection.tsx](../src/components/gym-detail/GymSimilarSection.tsx), [GymMapSection.tsx](../src/components/gym-detail/GymMapSection.tsx) dùng trong [GymDetailPage.tsx](../src/pages/GymDetailPage.tsx); hero / rail / overview vẫn trong page (sprint tiếp).
- **Token `--mk-*` (mẫu):** bắt đầu dọn [GymZonesSection.tsx](../src/components/gym-detail/GymZonesSection.tsx) sang border/text stone/amber Tailwind (tiếp tục từng file).
- **GymProgramsSection:** không còn FadeIn local ([GymProgramsSection.tsx](../src/components/gym-detail/GymProgramsSection.tsx)).
- **AthleteDetailPage:** đã có mobile sidebar + sticky CTA theo comment đầu file; tinh chỉnh thêm theo [GYMERVIET_UI_REFACTOR_PLAN.md](../../final-audit/GYMERVIET_UI_REFACTOR_PLAN.md) khi cần.
- **CoachDetailPage:** bỏ fetch gym links không dùng; `navigate` trong dependency của effect tải profile.
- **Sprint tiếp:** shell `GymDetailPage` gọn hơn, Athlete polish, dọn `--mk-*` hàng loạt; mỗi PR → [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md).
