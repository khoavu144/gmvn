# Tình trạng codebase — GYMERVIET (snapshot)

**Cập nhật:** 2026-03-22  
**Mục đích:** Một trang duy nhất mô tả **trạng thái thực tế** của repo (stack, UI, refactor, kiểm thử, nợ kỹ thuật). Khi merge PR lớn (UI, auth, gym, marketplace), nên chỉnh lại mục tương ứng và đổi ngày ở đầu file.

**Tài liệu liên quan:** [UI_UX_AUDIT_BACKLOG.md](./UI_UX_AUDIT_BACKLOG.md) · [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md) · [UI_PAGE_REVIEW_CHECKLIST.md](./UI_PAGE_REVIEW_CHECKLIST.md) · [MANUAL_UX_CHECKLIST.md](./MANUAL_UX_CHECKLIST.md) · **Backend:** [../../backend/docs/CODEBASE_STATUS.md](../../backend/docs/CODEBASE_STATUS.md)

---

## 1. Cấu trúc monorepo

| Thư mục | Vai trò |
|---------|---------|
| [`frontend/`](../) | SPA React (Vite): marketing, marketplace, dashboard, profile, legal. |
| [`backend/`](../../backend) | API Node/Express + PostgreSQL, Supabase, job queue (Bull), migrations. |

Không có package manager ở root; mỗi app có `package.json` riêng.

---

## 2. Frontend — stack & phiên bản (tiêu biểu)

| Hạng mục | Lựa chọn |
|----------|----------|
| Runtime | React 19, React Router 7 |
| Build | Vite 7, TypeScript ~5.9 |
| State / data | Redux Toolkit, TanStack Query, Axios |
| Styling | Tailwind CSS 3.4, CSS layers trong `src/index.css` + `src/styles/globals.css` |
| Form / validation | react-hook-form, Zod, `@hookform/resolvers` |
| Icons | **lucide-react** (chuẩn UI flat/stroke). **Không** dùng `@heroicons/react` trong `src` (dependency đã gỡ). |
| Khác | Framer Motion, Recharts, Leaflet/react-leaflet, Socket.io client, Headless UI |

**Font (HTML + Tailwind):** Inter (body/sans), Manrope (display — qua `tailwind.config.js` `fontFamily.display` và biến `--font-display` trong `index.css`). Google Fonts trong `index.html`.

**Scripts chất lượng:** `npm run lint`, `npm run build`, `npm run build:ci` (build + bundle budget), `npm run test:e2e` / `test:e2e:prod`, `screenshots:prod`, `lh:a11y`.

---

## 3. Hệ thống thiết kế & token (trạng thái hiện tại)

Quy ước ghi ở đầu [`src/index.css`](../src/index.css):

- **Shell / dashboard / form:** Tailwind `gray-*` + semantic `success` / `warning` / `error` / `info`.
- **Marketplace / editorial:** biến `--mk-*` (warm neutral), dùng qua `bg-[color:var(--mk-…)]` hoặc class `.marketplace-*`.
- **Curator / PDP:** `--cur-*` trong [`src/styles/marketplace.css`](../src/styles/marketplace.css).

**Đồng bộ neutral:** Đã chuyển `stone-*` / `zinc-*` → `gray-*` trên phần lớn `src`, **ngoại trừ** (cố ý) [`CoachDetailPage.tsx`](../src/pages/CoachDetailPage.tsx) và [`AthleteDetailPage.tsx`](../src/pages/AthleteDetailPage.tsx) — vẫn còn lớp `stone-*` cục bộ.

**Layout chung:** `--header-height` (globals), `page-container`, `card`, `section-heading` trong `globals.css`.

---

## 4. Cấu trúc mã nguồn frontend (chỗ quan trọng)

| Đường dẫn | Nội dung |
|-----------|----------|
| `src/pages/` | Route-level pages (Home, Gyms, GymDetail, Coaches, News, Marketplace, ProductDetail, Dashboard, Profile, legal, auth…). |
| `src/components/` | Component tái sử dụng: `ui/`, `gym-detail/`, `coach-flagship/`, `profile/`, `dashboard/`, gallery, admin… |
| `src/components/profile/` | Profile editor; [`profileSidebarNav.tsx`](../src/components/profile/profileSidebarNav.tsx) tách nav khỏi [`ProfileSidebar.tsx`](../src/components/profile/ProfileSidebar.tsx) (tránh ESLint fast-refresh warning). |
| `src/store/` | Redux slices + store |
| `src/services/` | API clients |
| `e2e/` | Playwright specs |

