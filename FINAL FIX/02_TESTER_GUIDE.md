# GYMERVIET — HƯỚNG DẪN KIỂM THỬ (TESTER GUIDE)

> Dành cho: QA / Tester  
> Phương pháp: Black-box + Logic flow testing  
> Môi trường yêu cầu: Frontend chạy tại `localhost:5173`, Backend tại `localhost:3001`

---

## THIẾT LẬP TRƯỚC KHI TEST

### Tài khoản test cần tạo sẵn

| Role | Email | Password | Ghi chú |
|------|-------|----------|---------|
| Athlete | `athlete@test.com` | `test1234` | Có subscription active với trainer |
| Trainer | `trainer@test.com` | `test1234` | Có TrainerProfile đầy đủ |
| Gym Owner (Approved) | `gymowner@test.com` | `test1234` | `gym_owner_status = 'approved'`, có gym |
| Gym Owner (Pending) | `pending@test.com` | `test1234` | `gym_owner_status = 'pending_review'` |
| Admin | `admin@test.com` | `test1234` | `user_type = 'admin'` |
| Athlete không có subscription | `nopay@test.com` | `test1234` | Dùng để test điều kiện review |

### Dữ liệu mẫu cần có trong DB
- Ít nhất 1 GymCenter với `is_verified = true`, có ít nhất 1 GymBranch
- Gym đó có ít nhất 1 GymTrainerLink với trainer@test.com (`status = 'active'`)
- athlete@test.com có Subscription active với trainer@test.com

---

## NHÓM TEST 1 — ĐĂNG KÝ & ĐĂNG NHẬP

### TC-001 · Đăng ký tài khoản Gymer (Athlete)
**Luồng:** `/ → /register → /dashboard`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Truy cập `/register` | Form hiển thị với 4 loại tài khoản |
| 2 | Chọn "Cá nhân tập luyện (Gymer)" | Option `athlete` được chọn |
| 3 | Điền: Tên, Email, Password (>8 ký tự), Confirm Password | Không có lỗi validation |
| 4 | Nhập Password ≠ ConfirmPassword → Submit | Hiển thị lỗi "Mật khẩu xác nhận không khớp" |
| 5 | Sửa để Password = ConfirmPassword → Submit | Redirect đến `/dashboard` |
| 6 | Kiểm tra Header | Hiển thị tên user, badge "VĐV" |
| 7 | Đăng ký lại với email đã tồn tại | Hiển thị lỗi "Email already registered" |

**⚠️ Bug đã biết:** Nếu chưa fix BUG-001, bước đăng ký với `gym_owner` sẽ thất bại.

---

### TC-002 · Đăng ký tài khoản Gym Owner
**Luồng:** `/register → /gym-owner/register → Pending State`

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | `/register` → Chọn "Chủ phòng tập (Gym Owner)" | Option `gym_owner` được chọn |
| 2 | Điền đầy đủ thông tin → Submit | Đăng ký thành công |
| 3 | Kiểm tra redirect | Chuyển đến `/gym-owner/register` (form đăng ký gym) |
| 4 | Điền thông tin gym: Tên gym, Địa chỉ (required fields) | Không có lỗi |
| 5 | Submit form đăng ký gym | Hiển thị màn hình "Đang chờ duyệt" |
| 6 | Reload trang | Vẫn hiển thị màn hình chờ duyệt |
| 7 | Thử truy cập `/gym-owner` | Bị redirect về `/gym-owner/register` |

**❗ Test quan trọng:** Sau bước 5, kiểm tra DB — `users.gym_owner_status` phải là `'pending_review'`.

---

### TC-003 · Đăng nhập và logout
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập với email/password đúng | Redirect dashboard |
| 2 | Đăng nhập với password sai | Lỗi "Invalid email or password" |
| 3 | Đăng nhập với email không tồn tại | Lỗi "Invalid email or password" (không tiết lộ email có tồn tại không) |
| 4 | Đăng nhập → Reload trang | Vẫn logged in (token persist) |
| 5 | Bấm "Đăng xuất" | Redirect `/login`, localStorage cleared |
| 6 | Sau logout, truy cập `/dashboard` | Redirect `/login` |
| 7 | Sau logout, bấm Back button | Vẫn không truy cập được dashboard |

---

## NHÓM TEST 2 — PHÂN QUYỀN & PROTECTED ROUTES

### TC-004 · Kiểm tra tất cả Protected Routes
| Route | Vai trò được phép | Test không có auth | Test sai role |
|-------|-------------------|-------------------|--------------|
| `/dashboard` | Tất cả logged-in | → `/login` | N/A |
| `/profile` | Tất cả logged-in | → `/login` | N/A |
| `/programs` | athlete, trainer | → `/login` (nếu chưa login) | → `/dashboard` (nếu sai role) |
| `/workouts` | athlete only | → `/login` | → `/dashboard` (trainer không vào được) |
| `/gym-owner` | gym_owner + approved | → `/login` | → `/dashboard` (athlete không vào được) |
| `/gym-owner/register` | gym_owner (chưa cần approved) | → `/login` | → `/dashboard` |

