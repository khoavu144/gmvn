# Database migrations — GYMERVIET backend

## Nguồn sự thật cho production

**Chỉ các file `backend/migrations/*.sql`** được áp dụng khi:

- chạy `npm run migrate:run`, hoặc
- server boot (`server.ts` gọi `runPendingMigrations()`).

Script đọc thư mục [`backend/migrations/`](../migrations/), ghi nhận tên file vào bảng `migrations` (timestamp + name).

## File TypeORM trong `src/migrations/*.ts`

Các class `MigrationInterface` trong [`src/migrations/`](../src/migrations/) **không** được `migrate:run` SQL tự chạy. Chúng dùng làm **tham chiếu** khi viết SQL tay hoặc khi ai đó chạy TypeORM CLI riêng.

**Quy tắc:** Mỗi thay đổi schema dùng trong production phải có **file `.sql` mới** trong `backend/migrations/` (đặt tên `NNN_description.sql`, `NNN` tăng dần), nội dung tương đương entity/migration TS.

## Lỗi kiểu `column X does not exist`

Code đã deploy nhưng DB prod chưa chạy migration SQL tương ứng → Postgres báo lỗi khi TypeORM SELECT/INSERT (thường thấy 401 trên login).

**Khắc phục:** trên môi trường có `DATABASE_URL` đúng prod:

```bash
cd backend
npm run migrate:run
```

Hoặc restart app sau khi đã thêm file SQL mới vào repo (boot sẽ apply pending).

**Kiểm tra:**

```bash
npm run migrate:check
```

## Supabase (PostgreSQL cloud)

Xem [`SUPABASE.md`](./SUPABASE.md): `DATABASE_URL` direct connection, `npm run migrate:run`, hoặc bundle SQL cho SQL Editor.

## Mapping gần đây (2026-03)

| SQL file | Nội dung |
|----------|----------|
| `013_marketplace_membership_active.sql` | Cột `users.marketplace_membership_active` |
| `014_user_profile_catalog.sql` | Bảng catalog profile + seed |
| `015_google_form_import_logs.sql` | Bảng `google_form_import_logs` |
