# Yêu Cầu Review Code (Quality Assurance)

## Mục đích của Pull Request này là gì?
*(Mô tả ngắn gọn về tính năng, refactor hoặc bugs đã fix)*

- [ ] Tính năng mới (New Feature)
- [ ] Sửa lỗi (Bug Fix)
- [ ] Tái cấu trúc/Dọn dẹp mã (Refactor)
- [ ] Cập nhật tài liệu (Documentation)

## Kiểm tra Rủi ro & Regression Net (Bắt buộc)
*Hãy chắc chắn bạn đã rà soát các hạng mục nhạy cảm dưới đây để tránh Downtime:*

- [ ] Lệnh `npm run lint` và `npm run build` ở cả Frontend lẫn Backend hoàn thành không cảnh báo đỏ.
- [ ] Tính năng này **KHÔNG** làm gãy luồng Đăng nhập, Đăng ký hay Refresh Token (Auth Flows).
- [ ] Nếu có thay đổi **Database Schema**, đã đính kèm script Migration đi ngược lại (Rollback Path).
- [ ] Tính năng giữ được kích thước tải trang ổn định, **không** nhồi thêm cục thư viện nặng vào `Bundle Size` (Bundle Budget pass).
- [ ] Đã thêm **Unit Test** hoặc **Integration Test** bảo vệ logic mới thay đổi (Backend Jest).

## Kế hoạch Cứu viện (Rollback Plan)
*Nếu triển khai đoạn mã này lên gặp sự cố, ta lùi lại (Rollback) như thế nào?*

- *Ghi lý do hoặc gõ "Revert PR này là đủ":* ...
