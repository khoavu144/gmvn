# GYMERVIET — GYM CENTER MODULE: KIẾN TRÚC TOÀN DIỆN

> Tài liệu này mô tả toàn bộ cấu trúc mở rộng mảng Gym Center/Fitness Studio cho hệ thống GYMERVIET, bao gồm database schema, file structure, API routes, frontend pages, và logic liên kết với mảng Trainer/Gymer hiện có.

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Phân tách trang chủ: Gymer vs GymCenter](#2-phân-tách-trang-chủ)
3. [Database Schema — Entities mới](#3-database-schema)
4. [Backend — File Structure & API Routes](#4-backend)
5. [Frontend — File Structure & Routes mới](#5-frontend)
6. [Chi tiết từng trang Frontend](#6-chi-tiết-trang)
7. [Logic liên kết Gym ↔ Trainer ↔ Gymer](#7-logic-liên-kết)
8. [Admin Panel Extension](#8-admin-panel)
9. [Quy tắc Design System (No Icons)](#9-design-system)
10. [Checklist Implementation](#10-checklist)

---

## 1. TỔNG QUAN HỆ THỐNG

### Các vai trò trong hệ thống (cập nhật)

```
User Types (enum):
  'athlete'    → Gymer (người tập luyện)
  'trainer'    → Huấn luyện viên (HLV/PT)
  'gym_owner'  → Chủ Gym / Gym Manager  ← NEW
  'admin'      → Quản trị viên hệ thống
```

### Luồng liên kết chính

```
GymCenter (chuỗi) ──┬── GymBranch (chi nhánh 1)
                    ├── GymBranch (chi nhánh 2)
                    └── GymBranch (chi nhánh N)
                           │
                           ├── GymTrainerLink ──→ TrainerProfile (HLV)
                           │                          │
                           ├── GymAmenity             └── Subscription ──→ Athlete
                           ├── GymEquipment                                   │
                           ├── GymGallery                                     └── GymReview
                           ├── GymPricing
                           ├── GymEvent
                           └── GymSocialLinks
```

### Quy tắc hiển thị công khai

- GymCenter / GymBranch chỉ hiển thị public khi `is_verified = true` (admin duyệt)
- TrainerProfile hiển thị trong gym khi `gym_trainer_links.status = 'active'`
- GymReview chỉ được tạo bởi user có Subscription với trainer thuộc gym đó

---

## 2. PHÂN TÁCH TRANG CHỦ

### Route logic

```
/ (root)
├── Không có query param → Hiển thị landing chọn hướng (Gymer | GymCenter)
├── /?for=gymer         → Trang chủ Gymer
└── /?for=gym           → Trang chủ GymCenter
```

Hoặc dùng cookie/localStorage để nhớ lựa chọn lần sau.

### File structure cho Homepage split

```
frontend/src/pages/
├── Home.tsx                    ← Cập nhật: Landing chọn hướng (split screen)
├── HomeGymer.tsx               ← NEW: Trang chủ dành cho Gymer
└── HomeGymCenter.tsx           ← NEW: Trang chủ dành cho Gym Owner
```

---

### `Home.tsx` — Landing Selector (Split Screen)

```tsx
// Màn hình chọn hướng — không icon, dùng typography + layout
// Layout: 2 panel song song, click vào panel để navigate

export default function Home() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* Panel trái: Gymer */}
      <Link to="/?for=gymer" className="...bg-white hover:bg-black group transition-all duration-500 ...">
        <div className="p-16 flex flex-col justify-center h-full">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 group-hover:text-gray-500 mb-6">
            Dành cho
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-black group-hover:text-white tracking-tighter leading-none mb-6">
            GYMER
          </h1>
          <p className="text-gray-500 group-hover:text-gray-300 text-lg max-w-sm leading-relaxed">
            Tìm huấn luyện viên, khám phá gym, 
            và theo dõi hành trình luyện tập của bạn.
          </p>
          <div className="mt-12 text-sm font-bold tracking-widest text-gray-300 group-hover:text-white uppercase">
            Bắt đầu →
          </div>
        </div>
      </Link>

      {/* Panel phải: Gym Center */}
      <Link to="/?for=gym" className="...bg-black hover:bg-white group transition-all duration-500 border-l border-gray-100...">
        <div className="p-16 flex flex-col justify-center h-full">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 group-hover:text-gray-400 mb-6">
            Dành cho
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white group-hover:text-black tracking-tighter leading-none mb-6">
            GYM CENTER
          </h1>
          <p className="text-gray-400 group-hover:text-gray-600 text-lg max-w-sm leading-relaxed">
            Đăng ký & quản lý phòng gym của bạn. 
            Kết nối với HLV và tiếp cận hàng nghìn gymer.
          </p>
          <div className="mt-12 text-sm font-bold tracking-widest text-gray-600 group-hover:text-black uppercase">
            Đăng ký ngay →
          </div>
        </div>
      </Link>

    </div>
  );
}
```

---

### `HomeGymer.tsx` — Trang chủ Gymer (giữ nội dung hiện tại, cập nhật CTA)

Nội dung giống `Home.tsx` hiện tại nhưng bổ sung:
- Section **"Khám phá Gym gần bạn"** (sau Featured Trainers)
- CTA thêm `/gyms` bên cạnh `/trainers`
- Stats cập nhật: thêm "Phòng gym đối tác: 200+"

---

### `HomeGymCenter.tsx` — Trang chủ GymCenter (hoàn toàn mới)

Sections:
```
1. HERO: "Đưa phòng gym của bạn lên bản đồ fitness Việt Nam"
   CTA: "Đăng ký miễn phí" → /gym/register

2. HOW IT WORKS (3 bước):
   01 → Đăng ký & được verify
   02 → Tạo profile gym đầy đủ
   03 → Kết nối HLV & tiếp cận gymer

3. FEATURES cho Gym Owner:
   - Dashboard quản lý chuyên nghiệp
   - Liên kết HLV chuyên nghiệp
   - Bảng giá minh bạch
   - Thống kê lượt xem thực

4. STATS: "200+ Phòng gym | 500+ HLV đối tác | 10,000+ Gymer"

5. GYM LISTING PREVIEW (3-4 gym nổi bật)

6. TESTIMONIALS từ Gym Owner

7. FINAL CTA: "Đăng ký tài khoản Gym Owner"
```

---

## 3. DATABASE SCHEMA

### 3.1 Cập nhật bảng `users`

```sql
-- Thêm giá trị mới vào enum user_type
ALTER TYPE user_type_enum ADD VALUE 'gym_owner';

-- Cột mới cho gym_owner
ALTER TABLE users ADD COLUMN gym_owner_status VARCHAR(20) DEFAULT NULL;
-- Values: null | 'pending_review' | 'approved' | 'rejected'
```

---

### 3.2 Entity: `GymCenter` (Thương hiệu/Chuỗi gym)

```typescript
// backend/src/entities/GymCenter.ts
@Entity('gym_centers')
export class GymCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  owner_id: string;                    // FK → users.id (gym_owner)

  @Column({ type: 'varchar', length: 255 })
  name: string;                        // "California Fitness & Yoga"

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  slug: string;                        // "california-fitness-yoga"

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  tagline: string;                     // "Train Hard. Live Better."

  @Column({ type: 'jsonb', nullable: true })
  social_links: {                      // Social links cho toàn chuỗi
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;               // Admin duyệt → true

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;                 // Tổng lượt xem

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => GymBranch, branch => branch.gym_center)
  branches: GymBranch[];
}
```

---

### 3.3 Entity: `GymBranch` (Chi nhánh)

```typescript
// backend/src/entities/GymBranch.ts
@Entity('gym_branches')
export class GymBranch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gym_center_id: string;              // FK → gym_centers.id

  @Column({ type: 'varchar', length: 255 })
  branch_name: string;               // "Chi nhánh Quận 1" hoặc dùng tên chính nếu chỉ 1

  @Column({ type: 'varchar', length: 500 })
  address: string;                   // Địa chỉ đầy đủ

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  // Tọa độ cho Google Maps embed
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  google_maps_embed_url: string;     // Iframe embed URL

  // Giờ mở cửa
  @Column({ type: 'jsonb', nullable: true })
  opening_hours: {
    mon?: { open: string; close: string; is_closed?: boolean };
    tue?: { open: string; close: string; is_closed?: boolean };
    wed?: { open: string; close: string; is_closed?: boolean };
    thu?: { open: string; close: string; is_closed?: boolean };
    fri?: { open: string; close: string; is_closed?: boolean };
    sat?: { open: string; close: string; is_closed?: boolean };
    sun?: { open: string; close: string; is_closed?: boolean };
  };

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;               // Lượt xem riêng chi nhánh này

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => GymCenter, center => center.branches)
  @JoinColumn({ name: 'gym_center_id' })
  gym_center: GymCenter;

  @OneToMany(() => GymGallery, g => g.branch)
  gallery: GymGallery[];

  @OneToMany(() => GymTrainerLink, l => l.branch)
  trainer_links: GymTrainerLink[];

  @OneToMany(() => GymAmenity, a => a.branch)
  amenities: GymAmenity[];

  @OneToMany(() => GymEquipment, e => e.branch)
  equipment: GymEquipment[];

  @OneToMany(() => GymPricing, p => p.branch)
  pricing: GymPricing[];

  @OneToMany(() => GymEvent, ev => ev.branch)
  events: GymEvent[];

  @OneToMany(() => GymReview, r => r.branch)
  reviews: GymReview[];
}
```

---

### 3.4 Entity: `GymGallery`

```typescript
@Entity('gym_gallery')
export class GymGallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;

  @Column({ type: 'varchar', length: 500 })
  image_url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  caption: string;

  @Column({
    type: 'enum',
    enum: ['exterior', 'interior', 'equipment', 'pool', 'class', 'other'],
    default: 'other'
  })
  image_type: string;

  @Column({ type: 'int', default: 0 })
  order_number: number;

  @CreateDateColumn()
  created_at: Date;
}
```

---

### 3.5 Entity: `GymAmenity` (Tiện ích)

```typescript
@Entity('gym_amenities')
export class GymAmenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
  // Ví dụ: 'Hồ bơi', 'Phòng xông hơi', 'Bãi đỗ xe', 'Phòng thay đồ',
  //         'Tủ đồ cá nhân', 'Wifi miễn phí', 'Quầy bar dinh dưỡng', ...

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  note: string;                      // "Hồ bơi 25m, mở 6:00-22:00"
}
```

---

### 3.6 Entity: `GymEquipment` (Thiết bị)

```typescript
@Entity('gym_equipment')
export class GymEquipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;
  // 'cardio' | 'strength' | 'free_weights' | 'functional' | 'studio' | 'other'

  @Column({ type: 'varchar', length: 150 })
  name: string;                      // "Máy chạy bộ Life Fitness"

  @Column({ type: 'int', nullable: true })
  quantity: number;                  // Số lượng

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;
}
```

---

### 3.7 Entity: `GymTrainerLink` (Liên kết Gym ↔ Trainer)

```typescript
@Entity('gym_trainer_links')
export class GymTrainerLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;                 // Chi nhánh cụ thể

  @Column({ type: 'uuid' })
  gym_center_id: string;             // Chuỗi gym (để query nhanh)

  @Column({ type: 'uuid' })
  trainer_id: string;                // FK → users.id (trainer)

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'removed'],
    default: 'pending'
  })
  status: string;
  // 'pending': Gym gửi lời mời, trainer chưa confirm
  // 'active':  Đã liên kết, hiển thị public
  // 'removed': Đã gỡ liên kết

  @Column({ type: 'varchar', length: 100, nullable: true })
  role_at_gym: string;               // "PT chính thức", "PT cộng tác", v.v.

  @Column({ type: 'timestamp', nullable: true })
  linked_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
```

---

### 3.8 Entity: `GymPricing` (Bảng giá)

```typescript
@Entity('gym_pricing')
export class GymPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;

  @Column({ type: 'varchar', length: 100 })
  plan_name: string;                 // "Gói tháng", "Gói năm", "Vé ngày", v.v.

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  price: number;                     // VND

  @Column({
    type: 'enum',
    enum: ['per_day', 'per_month', 'per_quarter', 'per_year', 'per_session'],
    default: 'per_month'
  })
  billing_cycle: string;

  @Column({ type: 'text', nullable: true })
  description: string;               // Mô tả gói, những gì bao gồm

  @Column({ type: 'boolean', default: false })
  is_highlighted: boolean;           // Gói nổi bật

  @Column({ type: 'int', default: 0 })
  order_number: number;
}
```

---

### 3.9 Entity: `GymEvent` (Lịch hoạt động / Events)

```typescript
@Entity('gym_events')
export class GymEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['class', 'competition', 'workshop', 'promotion', 'other'],
    default: 'class'
  })
  event_type: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ type: 'boolean', default: true })
  is_recurring: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurrence_pattern: string;       // 'daily', 'weekly', 'monthly'

  @Column({ type: 'varchar', length: 100, nullable: true })
  instructor_name: string;          // Tên người hướng dẫn

  @Column({ type: 'int', nullable: true })
  max_participants: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
```

---

### 3.10 Entity: `GymReview` (Đánh giá)

```typescript
@Entity('gym_reviews')
export class GymReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  branch_id: string;

  @Column({ type: 'uuid' })
  user_id: string;                   // FK → users.id (athlete/user)

  @Column({ type: 'int' })
  rating: number;                    // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  // Điều kiện review: user phải có subscription với trainer thuộc gym này
  @Column({ type: 'uuid', nullable: true })
  verified_via_subscription_id: string;  // FK → subscriptions.id

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;               // Admin có thể ẩn

  @CreateDateColumn()
  created_at: Date;
}
```

---

## 4. BACKEND

### 4.1 File Structure — Backend mới

```
backend/src/
├── entities/
│   ├── [existing...]
│   ├── GymCenter.ts          ← NEW
│   ├── GymBranch.ts          ← NEW
│   ├── GymGallery.ts         ← NEW
│   ├── GymAmenity.ts         ← NEW
│   ├── GymEquipment.ts       ← NEW
│   ├── GymTrainerLink.ts     ← NEW
│   ├── GymPricing.ts         ← NEW
│   ├── GymEvent.ts           ← NEW
│   └── GymReview.ts          ← NEW
│
├── controllers/
│   ├── [existing...]
│   ├── gymController.ts      ← NEW (public listing, detail)
│   ├── gymOwnerController.ts ← NEW (dashboard, management)
│   └── gymAdminController.ts ← NEW (verify, moderation)
│
├── services/
│   ├── [existing...]
│   ├── gymService.ts         ← NEW
│   └── gymReviewService.ts   ← NEW
│
├── routes/
│   ├── [existing...]
│   ├── gym.ts                ← NEW (public routes)
│   ├── gymOwner.ts           ← NEW (protected: gym_owner only)
│   └── gymAdmin.ts           ← NEW (protected: admin only)
│
└── middleware/
    ├── auth.ts               ← UPDATE: thêm role 'gym_owner'
    └── requireGymOwner.ts    ← NEW: check gym_owner_status = 'approved'
```

---

### 4.2 API Routes

#### Public Routes — `/api/gyms`

```
GET    /api/gyms                    → Danh sách gym (search, filter, paginate)
GET    /api/gyms/:gymCenterId       → Detail GymCenter (+ branches list)
GET    /api/gyms/:gymCenterId/branches/:branchId → Detail 1 chi nhánh
GET    /api/gyms/:gymCenterId/trainers           → Danh sách HLV của gym
GET    /api/gyms/:gymCenterId/reviews            → Reviews của gym
GET    /api/gyms/search             → Full-text search với filters
```

**Query params cho `/api/gyms`:**
```
?search=      Tìm theo tên, địa chỉ
?city=        Lọc theo thành phố
?amenities=   pool,sauna,parking (comma-separated)
?price_min=   Giá thấp nhất (VND)
?price_max=   Giá cao nhất
?rating_min=  Rating tối thiểu (1-5)
?page=        Trang (default: 1)
?limit=       Số kết quả (default: 12)
?sort=        rating | newest | views
```

---

#### Protected Routes — `/api/gym-owner` (cần login + gym_owner_status=approved)

```
POST   /api/gym-owner/register              → Đăng ký gym mới (→ pending)
GET    /api/gym-owner/my-gyms               → Danh sách gym của owner
GET    /api/gym-owner/my-gyms/:centerId     → Detail gym (với draft data)
PUT    /api/gym-owner/centers/:centerId     → Cập nhật thông tin GymCenter
PUT    /api/gym-owner/branches/:branchId    → Cập nhật chi nhánh

POST   /api/gym-owner/branches/:branchId/gallery         → Upload ảnh gallery
DELETE /api/gym-owner/branches/:branchId/gallery/:id     → Xóa ảnh
PUT    /api/gym-owner/branches/:branchId/gallery/reorder → Sắp xếp ảnh

PUT    /api/gym-owner/branches/:branchId/amenities       → Update tiện ích (bulk)
PUT    /api/gym-owner/branches/:branchId/equipment       → Update thiết bị (bulk)
PUT    /api/gym-owner/branches/:branchId/pricing         → Update bảng giá (bulk)

POST   /api/gym-owner/branches/:branchId/events          → Tạo event
PUT    /api/gym-owner/branches/:branchId/events/:id      → Sửa event
DELETE /api/gym-owner/branches/:branchId/events/:id      → Xóa event

POST   /api/gym-owner/branches/:branchId/trainers/invite → Gửi lời mời HLV
DELETE /api/gym-owner/branches/:branchId/trainers/:id    → Gỡ HLV

GET    /api/gym-owner/stats/:centerId       → Thống kê: views, reviews, trainers
```

---

#### Trainer Routes (nhận/từ chối lời mời gym)

```
GET    /api/trainer/gym-invitations         → Danh sách lời mời từ gym
POST   /api/trainer/gym-invitations/:id/accept   → Chấp nhận
POST   /api/trainer/gym-invitations/:id/decline  → Từ chối
```

---

#### Review Routes

```
POST   /api/gyms/:gymCenterId/reviews       → Tạo review (cần auth + điều kiện subscription)
PUT    /api/gyms/:gymCenterId/reviews/:id   → Sửa review (chính chủ)
DELETE /api/gyms/:gymCenterId/reviews/:id   → Xóa review (chính chủ hoặc admin)
```

---

#### Admin Routes — `/api/admin/gyms`

```
GET    /api/admin/gyms/pending              → Danh sách gym chờ duyệt
POST   /api/admin/gyms/:centerId/approve    → Duyệt gym
POST   /api/admin/gyms/:centerId/reject     → Từ chối (kèm lý do)
GET    /api/admin/gyms                      → Toàn bộ gym trong hệ thống
PUT    /api/admin/gyms/:centerId/suspend    → Tạm khóa gym
```

---

### 4.3 gymService.ts — Logic chính

```typescript
// Kiểm tra điều kiện review
async canUserReviewGym(userId: string, gymCenterId: string): Promise<boolean> {
  // 1. Tìm tất cả trainer thuộc gym này
  const trainerLinks = await this.gymTrainerLinkRepo.find({
    where: { gym_center_id: gymCenterId, status: 'active' }
  });
  const trainerIds = trainerLinks.map(l => l.trainer_id);

  // 2. Kiểm tra user có subscription active với bất kỳ trainer nào không
  const subscription = await this.subscriptionRepo.findOne({
    where: {
      user_id: userId,
      trainer_id: In(trainerIds),
      status: 'active'
    }
  });
  return !!subscription;
}

// Thống kê cho Gym Owner Dashboard
async getGymStats(gymCenterId: string) {
  return {
    total_views: ...,        // Tổng view_count từ tất cả branches
    views_this_month: ...,
    views_last_7_days: ...,
    total_trainers: ...,     // Số HLV đang active
    total_reviews: ...,
    avg_rating: ...,
    total_branches: ...,
  };
}
```

---

## 5. FRONTEND

### 5.1 File Structure — Frontend mới

```
frontend/src/
├── pages/
│   ├── Home.tsx                        ← UPDATE: Split screen selector
│   ├── HomeGymer.tsx                   ← NEW
│   ├── HomeGymCenter.tsx               ← NEW
│   ├── Gyms.tsx                        ← NEW: /gyms listing page
│   ├── GymDetailPage.tsx               ← NEW: /gyms/:gymId
│   ├── GymBranchPage.tsx               ← NEW: /gyms/:gymId/branches/:branchId
│   ├── GymRegisterPage.tsx             ← NEW: /gym/register (public)
│   └── gym-owner/
│       ├── GymOwnerDashboard.tsx       ← NEW: /gym/dashboard
│       ├── GymProfileEditor.tsx        ← NEW: /gym/edit/:centerId
│       ├── GymBranchEditor.tsx         ← NEW: /gym/edit/:centerId/branch/:branchId
│       ├── GymGalleryManager.tsx       ← NEW: /gym/gallery/:branchId
│       ├── GymTrainerManager.tsx       ← NEW: /gym/trainers/:branchId
│       ├── GymEventsManager.tsx        ← NEW: /gym/events/:branchId
│       └── GymStatsPage.tsx            ← NEW: /gym/stats/:centerId
│
├── components/
│   ├── [existing...]
│   ├── GymCard.tsx                     ← NEW: Card hiển thị trong listing
│   ├── GymReviewForm.tsx               ← NEW: Form viết review
│   ├── GymReviewList.tsx               ← NEW: Danh sách reviews
│   ├── GymOpeningHours.tsx             ← NEW: Hiển thị giờ mở cửa
│   ├── GymPricingTable.tsx             ← NEW: Bảng giá
│   ├── GymEventsList.tsx               ← NEW: Danh sách events
│   └── TrainerGymBadge.tsx             ← NEW: Badge "Thuộc gym X" trên TrainerDetailPage
│
├── services/
│   ├── [existing...]
│   ├── gymService.ts                   ← NEW: API calls cho gym
│   └── gymOwnerService.ts              ← NEW: API calls cho gym owner
│
└── types/
    └── index.ts                        ← UPDATE: Thêm types cho gym
```

---

### 5.2 Routes mới trong `App.tsx`

```tsx
// Thêm vào createBrowserRouter:

// Gym Public Routes
{ path: '/gyms', element: <Gyms /> },
{ path: '/gyms/:gymId', element: <GymDetailPage /> },
{ path: '/gyms/:gymId/branch/:branchId', element: <GymBranchPage /> },

// Gym Owner Registration (public, ai cũng truy cập được)
{ path: '/gym/register', element: <GymRegisterPage /> },

// Gym Owner Dashboard (protected: phải login + gym_owner_status=approved)
{
  path: '/gym/dashboard',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymOwnerDashboard />
    </ProtectedRoute>
  )
},
{
  path: '/gym/edit/:centerId',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymProfileEditor />
    </ProtectedRoute>
  )
},
{
  path: '/gym/edit/:centerId/branch/:branchId',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymBranchEditor />
    </ProtectedRoute>
  )
},
{
  path: '/gym/gallery/:branchId',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymGalleryManager />
    </ProtectedRoute>
  )
},
{
  path: '/gym/trainers/:branchId',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymTrainerManager />
    </ProtectedRoute>
  )
},
{
  path: '/gym/events/:branchId',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymEventsManager />
    </ProtectedRoute>
  )
},
{
  path: '/gym/stats/:centerId',
  element: (
    <ProtectedRoute requiredRole={['gym_owner']}>
      <GymStatsPage />
    </ProtectedRoute>
  )
},
```

---

### 5.3 Cập nhật `ProtectedRoute.tsx`

```tsx
// Thêm support cho requiredRole array với gym_owner
// Kiểm tra thêm: nếu role là 'gym_owner' → check user.gym_owner_status === 'approved'
// Nếu gym_owner_status === 'pending_review' → redirect đến trang "Đang chờ duyệt"
```

---

### 5.4 Cập nhật `Header.tsx` — Logic nav theo role

```tsx
// Navigation tùy theo user_type:

// athlete/user:
// HLV & PT | Gyms | Khóa học | Lịch tập | Tin nhắn

// trainer:
// HLV & PT | Gyms | Khóa học | Tin nhắn | [Badge gym đang thuộc]

// gym_owner:
// Gyms | Quản lý Gym | Tin nhắn

// Không authenticated:
// HLV & PT | Gyms | Đăng nhập | Đăng ký
```

Lưu ý: **Không dùng icon** — dùng text label thuần

---

## 6. CHI TIẾT TRANG FRONTEND

### 6.1 `/gyms` — Gym Listing Page (`Gyms.tsx`)

```
Layout:
┌─────────────────────────────────────────────┐
│ H1: "Khám phá Phòng Gym"                    │
│ Subtitle                                     │
├─────────────────────────────────────────────┤
│ [Search bar]                                 │
│ Filters: Thành phố | Tiện ích | Giá | Rating │
├─────────────────────────────────────────────┤
│ Grid 3 cols (desktop) / 1 col (mobile)       │
│ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │GymCard│ │GymCard│ │GymCard│                │
│ └──────┘ └──────┘ └──────┘                  │
│ [Pagination]                                 │
└─────────────────────────────────────────────┘

GymCard component:
- Cover image (aspect 16:9, grayscale hover)
- Logo nhỏ overlay góc trái
- Tên gym (bold)
- Địa chỉ (truncated)
- Tags: tiện ích nổi bật (tối đa 3: "Hồ bơi · Xông hơi · Parking")
- Rating ★ X.X (N đánh giá)
- Số chi nhánh nếu > 1
- Số HLV đang hoạt động
- Giá từ: XXX.XXX đ/tháng
```

---

### 6.2 `/gyms/:gymId` — Gym Detail Page (`GymDetailPage.tsx`)

```
Cấu trúc trang:
─────────────────────────────────────────────

1. HERO SECTION
   - Cover image full width
   - Logo gym overlay
   - Tên gym (H1)
   - Tagline
   - Stats nhanh: N chi nhánh | N HLV | Rating ★

2. BRANCH SELECTOR (nếu > 1 chi nhánh)
   - Tabs: Chi nhánh 1 | Chi nhánh 2 | ...
   - Khi chọn tab → toàn bộ content bên dưới update theo branch

3. THÔNG TIN CƠ BẢN (của branch đang chọn)
   - Địa chỉ đầy đủ
   - SĐT, Email
   - Giờ mở cửa (theo ngày, highlight hôm nay)

4. GOOGLE MAPS EMBED
   - iframe nhúng bản đồ (nếu có embed URL)
   - Fallback: link "Xem trên Google Maps"

5. FACILITIES & AMENITIES
   - Grid: tên tiện ích + note (nếu có)
   - Unavailable amenities hiển thị mờ + gạch ngang

6. EQUIPMENT LIST
   - Chia theo category: Cardio | Strength | Free Weights | Functional | Studio
   - Tên thiết bị, số lượng, brand

7. BẢNG GIÁ THAM KHẢO
   - Cards cho từng gói
   - Label "Phổ biến" cho gói is_highlighted
   - Note: "Giá chỉ mang tính tham khảo, liên hệ gym để biết thêm chi tiết"

8. LỊCH HOẠT ĐỘNG / EVENTS
   - List các events sắp diễn ra
   - Filter: Tất cả | Lớp học | Workshop | Khuyến mãi

9. HLV TẠI GYM NÀY
   - Grid cards (link sang /trainers/:id)
   - Hiển thị: avatar, tên, role_at_gym, specialties, rating
   - CTA: "Xem profile đầy đủ"

10. GALLERY ẢNH
    - Grid 3 cols
    - Click mở lightbox
    - Filter theo image_type

11. SOCIAL LINKS
    - Text links: Facebook | Instagram | TikTok | YouTube | Website

12. REVIEWS & RATING
    - Overall rating với breakdown (5★ → 1★)
    - List reviews (tên user, rating, comment, ngày)
    - [Viết đánh giá] button (chỉ hiện nếu đủ điều kiện)
    - Nếu chưa đủ điều kiện: tooltip "Cần có subscription với HLV tại gym này"
```

---

### 6.3 `/gym/register` — Gym Owner Registration

```
Flow:
Step 1: Chọn loại tài khoản
  - "Tôi là Gym Owner / Manager"
  - Form: Họ tên, Email, SĐT, Mật khẩu

Step 2: Thông tin phòng gym
  - Tên chuỗi gym
  - Mô tả ngắn
  - Địa chỉ chi nhánh đầu tiên
  - SĐT liên hệ gym

Step 3: Confirm & Submit
  - Hiển thị thông tin đã điền
  - Note: "Hồ sơ sẽ được xem xét trong 1-3 ngày làm việc"
  - Submit → user_type = 'gym_owner', gym_owner_status = 'pending_review'

Sau khi submit:
  → Trang "Đang chờ xét duyệt" với hướng dẫn
  → Admin nhận notification
  → Khi được duyệt: user nhận email, gym_owner_status = 'approved'
```

---

### 6.4 `/gym/dashboard` — Gym Owner Dashboard

```
Layout: Sidebar + Main Content

Sidebar (text only, no icons):
  Tổng quan
  Chỉnh sửa Gym
  Quản lý Ảnh
  Huấn luyện viên
  Lịch hoạt động
  Thống kê
  Cài đặt

Main Content:

── TỔNG QUAN ──
  - Stats cards:
    Lượt xem tháng này: [N]  (+X% so với tháng trước)
    Tổng HLV: [N]
    Đánh giá trung bình: ★ X.X
    Tổng đánh giá: [N]

  - Các chi nhánh:
    [Tên chi nhánh] – [Địa chỉ] – [Edit]

  - Lời mời HLV đang pending: [N] lời mời đang chờ phản hồi

── CHỈNH SỬA GYM ──
  Tabs: Thông tin chung | Chi nhánh [tên]
  - Form inline, auto-save hoặc Save button
  - Upload logo, cover image

── QUẢN LÝ ẢNH ──
  - Drag & drop upload
  - Grid gallery với reorder
  - Caption, phân loại ảnh
  - Xóa ảnh

── HUẤN LUYỆN VIÊN ──
  - Search trainer theo tên/email
  - Gửi lời mời
  - Danh sách HLV đang active (với option gỡ liên kết)
  - Danh sách lời mời đang pending

── THỐNG KÊ ──
  - Biểu đồ lượt xem theo ngày/tuần/tháng
  - Top thiết bị được xem nhiều
  - Review trend
```

---

## 7. LOGIC LIÊN KẾT

### 7.1 Trainer ↔ Gym

```
Luồng liên kết:
1. Gym Owner vào /gym/trainers/:branchId
2. Tìm kiếm trainer theo tên
3. Gửi lời mời (POST /api/gym-owner/branches/:id/trainers/invite)
   → Tạo GymTrainerLink { status: 'pending' }
4. Trainer nhận notification trong Dashboard
5. Trainer vào "Lời mời Gym" → Accept/Decline
   → Accept: status = 'active', linked_at = now()
   → Decline: status = 'removed'

Hiển thị trên TrainerDetailPage:
- Section "Hoạt động tại" → List gym đang active
- Mỗi gym: logo, tên gym, role_at_gym, link → /gyms/:gymId

Hiển thị trên GymDetailPage:
- Section "HLV tại gym" → List trainer active
- Link sang /trainers/:trainerId
```

---

### 7.2 Review — Điều kiện & Logic

```
Điều kiện viết review gym:
1. User phải đăng nhập
2. User phải có Subscription.status = 'active' với bất kỳ Trainer nào
   có GymTrainerLink.status = 'active' với gym đó

Logic backend (gymReviewService.ts):
  canReview(userId, gymCenterId) {
    trainerIds = query gym_trainer_links WHERE gym_center_id = ? AND status = 'active'
    hasSubscription = query subscriptions WHERE user_id = ? AND trainer_id IN (trainerIds) AND status = 'active'
    return hasSubscription
  }

Một user chỉ được review 1 lần cho mỗi gym.
Update review: cho phép edit nếu review của chính mình.
```

---

### 7.3 Liên kết trong Register Flow

```
Khi user đăng ký mới → chọn loại tài khoản:
  - "Tôi muốn tập luyện"       → user_type: 'athlete'  → /dashboard (Gymer)
  - "Tôi là HLV / PT"          → user_type: 'trainer'  → /dashboard (Trainer)
  - "Tôi quản lý phòng gym"    → user_type: 'gym_owner' → /gym/register (multi-step)

Gym owner có dashboard riêng (/gym/dashboard) khác với dashboard hiện tại.
```

---

## 8. ADMIN PANEL EXTENSION

### Thêm vào Admin Dashboard hiện tại:

```
Tab mới: "Gym Centers"
  - Danh sách: All | Pending | Approved | Suspended
  - Quick action: Approve / Reject / Suspend
  - Detail: xem đầy đủ thông tin gym trước khi duyệt

Tab: "Gym Reviews"
  - Moderation queue
  - Ẩn/Hiện review

Thống kê mới:
  - Total gym centers
  - Pending approvals
  - Total reviews
```

---

## 9. DESIGN SYSTEM — QUY TẮC "NO ICONS"

### Nguyên tắc thay thế icon

Toàn bộ app **không dùng icon** (emoji, SVG icons, icon fonts). Thay thế bằng:

```
1. TEXT LABELS (ưu tiên nhất)
   Thay: 🔍 icon tìm kiếm
   Dùng: label="Tìm kiếm" hoặc placeholder text

   Thay: ✕ nút đóng
   Dùng: text "Đóng" hoặc ký tự "×" (HTML entity &times;)

   Thay: → arrow icon  
   Dùng: "→" (HTML entity &rarr;) hoặc CSS pseudo-element

2. TYPOGRAPHY INDICATORS
   Thay: ★ rating icon
   Dùng: ký tự "★" (U+2605) hoặc số + "sao"
   
   Thay: ✓ checkmark
   Dùng: ký tự "✓" (U+2713) trong text context

3. VISUAL DESIGN THAY THẾ
   - Status indicator: colored dot (CSS border-radius circle)
   - Navigation active: bottom border / background fill
   - Badge: styled span với border
   - Progress: CSS bar

4. AMENITY LIST (đặc biệt quan trọng)
   Thay: 🏊 icon hồ bơi
   Dùng: text "Hồ bơi" với styling đặc biệt:
   <span className="inline-flex items-center px-3 py-1 border border-gray-200 text-xs font-bold uppercase tracking-wider">
     Hồ bơi
   </span>
```

---

### Typography classes (không thay đổi từ hệ thống hiện tại)

```css
/* Giữ nguyên pattern hiện tại */
.text-h1 { @apply text-3xl font-extrabold text-black tracking-tight; }
.btn-primary { @apply bg-black text-white ... }
.btn-secondary { @apply border border-gray-200 ... }
.card { @apply border border-gray-200 rounded-xs p-6 ... }
```

---

## 10. CHECKLIST IMPLEMENTATION

### Phase 1 — Database & Backend Core (Ưu tiên 1)

- [ ] Thêm `gym_owner` vào `user_type` enum trong DB + Entity
- [ ] Thêm `gym_owner_status` column vào `users`
- [ ] Tạo entity `GymCenter`
- [ ] Tạo entity `GymBranch`
- [ ] Tạo entity `GymTrainerLink`
- [ ] Tạo entity `GymGallery`
- [ ] Tạo entity `GymAmenity`
- [ ] Tạo entity `GymEquipment`
- [ ] Tạo entity `GymPricing`
- [ ] Tạo entity `GymEvent`
- [ ] Tạo entity `GymReview`
- [ ] Chạy migrations (TypeORM synchronize hoặc migration files)
- [ ] Tạo `gymService.ts` với CRUD + search + stats
- [ ] Tạo `gymReviewService.ts` với điều kiện review logic
- [ ] Tạo `gymController.ts` (public routes)
- [ ] Tạo `gymOwnerController.ts` (protected routes)
- [ ] Tạo `gymAdminController.ts`
- [ ] Register routes trong `app.ts`
- [ ] Thêm middleware `requireGymOwner`

### Phase 2 — Frontend Core (Ưu tiên 2)

- [ ] Cập nhật `types/index.ts` (thêm Gym types)
- [ ] Tạo `gymService.ts` (frontend API calls)
- [ ] Tạo `GymCard.tsx` component
- [ ] Tạo `Gyms.tsx` — listing page với search/filter
- [ ] Tạo `GymDetailPage.tsx` — full detail với branch tabs
- [ ] Cập nhật `Header.tsx` — thêm "Gyms" nav + gym_owner menu
- [ ] Cập nhật `Register.tsx` — thêm option gym_owner
- [ ] Cập nhật `App.tsx` — thêm routes

### Phase 3 — Homepage Split (Ưu tiên 3)

- [ ] Cập nhật `Home.tsx` → Split screen selector
- [ ] Tạo `HomeGymer.tsx`
- [ ] Tạo `HomeGymCenter.tsx`
- [ ] Logic detect preference (localStorage: `homepage_preference`)

### Phase 4 — Gym Owner Dashboard (Ưu tiên 4)

- [ ] Tạo `GymRegisterPage.tsx` (multi-step form)
- [ ] Tạo `GymOwnerDashboard.tsx`
- [ ] Tạo `GymProfileEditor.tsx`
- [ ] Tạo `GymBranchEditor.tsx`
- [ ] Tạo `GymGalleryManager.tsx`
- [ ] Tạo `GymTrainerManager.tsx`
- [ ] Tạo `GymEventsManager.tsx`
- [ ] Tạo `GymStatsPage.tsx`

### Phase 5 — Interconnect & Polish (Ưu tiên 5)

- [ ] Cập nhật `TrainerDetailPage.tsx` → Thêm section "Hoạt động tại Gym"
- [ ] Tạo `TrainerGymBadge.tsx`
- [ ] Trainer Dashboard → Thêm tab "Lời mời từ Gym"
- [ ] Review system (GymReviewForm + GymReviewList)
- [ ] Admin Panel → Tab quản lý Gym
- [ ] Xóa toàn bộ emoji icon, thay bằng text labels
- [ ] Remove icon từ `Trainers.tsx` (🔍 placeholder)
- [ ] Remove icon từ `Home.tsx` (🔒, ⚙️, 👥, 🏋️)
- [ ] Kiểm tra toàn bộ components cho icon usage

### Phase 6 — Testing & SEO

- [ ] Test luồng Gym Owner: Register → Pending → Approved → Dashboard
- [ ] Test luồng Trainer: Nhận lời mời → Accept → Hiển thị trong Gym
- [ ] Test luồng Review: Điều kiện → Viết → Hiển thị
- [ ] SEO: thêm slug cho GymCenter, meta tags cho GymDetailPage
- [ ] Mobile responsive kiểm tra tất cả trang mới

---

## GHI CHÚ TRIỂN KHAI

### Supabase Storage — Bucket cho Gym

```
Buckets cần tạo:
  gym-covers     → Cover image của GymCenter + GymBranch
  gym-logos      → Logo của GymCenter
  gym-gallery    → Ảnh gallery của từng chi nhánh

Folder structure trong gym-gallery:
  gym-gallery/{gym_center_id}/{branch_id}/{filename}
```

### Environment Variables — Không thay đổi

Hệ thống tiếp tục dùng Supabase Storage như hiện tại. Không cần thêm env vars mới cho storage.

### Database Migration Strategy

```typescript
// Khuyến nghị: dùng TypeORM migrations thay vì synchronize=true
// để tránh data loss khi thêm columns

// Tạo migration:
npx typeorm migration:generate src/migrations/AddGymTables

// Run:
npx typeorm migration:run
```

---

*Tài liệu này được tạo dựa trên phân tích basecode GYMERVIET và các yêu cầu đã xác nhận. Mọi implementation detail có thể điều chỉnh theo thực tế phát triển.*