---

## 5. Tính năng & trang — ghi chú triển khai

| Khu vực | Ghi chú ngắn |
|---------|----------------|
| **Gym detail** [`GymDetailPage.tsx`](../src/pages/GymDetailPage.tsx) | Long-scroll: các section mount cùng lúc; điều hướng phụ + `scrollIntoView` + `IntersectionObserver` (highlight); class `gym-detail-section` + `scroll-margin-top` cho offset header/subnav; copy/sticky rail theo kế hoạch overhaul. |
| **Gyms list** [`Gyms.tsx`](../src/pages/Gyms.tsx) | Chuẩn hóa nhịp dọc, wrapper `.gyms-marketplace`, `CategoryStrip` grid header, `GymCard` flex + footer ghim trong lưới (theo plan layout). |
| **Marketplace PDP** | [`ProductDetailPage.tsx`](../src/pages/ProductDetailPage.tsx) + `marketplace.css` (shell 1280px, gallery sticky, section spacing). |
| **Coach / Athlete public** | Hai trang detail flagship: **không** nằm trong wave đồng bộ `gray` toàn cục (vẫn `stone` cục bộ). |
| **Dashboard** | Role-based: User / Athlete / Coach / Admin / Gym owner. |
| **Legal** | `pages/legal/*` + `LegalPageLayout`. |

**Dead code đã dọn (tham chiếu plan gym):** không còn import `GymStickyNav` / `GymSidebarCta` trong `src` (grep 2026-03-22).

---

## 6. Ngôn ngữ & nội dung UI

- **Tiếng Việt:** ưu tiên câu ngắn, giọng đời thường trên dashboard, onboarding, FAQ, mô tả tab profile (gallery…). Legal giữ nghĩa, có chỉnh từng đoạn cho dễ đọc.
- **SEO:** `react-helmet-async`; meta description có truncate nơi cần (pattern tương tự coach/PDP trên gym detail).

---

## 7. Backend — tóm tắt

Bản đầy đủ: **[`backend/docs/CODEBASE_STATUS.md`](../../backend/docs/CODEBASE_STATUS.md)** (cấu trúc `src/`, bảng route `/api/v1`, boot/cron/Redis).

| Hạng mục | Ghi chú |
|----------|---------|
| Runtime | Node, Express 5, TypeScript (`tsc` → `dist/`) |
| DB | PostgreSQL + TypeORM, migrations + seeds |
| API | Prefix `/api/v1` (+ `/sitemap.xml`, `/share`, health) |
| Infra | Redis (tùy chọn), Socket.io, Bull/cron, Supabase, email, upload |

Scripts: `backend/package.json` — `dev`, `build`, `start`, `migrate:*`, `test`, `lint`.

---

## 8. Chất lượng & kiểm thử (kỳ vọng khi phát hành)

| Kiểm tra | Kỳ vọng |
|-----------|---------|
| `frontend: npm run lint` | Pass (0 errors). |
| `frontend: npm run build` | Pass. |
| E2E prod | `npm run test:e2e:prod` — public routes; auth có thể skip nếu thiếu secret (xem workflow CI). |
| Lighthouse / a11y | Có script `lh:a11y`; contrast prod có thể cần theo dõi thêm (ghi trong backlog). |

CI: xem [`.github/workflows`](../../.github/workflows) (frontend E2E, env secrets).

---

## 9. Nợ kỹ thuật / việc tùy chọn tiếp theo

- Đồng bộ `stone` → `gray` trên **Coach detail** và **Athlete detail** nếu muốn một họ màu duy nhất toàn site.
- Tiếp tục rút `var(--mk-*)` sang utility/token gọn hơn theo từng route group (không bắt buộc một lần).
- Bundle / LCP: theo dõi số Lighthouse trong [UI_UX_AUDIT_BACKLOG.md](./UI_UX_AUDIT_BACKLOG.md).
- Cập nhật `frontend/README.md` từ template Vite mặc định sang hướng dẫn chạy project GYMERVIET (tùy ưu tiên).

---

## 10. Cách duy trì file này

1. Sau mỗi **milestone UI/architecture** lớn: sửa mục 3–5 và 9.  
2. Khi đổi **major dependency** (React, Vite, Tailwind): sửa mục 2.  
3. Khi **production URL** hoặc **flow deploy** đổi: sửa backlog + bảng smoke trong `UI_UX_AUDIT_BACKLOG.md`, có thể trích lại một dòng ở đây.
