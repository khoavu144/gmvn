# UI/UX — nhật ký tiến độ (timeline)

File này ghi **sự kiện ngắn** theo thời gian. Chi tiết baseline, audit và checklist nằm ở [UI_UX_AUDIT_BACKLOG.md](./UI_UX_AUDIT_BACKLOG.md).  
**Quy ước:** mỗi lần deploy prod, chạy Lighthouse/E2E đáng kể, merge PR refactor P2, hoặc đo LCP/CLS — thêm **một hàng** mới ở **đầu bảng** (mới nhất trên cùng).

| Date (VN) | Event | Detail | Owner |
|-----------|--------|--------|--------|
| 2026-03-22 | UI wave + tokens | Quy trình per-page: checklist `UI_PAGE_REVIEW_CHECKLIST.md`; thay `var(--mk-*)` → stone/amber/emerald trên Gyms, Login, Coaches, NewsPage, NewsDetailPage, PricingPage; Login title GYMERVIET; `npm run lint` + `npm run build` | — |
| 2026-03-22 | UI Home | Desktop polish theo `ui-review-prod/home--desktop.png`: hero `items-start`, panel hồ sơ shadow/ring, thay `--mk-*` → stone trên Home, CTA bar căn giữa + nút Coach/Gym min-width | — |
| 2026-03-22 | refactor E | Q9 ProfileCV (bỏ FadeSection + IO); tách GymSimilarSection + GymMapSection; GymZonesSection bớt `--mk-*` | — |
| 2026-03-22 | E2E | `e2e/gym-detail.spec.ts`: đợi hydrate link `/gyms/…` rồi mở chi tiết; prod **pass**, local preview skip nếu không có venue | — |
| 2026-03-22 | ESLint | Phase C: `npm run lint` — 0 errors, 0 warnings (xác nhận lại) | — |
| 2026-03-22 | perf | Đo LCP/CLS prod (Lighthouse mobile): `/` 5.06s / CLS 0.154; `/gyms` 4.79s / 0; `/login` 4.80s / 0 — điền Phase D | — |
| 2026-03-22 | verify prod | `test:e2e:prod` **8+1** (gym-detail pass trên prod); Lighthouse mobile + LCP/CLS; contrast prod vẫn fail — chờ deploy bundle | — |
| 2026-03-22 | perf | Phase D: thêm bảng template LCP/CLS trong UI_UX_AUDIT_BACKLOG.md; số prod ghi khi đo xong (Lighthouse / DevTools) | — |
| 2026-03-22 | refactor P2 | Q9: bỏ FadeIn + IntersectionObserver trên gym-detail sections (Facilities, Pricing, Reviews, Zones, Trainers) và khối overview/similar/map trong GymDetailPage.tsx | — |
| 2026-03-22 | CI | `.github/workflows/frontend-e2e.yml`: truyền `secrets.E2E_LOGIN_EMAIL` / `secrets.E2E_LOGIN_PASSWORD` → env; không có secret thì auth spec vẫn skip | — |
| 2026-03-22 | verify prod | `npm run test:e2e:prod`: 7 passed, 1 skipped (auth). Lighthouse mobile: `/` 66/95, `/gyms` 70/96, `/login` 71/94; `color-contrast` vẫn fail trên prod | — |
| 2026-03-22 | docs | Khởi tạo PROGRESS_LOG + MANUAL_UX_CHECKLIST; backlog thêm mục liên kết nhật ký | — |
