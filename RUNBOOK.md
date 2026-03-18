# GYMERVIET Runbook Vận Hành (Ops/SRE) 📗

Cuốn cẩm nang ghi lại tất cả các **Quy Trình Triển Khai (Deployments)**, **Kiểm Soát Rủi Ro (Quality Control)**, và **Kịch Bản Ứng Phó Sự Cố (Incidents Response)**. Đây là phao cứu sinh cho dự án, không phụ thuộc vào trí nhớ cá nhân!

---

## 1. KHỞI ĐỘNG HỆ THỐNG CỤC BỘ (LOCAL DEV BOOT)
*Hạ tầng cốt lõi: Node 18+, DB PostgresQL, Redis.*

- Đảm bảo có `.env` đầy đủ cả hai bên Frontend/Backend.
- Mở **Terminal 1** (Database và Cache khởi chạy qua Docker/Native).
- Mở **Terminal 2** (Backend):
  ```bash
  cd backend
  npm install
  npm run migrate:run  # Bơm DB schema mới
  npm run dev          # Chạy server ở localhost:3001
  ```
- Mở **Terminal 3** (Frontend):
  ```bash
  cd frontend
  npm install
  npm run dev          # Chạy ứng dụng React ở localhost:5173
  ```

---

## 2. QUY TRÌNH DEPLOY LÊN STAGING/PRODUCTION
*Chỉ Deploy một khi Code đi qua CI Gate (Lint, Budget, Tests) trên nhánh main.*

### Các Bước Thực Hiện:
1. **Kiểm tra Env (Env Validation)**: Rà soát biến môi trường của nền tảng Hosting (Ví dụ: Supabase Keys, RDS URL, JWT Secrets). Không bao giờ thay đổi khóa bảo mật JWT khi đang vận hành nếu không cấp thiết.
2. **Kích hoạt Migration Guard (`Backend`)**: Chạy lệnh `npm run migrate:check`. Server backend sẽ bị block boot nếu DB không đồng bộ.
3. **Build Frontend Bundle (`Frontend`)**: Chạy `npm run build` để đảm bảo bundle chuẩn.
4. **Smoke Test Nhanh (Post-deployment)**: Sau khi hệ thống Online, truy cập ngay URL:
   - Thử Login bằng tài khoản user/admin.
   - Truy cập vào Profile, ProgramsPage, Coaches đảm bảo UI load mượt với Skeleton.
   - Kiểm tra tracking API Request ID trên Terminal Server.
   
---

## 3. CHECKLIST NGHIỆM THU MÃ NGUỒN (CODE REVIEW GATES)
Trước khi gộp code, bạn cần tích (checked) các hộp yêu cầu sau trong Github Pull Requests:
- **Zero Full-Page Reload**: Mọi hành vi cập nhật bình luận, profile phải gọi API và Sync State ẩn, KHÔNG được `window.location.reload()`.
- **UI Consistency**: Hạn chế gọi `window.confirm`, ưu tiên dùng `ConfirmModal`.
- **Stale Closures & Leak Memory**: Bất kì hook `useEffect` nào thêm Listners (`window.addEventListener` hoặc `socket.on`) BẮT BUỘC trả về hàm dọn dẹp (Cleanup `socket.off`).

---

## 4. KỊCH BẢN XỬ LÝ SỰ CỐ (INCIDENTS)

### A. Sự Cố Chết Xác Thực Đồng Loạt (Auth Outage / 401 Xoay Vòng)
- **Triệu chứng**: Toàn bộ User văng ra màn hình Đăng nhập do API `/refresh` lỗi hoặc Token Secret không ăn khớp.
- **Cách khắc phục**:
  1. Nếu Server DB và Redis không bị chậm trễ, nguyên do từ Secret: Báo Server đổi lại `JWT_SECRET` và Restart Container.
  2. Bị DDOS luồng login: Tăng `windowMs` trong middleware `express-rate-limit` lên cực lớn ngăn Server quá tải.
  
### B. Sự Cố Rơi Schema DB (Migration Out of Sync)
- **Triệu chứng**: Gỡ API 500 do thiếu cột cờ lưu trữ (`Internal Server Error` với Postgres Log "column not found").
- **Cách khắc phục**:
  1. Lock trạng thái Website thành Đang Bảo Trì (`Maintenance Mode`).
  2. Tại Backend, xem lại log của `migrationState` tracking.
  3. Mở khóa, hoàn nguyên code Frontend về bản commit cũ lúc DB còn tương thích.

### C. Hướng Dẫn Rollback Nhanh (Emergency Rollback Playbook)
- **Frontend**: Revert commit trên nhánh `main` và trigger Vercel/Netlify redeploy bản ổn định ngay lập tức.
- **Backend / Database**:
  1. Code lỗi không ảnh hưởng DB: Revert commit và khởi động lại app.
  2. DB Migration lỗi (Data loss/Schema mismatch): Sử dụng tính năng PITR (Point-in-Time Recovery) của dịch vụ PostgreSQL Cloud (như Supabase/AWS RDS) để Rollback Database về trạng thái 5 phút trước sự cố. Code backend bắt buộc phải revert theo schema. Mọi write operations trong thời điểm sự cố phải được query riêng lưu giữ nếu quan trọng.