**Test cho gym_owner với các trạng thái khác nhau:**

| Trạng thái `gym_owner_status` | Truy cập `/gym-owner` | Truy cập `/gym-owner/register` |
|-------------------------------|----------------------|-------------------------------|
| `null` (chưa đăng ký gym) | Redirect → `/gym-owner/register` | Hiển thị form đăng ký |
| `pending_review` | Redirect → `/gym-owner/register` | Hiển thị màn hình chờ duyệt |
| `approved` | Hiển thị Dashboard | Redirect → `/gym-owner` |
| `rejected` | Redirect → `/gym-owner/register` | Hiển thị màn hình từ chối |

---

### TC-005 · Gym Owner - Dashboard redirect từ `/dashboard`
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập với gymowner@test.com | Redirect → `/gym-owner` (không phải `/dashboard`) |
| 2 | Truy cập trực tiếp `/dashboard` | Redirect → `/gym-owner` |
| 3 | Check Header nav của gym_owner | Hiển thị "Quản lý Gym" thay vì "Dashboard" |

---

## NHÓM TEST 3 — GYM LISTING & DETAIL

### TC-006 · Trang danh sách Gym (`/gyms`)
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Truy cập `/gyms` | Danh sách gym hiển thị (chỉ `is_verified = true`) |
| 2 | Tìm kiếm bằng tên gym | Kết quả filter đúng |
| 3 | Tìm kiếm bằng địa chỉ | Kết quả filter đúng |
| 4 | Filter theo thành phố | Dropdown chỉ hiện các city có trong data |
| 5 | Kết hợp search + filter city | Kết quả giao giữa hai filter |
| 6 | Search không có kết quả | Hiển thị state "Không tìm thấy phòng tập" |
| 7 | Gym với `is_verified = false` | KHÔNG hiển thị trong danh sách |
| 8 | Bấm vào GymCard | Navigate đến `/gyms/:id` |

---

### TC-007 · Trang chi tiết Gym (`/gyms/:id`)
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Truy cập `/gyms/valid-gym-id` | Trang gym detail hiển thị đúng |
| 2 | Truy cập `/gyms/invalid-id` | Hiển thị "Không tìm thấy Gym" |
| 3 | Gym có nhiều chi nhánh | Hiển thị branch tabs |
| 4 | Bấm tab chi nhánh khác | Nội dung bên dưới cập nhật (loading state → new data) |
| 5 | Chi nhánh có gallery | Grid ảnh hiển thị |
| 6 | Chi nhánh có amenities | Danh sách tiện ích hiển thị |
| 7 | Chi nhánh có pricing | Bảng giá hiển thị |
| 8 | Gym có social links | Links hiển thị (text, không phải icon) |
| 9 | Phần HLV tại gym | Hiển thị danh sách trainer active tại gym |
| 10 | Bấm vào trainer card | Navigate đến `/trainers/:id` |
| 11 | Trang gym detail tăng view count | Refresh trang → `view_count` tăng 1 (kiểm tra DB) |

---

## NHÓM TEST 4 — HỆ THỐNG REVIEW

### TC-008 · Điều kiện viết review (Logic phức tạp nhất)

**Case A — User không đăng nhập:**
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Vào trang gym detail khi chưa login | Form review KHÔNG hiển thị |
| 2 | Nút "Đánh giá" có tooltip | "Đăng nhập để đánh giá" |

**Case B — User đăng nhập nhưng không có subscription với trainer tại gym:**
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập `nopay@test.com` → Vào gym detail | Form review KHÔNG hiển thị |
| 2 | Thấy thông báo điều kiện | "Cần subscription với HLV tại gym này" |
| 3 | Thử gọi API trực tiếp `POST /api/v1/gyms/:id/reviews` | HTTP 403 với message rõ ràng |

**Case C — User đủ điều kiện (có subscription active với trainer tại gym):**
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập `athlete@test.com` → Vào gym detail | Form review HIỂN THỊ |
| 2 | Chọn rating 4 sao → Viết comment → Submit | "Đánh giá đã được gửi!" |
| 3 | Review xuất hiện trong danh sách | Review hiển thị với tên user, rating, comment |
| 4 | Submit review thêm lần nữa cho cùng branch | Lỗi "Bạn đã đánh giá chi nhánh này rồi" |
| 5 | Rating phải từ 1-5 | Rating = 0 hoặc = 6 bị từ chối bởi backend |

---

