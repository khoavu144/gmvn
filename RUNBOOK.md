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
   - **LƯU Ý BẮT BUỘC:** Phải cấu hình biến môi trường `VITE_API_URL` (ví dụ: `https://api.gymerviet.com/api/v1`) trên Hosting Platform (Vercel/Netlify/Docker) **TRƯỚC** khi chạy lệnh build. Nếu thiếu, application sẽ tự fallback về same-origin. Chấm dứt tình trạng trỏ nhầm về localhost trên Online.
4. **Smoke Test Nhanh (Post-deployment)**: Sau khi hệ thống Online, truy cập ngay URL:
   - Thử Login bằng tài khoản user/admin.
   - Truy cập vào Profile, ProgramsPage, Coaches đảm bảo UI load mượt với Skeleton.
   - Kiểm tra tracking API Request ID trên Terminal Server.
5. **Readiness Gate (`Backend`)**: Chỉ coi deployment thành công nếu:
   ```bash
   curl -fsS https://api.gymerviet.com/api/v1/health/live
   curl -fsS https://api.gymerviet.com/api/v1/health/ready
   curl -fsS https://api.gymerviet.com/api/v1/health/deps
   ```
   - `/live`: process sống
   - `/ready`: DB, session store, billing config, mail config đủ điều kiện nhận traffic
   - `/deps`: ảnh chụp chi tiết dependency cho Ops/Admin
6. **Billing Gate (`Backend`)**:
   - Kiểm tra `billing_enabled=true` trong `app_settings`
   - Tạo thử checkout intent ở staging
   - Xác nhận webhook idempotent: replay cùng `transaction_id` không được tạo subscription trùng
7. **Mail Gate (`Backend`)**:
   - Kiểm tra email verify/reset tạo bản ghi trong `email_outbox`
   - Chạy:
     ```bash
     cd backend
     npm run emails:process
     ```
   - Xác nhận trạng thái outbox chuyển `pending/failed -> sent` hoặc có `last_error` rõ ràng

### Preflight Checklist Bắt Buộc Cho Production
- `NODE_ENV=production`
- `RUN_SEED=false`
- `ALLOWED_ORIGINS` được cấu hình explicit, không wildcard
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` đầy đủ
- Có ít nhất 1 cơ chế xác thực SePay webhook:
  - `SEPAY_WEBHOOK_SECRET` (legacy), hoặc
  - `SEPAY_WEBHOOK_TOKEN` (khuyến nghị, dùng token trong webhook URL)
  - Nếu dùng API Key mode từ SePay, backend chấp nhận `Authorization: Apikey <token>` (hoặc `Bearer <token>`)
- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` hợp lệ
- DNS/mail đã hoàn tất: `AAAA`, `MX`, `SPF`, `DKIM`, `DMARC`, `DNSSEC`

### Thứ Tự Deploy Chuẩn
1. Backup snapshot hoặc xác nhận PITR sẵn sàng
2. Deploy backend code mới
3. Chạy `npm run migrate:run`
4. Chạy `npm run migrate:check`
5. Chạy health checks `/live`, `/ready`, `/deps`
6. Deploy frontend
7. Kiểm tra `robots.txt`, `sitemap.xml`, `security.txt`, canonical host
8. Chạy smoke desktop/mobile
9. Test nhanh:
   - register
   - verify email
   - login
   - refresh
   - logout
   - pricing -> checkout intent
   - webhook test / replay test
   
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
  1. Kiểm tra `/api/v1/health/ready`:
     - nếu `database=down`: xử lý DB trước
     - nếu `session_store=down`: không nhận traffic auth/billing
     - nếu `redis=degraded` nhưng `session_store=up`: auth vẫn phải chạy vì Postgres là source of truth
  2. Kiểm tra bảng `auth_refresh_sessions`:
     - session có được tạo không
     - status có bị `revoked/expired` bất thường không
  3. Nếu nghi ngờ secret sai: đồng bộ `JWT_SECRET`, `JWT_REFRESH_SECRET`, restart backend, không xoay secret giữa chừng nếu chưa có kế hoạch revoke toàn bộ session
  4. Bị DDOS luồng login: siết `express-rate-limit`, chặn upstream/CDN và theo dõi 401/429 spike

