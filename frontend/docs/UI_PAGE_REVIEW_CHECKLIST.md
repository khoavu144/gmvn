# Checklist — review UI + quét code theo từng trang

Dùng cho mỗi route trong [App.tsx](../src/App.tsx). Không thay thế [UI_UX_PROGRESS_LOG.md](./UI_UX_PROGRESS_LOG.md) — file đó chỉ ghi mốc thời gian ngắn.

---

## Metadata (copy vào PR hoặc issue)

| Field | Value |
|--------|--------|
| **URL** | `https://gymerviet.com/...` |
| **Route code** | `frontend/src/pages/....tsx` |
| **Ảnh baseline** | `docs/ui-review-prod/{name}--desktop.png`, `--mobile.png` |
| **PR / branch** | |

---

## A — Phân tích (từ ảnh / prod)

- [ ] **Layout:** grid/flex, container (`marketplace-container` vs riêng), hero, section spacing, sticky CTA
- [ ] **Typography:** một H1, kicker, độ rộng dòng (`max-w-*` / `marketplace-lead`)
- [ ] **Nội dung:** copy, CTA, empty/loading/error
- [ ] **A11y:** contrast (xám/nền), focus ring, không lồng `<main>` sai ([MainLayout](../src/components/MainLayout.tsx) đã có `<main>`)
- [ ] **Perf (gợi ý):** ảnh LCP, lazy nặng

**Vấn đề ghi tại đây (3–7 bullet, có vị trí trên màn hình):**

1. 
2. 
3. 

---

## B — Đề xuất sửa

| # | Vấn đề | Hành động (file / class / copy) |
|---|--------|----------------------------------|
| 1 | | |
| 2 | | |

Ưu tiên sửa **CSS/token chung** ([index.css](../src/index.css), [globals.css](../src/styles/globals.css)) nếu ảnh hưởng nhiều trang.

---

## C — Quét code (trước khi merge)

Chạy trong thư mục `frontend/`:

```bash
npm run lint
npm run build
# Nếu đụng route đã có spec:
npm run test:e2e
# hoặc
npm run test:e2e:prod
```

- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — thành công
- [ ] E2E (nếu có route trong [e2e/](../e2e/))
- [ ] File vừa sửa: import/state không dùng, nhánh chết
- [ ] `rg 'var\\(--mk-' src/pages/<Page>.tsx` — giảm dần về `stone`/`gray` khi chỉnh UI

**Ghi chú kết quả:**

---

## Tạo / cập nhật ảnh baseline

```bash
cd frontend && npm run screenshots:prod
```

Hoặc chỉ một URL: chỉnh [scripts/capture-prod-screens.mjs](../scripts/capture-prod-screens.mjs) tạm thời.