### TC-009 · Kiểm tra Route `/check-review/:gymId`
**⚠️ Đây là test cho BUG-002 — có thể fail nếu chưa fix**

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập athlete@test.com | Có token |
| 2 | GET `/api/v1/gyms/check-review/:gymId` với token | HTTP 200, `{ canReview: true/false }` |
| 3 | GET `/api/v1/gyms/check-review/:gymId` không có token | HTTP 401 |
| **Bug check** | Response từ bước 2 có phải từ `getGymCenter` không? | Nếu response là `{ success: true, gym: {...} }` → BUG-002 chưa được fix |

---

## NHÓM TEST 5 — GYM OWNER DASHBOARD

### TC-010 · Gym Owner Dashboard — Tab Tổng quan
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập gymowner@test.com → `/gym-owner` | Dashboard hiển thị |
| 2 | Kiểm tra stats cards | 4 cards hiển thị số liệu thực tế (không phải hardcoded) |
| 3 | "Tổng lượt xem" | Số lượt xem thực từ DB |
| 4 | "HLV liên kết" | Số trainer active, không phải số 0 cứng |
| **Bug check** | "Đánh giá" card | Nếu hiển thị "4.8" cho gym chưa có review → BUG-005 chưa fix |

---

### TC-011 · Gym Owner Dashboard — Tab Chi nhánh
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Bấm tab "Chi nhánh" | Danh sách chi nhánh hiển thị |
| 2 | Bấm "Cập nhật" trên một chi nhánh | Form chỉnh sửa mở ra / bước này test xem nút có handler không |
| 3 | Sửa địa chỉ → Save | Thay đổi lưu vào DB |
| 4 | Bấm "Thêm chi nhánh mới" | Form tạo branch mới hiển thị |
| **Bug check** | Bước 2-4 | Nếu bấm nút không có phản ứng → BUG-007 chưa fix |

---

### TC-012 · Gym Owner Dashboard — Tab Coach liên kết
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Bấm tab "Coach liên kết" | GymTrainerManager render |
| 2 | Tab chi nhánh hiển thị (nếu nhiều chi nhánh) | Có thể switch giữa branches |
| 3 | Danh sách trainer hiện tại | Hiển thị trainer đang active, pending |
| 4 | Search trainer theo tên | Kết quả tìm kiếm hiển thị |
| 5 | Search trainer theo email | Kết quả tìm kiếm hiển thị |
| 6 | Bấm "Mời" | Hỏi vị trí (role input) |
| 7 | Xác nhận mời | `GymTrainerLink` tạo với `status: 'pending'` |
| 8 | Mời trainer đã active | Lỗi "Trainer already linked" |
| 9 | Bấm "Ngừng hợp tác" | Confirm dialog → link status → 'removed' |
| **Bug check** | Bước 3 | Nếu list rỗng dù có trainer → BUG-004 chưa fix |
| **Bug check** | Bước 6 | Nếu hiện `window.prompt` browser dialog → BUG-013 chưa fix |

---

### TC-013 · Gym Owner Dashboard — Tab Cài đặt
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Bấm tab "Cài đặt" | Form hiển thị với dữ liệu hiện tại |
| 2 | Sửa tên gym → Bấm "Lưu thay đổi" | Tên được cập nhật trong DB và UI |
| 3 | Reload trang | Tên mới vẫn hiển thị |
| **Bug check** | Bước 2 | Nếu bấm Save không có gì xảy ra → BUG-006 chưa fix |

---

## NHÓM TEST 6 — TRAINER FLOW

### TC-014 · Trainer nhận/từ chối lời mời từ Gym
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập trainer@test.com | Dashboard trainer |
| 2 | Tìm section "Lời mời từ Gym" | **Hiện tại: có thể chưa có UI** |
| 3 | Nếu có pending invitation | Hiển thị tên gym, chi nhánh, vị trí |
| 4 | Bấm "Chấp nhận" | `GymTrainerLink.status → 'active'` |
| 5 | Bấm "Từ chối" | `GymTrainerLink.status → 'removed'` |
| 6 | Sau khi accept, vào trang TrainerDetailPage | Hiển thị badge "Hoạt động tại [Gym Name]" |

---

### TC-015 · TrainerDetailPage — Gym badges
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Vào `/trainers/:trainerId` của trainer đang active tại gym | Section "Hoạt động tại" hiển thị |
| 2 | Gym badge hiển thị | Tên gym, role, link sang gym detail |
| 3 | Bấm gym badge | Navigate đến `/gyms/:gymId` |
| 4 | Trainer không thuộc gym nào | Section gym badges không hiển thị |

---

## NHÓM TEST 7 — ADMIN PANEL

