# Chạy migration & backend với Supabase (PostgreSQL)

## Đoạn chạy chuẩn (`migrate:run`)

Trong repo, từ thư mục **`backend`** (để script load đúng `../.env` nếu bạn để env ở root):

```bash
cd backend
npm run migrate:run
npm run migrate:check
```

**Cách khai báo `DATABASE_URL` (khuyến nghị):** dán **một dòng** vào `backend/.env` hoặc `.env` ở **thư mục cha** repo (script cũng đọc `../.env`). Không thêm dấu ngoặc vuông quanh mật khẩu.

### 1) Direct connection — nên dùng cho migration

Lấy từ Dashboard → **Database** → Connection string → **URI** → tab **Direct connection**.

- User: `postgres`
- Host: `db.<PROJECT_REF>.supabase.co`, port **5432**
- Ví dụ dạng (thay mật khẩu đã encode):

```env
DATABASE_URL=postgresql://postgres:MẬT_KHẨU_ĐÃ_ENCODE@db.rxgpsbzxqvprwnypsuqp.supabase.co:5432/postgres?sslmode=require
```

Mật khẩu thật có ký tự `@` → trong URL phải là **`%40`** (ví dụ `Vndk849090@` → `Vndk849090%40`).

### 2) Transaction pooler (port 6543) — đúng format bạn đang dùng

Lấy từ tab **Transaction pooler** / URI có `pooler.supabase.com` và port **6543**.

- User phải là **`postgres.<PROJECT_REF>`** (có dấu chấm), không phải chỉ `postgres`.
- Giữ query `?pgbouncer=true` như Supabase cung cấp.

```env
DATABASE_URL=postgresql://postgres.rxgpsbzxqvprwnypsuqp:MẬT_KHẨU_ĐÃ_ENCODE@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Lưu ý:** PgBouncer (transaction mode) đôi khi gây lỗi với migration/DDL phức tạp. Nếu `migrate:run` lỗi kiểu prepared statement / transaction, hãy chuyển tạm sang **Direct** (mục 1) chỉ để chạy migration, rồi app có thể tiếp tục dùng pooler nếu cần.

### Shell một lần (copy — thay phần mật khẩu)

Dùng **nháy đơn** bọc cả URL để `?` và `&` không bị shell hiểu sai:

```bash
cd backend
export DATABASE_URL='postgresql://postgres.rxgpsbzxqvprwnypsuqp:MẬT_KHẨU_ĐÃ_ENCODE@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
npm run migrate:run
```

Mẫu đầy đủ biến khác: [`env.supabase.example`](../env.supabase.example).

---

## Cách khuyến nghị tóm tắt

1. Trong [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **Database**.
2. **Migration:** ưu tiên **Direct connection** (port `5432`). Pooler `6543` dùng khi đồng bộ với string Supabase cấp; nếu lỗi → thử Direct.
3. **Lỗi `Invalid URL`:** mật khẩu có `@#:[]%` chưa encode URL, hoặc còn placeholder kiểu `[YOUR-PASSWORD]` — bỏ ngoặc, encode đúng.

Backend tự bật SSL khi URL chứa `supabase.co`, có `sslmode=require`, hoặc `DATABASE_SSL=true`.

Chạy API: `npm run dev` (cần `DATABASE_URL` + `JWT_*` + tuỳ chọn `SUPABASE_*` cho upload).

## SQL Editor trên Supabase (chạy tay toàn bộ file `.sql`)

Dùng khi không chạy được Node từ máy local, hoặc cần xem/áp dụng từng khối SQL.

1. Tạo file bundle (có thêm `INSERT` vào bảng `migrations` để lần sau `migrate:run` không chạy trùng):

```bash
cd backend
npm run bundle:supabase-sql
```

2. Mở file sinh ra: `supabase/all_migrations_bundled.sql`.
3. Supabase → **SQL Editor** → dán nội dung → **Run**.

**Lưu ý:** Các file trong `backend/migrations/` giả định database đã có schema nền (ví dụ bảng `users`, v.v.). Project Supabase **trống hoàn toàn** cần có lần tạo schema ban đầu (deploy/typeorm/dump) trước khi chạy bundle.

## Biến môi trường Storage (upload ảnh)

- `SUPABASE_URL` — URL project (`https://xxx.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY` — **Service role** (chỉ server, không đưa lên frontend).

Xem thêm: [`MIGRATIONS.md`](./MIGRATIONS.md).