### B. Sự Cố Rơi Schema DB (Migration Out of Sync)
- **Triệu chứng**: Gỡ API 500 do thiếu cột cờ lưu trữ (`Internal Server Error` với Postgres Log "column not found").
- **Cách khắc phục**:
  1. Lock trạng thái Website thành Đang Bảo Trì (`Maintenance Mode`).
  2. Tại Backend, xem lại log của `migrationState` tracking.
  3. Mở khóa, hoàn nguyên code Frontend về bản commit cũ lúc DB còn tương thích.

### C. Sự Cố Mail Verify/Reset Không Gửi Được
- **Triệu chứng**:
  - user đăng ký xong nhưng không nhận mail
  - forgot password trả thành công nhưng mail không đến
  - `/api/v1/health/ready` báo `mail=down`
- **Cách khắc phục**:
  1. Kiểm tra biến môi trường SMTP trên backend host
  2. Kiểm tra `email_outbox`:
     - `status`
     - `attempt_count`
     - `last_error`
  3. Chạy manual worker:
     ```bash
     cd backend
     npm run emails:process
     ```
  4. Nếu lỗi do DNS/mail provider:
     - kiểm tra `MX`, `SPF`, `DKIM`, `DMARC`
     - kiểm tra mailbox nhận report `dmarc@...`
  5. Không xóa outbox record lỗi thủ công trước khi lưu lại `last_error`

### D. Sự Cố Webhook Payment / Subscription Sai Lệch
- **Triệu chứng**:
  - user đã chuyển khoản nhưng chưa kích hoạt gói
  - replay webhook tạo dữ liệu lặp
  - `/api/v1/health/deps` báo `billing=down`
- **Cách khắc phục**:
  1. Kiểm tra auth webhook:
     - Nếu dùng secret: `SEPAY_WEBHOOK_SECRET` phải là token (không phải URL)
     - Nếu dùng URL token: `SEPAY_WEBHOOK_TOKEN` phải khớp query `?token=...` trong callback URL đã khai trên SePay
     - Nếu SePay gửi header `Authorization: Apikey ...`, token phải khớp env ở backend
  2. Tìm theo `transfer_content` trong `platform_checkout_intents`
  3. Tìm theo `provider_transaction_id` trong:
     - `platform_checkout_intents`
     - `platform_subscriptions`
  4. Chạy reconciliation:
     ```bash
     cd backend
     npm run billing:reconcile
     ```
  5. Nếu webhook replay:
     - không tạo subscription thủ công nếu transaction đã có
     - chỉ sửa khi xác nhận thiếu liên kết `intent -> subscription`
  6. Nếu amount mismatch:
     - giữ intent ở `failed`
     - đối soát thủ công với giao dịch ngân hàng trước khi can thiệp

### E. Sự Cố DNS / Mail / Domain Security Rollback
- **Triệu chứng**:
  - site lỗi sau khi bật DNSSEC
  - mail fail sau khi sửa TXT
  - Web Check / SSL Labs tụt mạnh
- **Cách khắc phục**:
  1. Nếu vừa bật DNSSEC và site ra `SERVFAIL`:
     - tắt `DNSSEC` hoặc gỡ `DS record` sai ở registrar ngay
  2. Nếu mail fail:
     - rollback SPF/DKIM/DMARC về bộ record cuối cùng còn gửi được
     - không giữ 2 SPF record cùng lúc
  3. Nếu AAAA sai:
     - xóa `AAAA` nếu chưa dùng IPv6 thật
  4. Sau rollback, kiểm tra:
     ```bash
     dig A gymerviet.com +short
     dig AAAA gymerviet.com +short
     dig MX gymerviet.com +short
     dig TXT gymerviet.com +short
     dig TXT _dmarc.gymerviet.com +short
     dig DS gymerviet.com +short
     ```

### F. Hướng Dẫn Rollback Nhanh (Emergency Rollback Playbook)
- **Frontend**: Revert commit trên nhánh `main` và trigger Vercel/Netlify redeploy bản ổn định ngay lập tức.
- **Backend / Database**:
  1. Code lỗi không ảnh hưởng DB: Revert commit và khởi động lại app.
  2. DB Migration lỗi (Data loss/Schema mismatch): Sử dụng tính năng PITR (Point-in-Time Recovery) của dịch vụ PostgreSQL Cloud (như Supabase/AWS RDS) để Rollback Database về trạng thái 5 phút trước sự cố. Code backend bắt buộc phải revert theo schema. Mọi write operations trong thời điểm sự cố phải được query riêng lưu giữ nếu quan trọng.
