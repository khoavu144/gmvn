# Tình trạng codebase — Backend API (snapshot)

**Cập nhật:** 2026-03-22  
**Bản song song frontend:** [../../frontend/docs/CODEBASE_STATUS.md](../../frontend/docs/CODEBASE_STATUS.md)  
**Migration SQL vs TypeORM:** [MIGRATIONS.md](./MIGRATIONS.md)

---

## 1. Vai trò

API REST (Express 5) + Socket.io, PostgreSQL qua TypeORM (`AppDataSource`), Redis tùy chọn (refresh token / health — có thể chạy **degraded** không Redis).

**Base URL dev (log khi boot):** `http://localhost:<PORT>/api/v1` (xem `server.ts`).

---

## 2. Stack

| Thành phần | Ghi chú |
|------------|---------|
| Runtime | Node, TypeScript → `tsc` → `dist/` |
| HTTP | Express 5, `helmet`, `cors`, `express-rate-limit` trên `/api/v1/` |
| ORM / DB | TypeORM, PostgreSQL (`pg`) |
| Cache / session token | Redis (optional) — `refreshTokenStore` |
| Jobs | Bull (queue), `node-cron` (ranking, platform subs, news crawl) |
| Realtime | Socket.io (`src/socket/`) |
| Khác | Supabase client, Nodemailer, Multer, JWT, bcrypt, Zod schemas (một số route) |

**Scripts:** `npm run dev`, `build`, `start`, `migrate:run`, `migrate:check`, `seed`, `test`, `lint`, `format` — xem [`package.json`](../package.json).

---

## 3. Cấu trúc thư mục `src/`

| Thư mục / file | Nội dung |
|----------------|----------|
| `server.ts` | Bootstrap: Redis → migrations → DB → cron → listen |
| `app.ts` | Express app: middleware, mount routes, sitemap, health |
| `routes/` | Định nghĩa HTTP routes theo domain |
| `controllers/` | Xử lý request → gọi service |
| `services/` | Logic nghiệp vụ, tích hợp ngoài |
| `entities/` | TypeORM entities (User, GymCenter, Product, …) |
| `migrations/` (repo root `backend/migrations/`) | **SQL áp dụng khi deploy** — xem [MIGRATIONS.md](./MIGRATIONS.md) |
| `src/migrations/` | Migration TypeORM TS (tham chiếu; không thay thế file `.sql` prod) |
| `middleware/` | `auth`, `errorHandler`, `requireGymOwner`, rate limit context, … |
| `schemas/` | Validation (vd. auth, user) |
| `config/` | `database`, `env`, `redis` |
| `socket/` | Socket.io init |
| `seeds/` | `fullSeed` và seed phụ |
| `scripts/` | CLI: migrations, cron one-off, patch ảnh, … |
| `__tests__/` | Jest (auth, health, migration state, …) |

---

## 4. Bề mặt API (prefix `/api/v1`)

| Mount path | Module |
|------------|--------|
| `/auth` | Đăng ký, đăng nhập, token |
| `/users` | Người dùng |
| `/programs` | Chương trình tập |
| `/subscriptions` | Gói / đăng ký |
| `/messages` | Tin nhắn |
| `/dashboard` | Tổng quan dashboard |
| `/` (mixed) | `workoutProgressRoutes` — mount tại root `api/v1` |
| `/profiles` | Hồ sơ trainer/athlete (public + chỉnh sửa) |
| `/upload` | Upload file |
| `/admin` | Quản trị |
| `/gyms` | Phòng tập (public + chi tiết) |
| `/gym-owner` | Chủ phòng tập |
| `/admin/gyms` | Duyệt/quản lý gym (admin) |
| `/notifications` | Thông báo |
| `/gallery` | Community gallery |
| `/coach-applications` | Đơn nâng cấp Coach |
| `/platform` | Gói nền tảng / billing |
| `/marketplace` | Sản phẩm marketplace |
| `/news` | Tin tức |

**Ngoài prefix chuẩn:**

- `GET /sitemap.xml` — SEO  
- `GET /share/...` — share + OG (public)  
- `GET /api/v1/health` — health check  

Chi tiết path con: mở file tương ứng trong `routes/*.ts`.

---

## 5. Boot & vận hành

1. **Migrations:** `runPendingMigrations()` trước khi `AppDataSource.initialize()` (xem `server.ts`).
2. **Cron:** ranking service, platform subscription expiry, news crawler scheduler.
3. **Seed:** nếu `RUN_SEED=true`, chạy `fullSeed` sau khi listen.
4. **Redis:** mất kết nối → app vẫn chạy với cảnh báo (degraded).

---

## 6. Kiểm thử & chất lượng

| Lệnh | Mục đích |
|------|----------|
| `npm run test` | Jest |
| `npm run lint` | ESLint `src/**/*.ts` |

CI/CD: xem workflow monorepo (nếu có) và biến môi trường production (DB, Redis, JWT secret, Supabase, …).

---

## 7. Duy trì tài liệu này

Khi thêm **router mới** hoặc đổi **prefix**: cập nhật bảng mục 4 và kiểm tra `app.ts`. Khi đổi **stack** (ORM, Express major): cập nhật mục 2.
