# Checklist QA thủ công (UI/UX)

Chạy sau mỗi **release / deploy** production. Đánh `[x]` khi đã kiểm tra. Ghi ngày và commit deploy ở cuối.

**Tham chiếu:** [UI_UX_AUDIT_BACKLOG.md](./UI_UX_AUDIT_BACKLOG.md) (luồng ưu tiên).

## Viewport

- [x] **Mobile** (~390px): không scroll ngang trên `/`, `/gyms`, `/login` — *2026-03-22: Lighthouse mobile + E2E prod trên các URL này*
- [ ] **Tablet** (~768px): layout không vỡ, CTA không che nội dung
- [ ] **Desktop** (≥1280px): header, footer, nội dung chính căn chỉnh

## Luồng công khai

- [x] `/` — hero + panel hồ sơ tải ổn, không console error nghiêm trọng — *smoke E2E prod 2026-03-22*
- [x] `/gyms` — danh sách + filter (nếu dùng) — *smoke E2E prod 2026-03-22*
- [x] `/gyms/:id` — chi tiết một gym — *2026-03-22: `e2e/gym-detail.spec.ts` trên prod (sau hydrate listing)*
- [ ] `/coaches`, `/coach/:slug` hoặc `/coaches/:id`
- [ ] `/athlete/:slug`
- [ ] `/login`, `/register` — form nhãn rõ, lỗi hiển thị đọc được
- [x] `/marketplace`, `/pricing`, `/news` — *smoke E2E prod 2026-03-22*

## Đăng nhập (tài khoản test)

- [ ] Sau login: redirect hợp lệ (`/dashboard`, `/onboarding`, `/gym-owner` tùy role)
- [ ] Bottom nav mobile (nếu có): nhãn đọc được, contrast chấp nhận được

## Bàn phím / A11y nhanh

- [ ] Tab từ đầu trang: focus ring thấy được trên link/nút chính
- [ ] Form đăng nhập: có thể điền và submit chỉ bằng bàn phím

---

**Lần kiểm tra gần nhất:** 2026-03-22 (một phần — smoke tự động + Lighthouse; chưa hoàn tất toàn bộ ô trên).  
**Deploy (commit/tag):** đối chiếu `8293bba` với bundle thực tế trên gymerviet.com