### TC-016 · Admin duyệt Gym
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Đăng nhập admin@test.com | Admin dashboard |
| 2 | GET `/api/v1/admin/gyms/pending` | Danh sách gym `is_verified = false` |
| 3 | POST `/api/v1/admin/gyms/:id/approve` | `is_verified → true` |
| 4 | Sau approve, gym xuất hiện trên `/gyms` | Có thể tìm thấy trong listing |
| 5 | POST `/api/v1/admin/gyms/:id/reject` | `is_active → false` |
| 6 | Sau reject, gym không xuất hiện public | `/gyms` không hiển thị gym bị reject |
| 7 | PUT `/api/v1/admin/gyms/:id/suspend` | Gym bị khóa |

---

### TC-017 · Admin quản lý Reviews
| Bước | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | PATCH `/api/v1/admin/gyms/reviews/:id/toggle` | `is_visible` flip |
| 2 | Review bị ẩn | Không hiển thị trên public gym detail page |
| 3 | Admin xóa review | DELETE `/api/v1/gyms/:gymId/reviews/:id` với admin token → thành công |
| 4 | User thường xóa review của người khác | HTTP 403 |

---

## NHÓM TEST 8 — LUỒNG TÍCH HỢP (End-to-End)

### TC-018 · Luồng đầy đủ: Gym Owner → HLV → Athlete Review

```
1. Admin tạo sẵn Trainer account với TrainerProfile đầy đủ
2. Gym Owner đăng ký → Admin approve
3. Gym Owner vào dashboard → Tìm và mời Trainer
4. Trainer đăng nhập → Chấp nhận lời mời
5. Athlete tạo Subscription với Trainer đó
6. Athlete vào gym detail page → Form review hiển thị
7. Athlete submit review → Review xuất hiện trong danh sách
8. Gym Owner xem stats → total_reviews tăng
```

Kiểm tra toàn bộ chuỗi này từ đầu đến cuối.

---

### TC-019 · Luồng: Rate limiting và bảo mật API

| Test | Thao tác | Kết quả mong đợi |
|------|----------|-----------------|
| 1 | Gửi > 100 requests/phút đến `/api/v1` | HTTP 429 Too Many Requests |
| 2 | Gọi protected route không có token | HTTP 401 |
| 3 | Gọi protected route với token hết hạn | HTTP 401 "Invalid or expired token" |
| 4 | Gym owner truy cập gym của người khác | HTTP 403 "Gym not found or unauthorized" |
| 5 | SQL injection trong search param | Không crash, không leak data |
| 6 | XSS trong gym name | HTML entities được escape |

---

## NHÓM TEST 9 — RESPONSIVE & PERFORMANCE

### TC-020 · Mobile Responsive
Kiểm tra các breakpoint: `375px` (iPhone SE), `768px` (iPad), `1280px` (Desktop)

| Trang | Mobile (375px) | Tablet (768px) |
|-------|---------------|---------------|
| `/gyms` | 1 cột, search full width | 2 cột |
| `/gyms/:id` | Branch tabs scrollable horizontal | Full tabs |
| `/gym-owner` | Sidebar collapse thành nav | Sidebar full |
| `/register` | Form full width | Form centered |
| Header | Hamburger menu | Full nav |

---

## DANH SÁCH KIỂM TRA NHANH (Smoke Test)

Chạy danh sách này sau mỗi lần deploy để đảm bảo không có regressions:

```
[ ] GET /api/v1/health → 200 OK
[ ] POST /api/v1/auth/register (athlete) → 201
[ ] POST /api/v1/auth/login → 200 với tokens
[ ] GET /api/v1/gyms → 200 với array
[ ] GET /api/v1/gyms/:validId → 200 với gym data
[ ] GET /api/v1/trainers → 200 (existing endpoint)
[ ] Homepage / load thành công
[ ] /gyms load thành công
[ ] /trainers load thành công
[ ] /login form submit thành công
[ ] Logout hoạt động
```

---

## GHI CHÚ CHO TESTER

1. **Về BUG-002 (Route conflict):** Test `GET /api/v1/gyms/check-review/:id` trực tiếp bằng Postman/Insomnia để kiểm tra trước khi test trên UI.

2. **Về BUG-003:** Sau khi đăng ký gym và submit form gym, làm mới trang và kiểm tra trong DevTools → Application → LocalStorage xem token còn hay không, và `/auth/me` response có trả về `gym_owner_status` không.

3. **Dùng DevTools Network tab:** Theo dõi các request API khi thao tác để phát hiện lỗi 4xx/5xx nhanh hơn.

4. **Cách tạo dữ liệu test nhanh:** Backend có `src/seeds/generateDemoData.ts` — có thể chạy để sinh dữ liệu mẫu cho gym center.

5. **Kiểm tra DB trực tiếp:** Một số test cần verify dữ liệu trong Supabase/PostgreSQL để confirm dữ liệu được lưu đúng (đặc biệt `gym_owner_status`, `GymTrainerLink.status`, review counts).
