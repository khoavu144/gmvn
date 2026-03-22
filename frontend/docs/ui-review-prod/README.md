# UI review — ảnh chụp từ production (gymerviet.com)

Ảnh dùng làm **baseline** khi chỉnh UI từng trang: so sánh trước/sau trong PR và cập nhật [UI_UX_PROGRESS_LOG.md](../UI_UX_PROGRESS_LOG.md) nếu cần.

## Cách tạo lại ảnh

Từ thư mục `frontend/`:

```bash
node scripts/capture-prod-screens.mjs
```

Hoặc cài Playwright browser lần đầu: `npx playwright install chromium`.

## Quy ước tên file

`{route-path}--{viewport}.png` — viewport: `mobile` (390×844), `desktop` (1280×900).

## Thứ tự sửa gợi ý

1. `/` Home  
2. `/gyms`  
3. `/login` (contrast / form)  
4. `/coaches`  
5. `/news`, `/marketplace`, `/pricing`  
6. Chi tiết gym / athlete (khi có URL cụ thể)

Khi làm việc với AI: đính kèm ảnh trang cần sửa + mô tả 1–3 vấn đề (spacing, typography, contrast, CTA).
