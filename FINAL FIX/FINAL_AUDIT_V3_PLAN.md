# KẾ HOẠCH TỔNG KIỂM TRA LẦN CUỐI CÙNG (FINAL AUDIT V3)

> **Mục tiêu:** Đây là giai đoạn kiểm duyệt cuối cùng trước khi đóng băng (freeze) và phát hành chính thức 100% (Production Ready) nền tảng GYMERVIET.

Dưới đây là phương pháp và danh sách kiểm tra (Checklist) được rút ra sau khi toàn bộ mã nguồn đã pass (vượt qua) các bài test tĩnh (TypeScript zero errors) và test luồng tự động (Backend E2E Scripts).

---

## 1. TÌNH TRẠNG HIỆN TẠI ĐÃ ĐƯỢC CHỨNG MINH 
1. **Kiểm tra cú pháp & kiểu (Linting/Type-check)**: Đã vượt qua `tsc --noEmit` cho cả Frontend & Backend. Không còn lỗi undefined, missing field, hay xung đột import.
2. **Đồng bộ cơ sở dữ liệu (Database Schema)**: Các thực thể mới (`GymCenter`, `GymBranch`, `GymReview`, `GymTrainerLink`, `Program`, `Subscription`) đã hoạt động trơn tru với nhau.
3. **Phân quyền và Bảo mật (RBAC & Logic)**:
    - ✅ Lỗi xung đột API `BUG-002` (check-review) đã được sửa.
    - ✅ Lỗi điều kiện tính năng (Athlete phải mua Program thì mới được Review) đã pass bài test tự động.
    - ✅ Lỗi chuyển hướng bảng điều khiển Gym Owner chưa được duyệt (Pending State) đã được khóa an toàn.
4. **Nhận diện thương hiệu (Terminology Migration)**: Đã hoàn tất đổi `Trainer` -> `Coach` ở mặt giao diện.

---

## 2. KẾ HOẠCH AUDIT THỦ CÔNG (MANUAL AUDIT V3)

Vui lòng chuẩn bị file `gymerviet-final-v3.zip` và tiến hành các thao tác kiểm tra bằng tay sau đây trên một môi trường mới hoàn toàn (Localhost hoặc Staging):

### STEP 1: Khởi tạo & Dữ liệu
- [ ] Xóa DB cũ, run lại các migration & `npm run generate-demo`.
- [ ] Login account `khoa.vnd92@gmail.com` -> Bảng điều khiển Admin phải hiển thị được tất cả các hệ thống phòng tập và đánh giá.
- [ ] Login account `gymowner@test.com` và kiểm tra xem có thấy được tab Chi nhánh, Quản lý Coach, Bảng thống kê hay không.

### STEP 2: UX / Luồng Đánh giá Gym (Luồng phức tạp nhất)
- [ ] Login account `nopay@test.com` (Đã đăng ký nhưng chưa thanh toán cho Coach tại Gym). Bấm vào chi tiết Gym -> Phải thấy thông báo từ chối quyền đánh giá.
- [ ] Login account `athlete@test.com` (Người dùng có mua khóa học của Coach tại Gym). Bấm vào chi tiết Gym -> Form đánh giá hiện ra. Điền thử và xem danh sách cập nhật ngay lập tức. Tính trung bình số sao có bị lệch không.

### STEP 3: Gym Owner Dashboard (Quản lý phòng tập)
- [ ] Ở tab **Chi nhánh**, sửa một số thông tin, tải lên thư viện ảnh, thêm dụng cụ tiện ích (Amenities/Equipment) -> Lưu và chuyển tab xem dữ liệu có bị xoá mất (data memory leak) không.
- [ ] Quản lý **Coach liên kết**: Mời một Coach thông qua email (ví dụ `coach.hoang@demo.gymerviet.vn`).
- [ ] Login vào account Coach -> Kiểm tra dashboard có nhận được lời mời hay không. Chấp nhận lời mời -> Trở lại trang hồ sơ của Coach (`/coach/...`) -> Phải thấy Badge phòng Gym hiện ra.

### STEP 4: Giao diện và Thiết bị di động (UI Responsive)
- [ ] Thay đổi kích thước trình duyệt thành Mobile/Tablet và kiểm tra **Headers, Footers, Danh sách thẻ Gyms, Branches, Coaches**.
- [ ] Test luồng Đăng ký (Register) với tuỳ chọn **Gym Owner** -> Chuyển hướng có mượt mà sang form Tạo Gym hay không.

---

## 3. PHƯƠNG ÁN DỰ PHÒNG XỬ LÝ NẾU CÓ LỖI
Trong trường hợp quá trình Audit V3 bắt được các lỗi cạnh (Edge Case Bugs):
1. **Lỗi liên quan đến Token/Auth**: Xóa toàn bộ LocalStorage ở trình duyệt và thử lại. Đảm bảo cấu hình JWT Secret trong tệp `.env` đồng nhất.
2. **Lỗi Cache Image/CSS cũ**: Hard-refresh bằng `Ctrl + Shift + R` (hoặc `Cmd + Shift + R` trên Mac).
3. **Lỗi mất dữ liệu khi save form**: Kiểm tra lại Network tab trong DevTools xem Payload gửi đi có thiếu tham số (field) bắt buộc nào theo yêu cầu của Zod schema / Class Validator không.

---
**Kết luận:** Nền tảng đã cực kỳ ổn định. Bạn đã có thể tự tin duyệt và phát hành bản Beta!
