# GYMERVIET — GIỚI THIỆU SẢN PHẨM & SƠ ĐỒ ỨNG DỤNG

> Tài liệu dành cho: Khách hàng / Nhà đầu tư / Đối tác  
> Phiên bản: 2.0 (Gym Center Module)

---

## GYMERVIET LÀ GÌ?

**GYMERVIET** là nền tảng kết nối hệ sinh thái Fitness toàn diện đầu tiên tại Việt Nam — nơi ba đối tượng chính hội tụ:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   GYMER              TRAINER              GYM CENTER            │
│   (Người tập)        (Huấn luyện viên)    (Chủ phòng tập)      │
│                                                                  │
│   Tìm HLV phù hợp ──→ Kết nối trực tiếp ←── Liên kết HLV      │
│   Khám phá gym    ──→ Quản lý học viên   ←── Quảng bá thương   │
│   Theo dõi tiến độ    Tăng thu nhập           hiệu              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SƠ ĐỒ TOÀN BỘ ỨNG DỤNG

```
GYMERVIET APP
│
├── PUBLIC PAGES (Ai cũng xem được)
│   ├── / ──────────────── Trang chủ (chọn Gymer / Gym Center)
│   │   ├── /?for=gymer    Trang chủ dành cho Gymer
│   │   └── /?for=gym      Trang chủ dành cho Gym Owner
│   │
│   ├── /trainers ───────── Danh sách Huấn luyện viên
│   │   └── /trainers/:id   Hồ sơ chi tiết HLV
│   │
│   ├── /trainer/:id ─────── Landing page công khai của HLV (SEO)
│   │
│   ├── /gyms ──────────── Danh sách Gym Center
│   │   └── /gyms/:id      Trang chi tiết Gym
│   │
│   ├── /login
│   ├── /register
│   │
│   └── /about · /faq · /contact · /terms · /privacy · ...
│
├── GYMER DASHBOARD (Cần đăng nhập, role: athlete)
│   ├── /dashboard ──────── Tổng quan tập luyện
│   ├── /profile ────────── Hồ sơ cá nhân
│   ├── /programs ───────── Khóa học đang theo
│   ├── /workouts ───────── Lịch tập cá nhân
│   └── /messages ───────── Tin nhắn với HLV
│
├── TRAINER DASHBOARD (Cần đăng nhập, role: trainer)
│   ├── /dashboard ──────── Tổng quan học viên & thu nhập
│   ├── /profile ────────── Chỉnh sửa hồ sơ chuyên môn
│   ├── /programs ───────── Quản lý khóa học
│   └── /messages ───────── Tin nhắn với học viên
│
├── GYM OWNER PANEL (Cần đăng nhập + được duyệt, role: gym_owner)
│   ├── /gym-owner/register  Đăng ký thông tin phòng tập
│   └── /gym-owner ──────── Bảng điều khiển Gym Center
│       ├── Tab: Tổng quan (stats)
│       ├── Tab: Chi nhánh (quản lý)
│       ├── Tab: Coach liên kết
│       └── Tab: Cài đặt (thông tin thương hiệu)
│
└── ADMIN PANEL (Cần đăng nhập, role: admin)
    └── /dashboard ──────── Quản lý toàn hệ thống
        ├── Duyệt Trainer
        ├── Duyệt Gym Center
        ├── Quản lý Reviews
        └── Báo cáo & Thống kê
```

---

## TÍNH NĂNG THEO TỪNG ĐỐI TƯỢNG

---

### GYMER — Trải nghiệm người dùng

**Tìm kiếm & Khám phá**
- Tìm kiếm huấn luyện viên theo tên, chuyên môn, khu vực, mức giá
- Khám phá danh sách phòng gym với bộ lọc thành phố
- Xem hồ sơ chi tiết HLV: kinh nghiệm, chứng chỉ, đánh giá, gallery ảnh
- Xem trang chi tiết gym: tiện ích, thiết bị, bảng giá, events, danh sách HLV

**Kết nối & Đặt lịch**
- Nhắn tin trực tiếp với HLV real-time
- Đăng ký khóa học / gói tập luyện
- Xem lịch tập cá nhân
- Theo dõi tiến trình tập luyện

**Đánh giá**
- Đánh giá Gym Center (chỉ dành cho user có subscription với HLV tại gym đó — đảm bảo review thực chất)

---

### TRAINER (HLV/PT) — Công cụ chuyên nghiệp

**Xây dựng thương hiệu**
- Hồ sơ cá nhân chuyên nghiệp với slug URL riêng (vd: `gymerviet.vn/trainer/nguyen-van-a`)
- Thêm chứng chỉ, giải thưởng, kinh nghiệm làm việc
- Gallery ảnh transformation, sự kiện
- FAQ tự tùy chỉnh
- Social links

**Quản lý học viên**
- Tạo và quản lý khóa học (online, offline, 1-1, nhóm)
- Theo dõi tiến trình từng học viên
- Tin nhắn real-time
- Thống kê thu nhập

**Kết nối Gym Center**
- Nhận lời mời hợp tác từ các phòng gym
- Profile HLV hiển thị badge "Hoạt động tại [Gym Name]"
- Tăng khả năng tiếp cận với học viên mới

---

### GYM CENTER (Gym Owner) — Nền tảng quản lý

**Thiết lập hồ sơ**
- Trang thương hiệu chuyên nghiệp với logo, cover image, tagline
- Quản lý nhiều chi nhánh từ một dashboard duy nhất
- Thêm địa chỉ, giờ mở cửa, số điện thoại, email cho từng chi nhánh
- Google Maps embed
- Social links (Facebook, Instagram, TikTok, YouTube)

**Nội dung chi tiết**
- Danh sách tiện ích (hồ bơi, xông hơi, parking, ...)
- Danh sách thiết bị theo category
- Bảng giá tham khảo (không tích hợp thanh toán)
- Lịch hoạt động / events
- Gallery ảnh phòng tập

**Đội ngũ HLV**
- Tìm kiếm và mời HLV trên hệ thống hợp tác
- Hiển thị đội ngũ HLV trên trang gym public
- Phân vai trò cho từng HLV tại gym

**Quản lý và thống kê**
- Tổng lượt xem trang
- Số HLV đang liên kết
- Tổng đánh giá & rating trung bình
- Dashboard quản lý thống nhất cho toàn chuỗi

**Quy trình xét duyệt**
- Đăng ký → Admin GYMERVIET xem xét → Phê duyệt → Hồ sơ hiển thị công khai
- Đảm bảo chất lượng và độ tin cậy cho người dùng

---

## SƠ ĐỒ DỮ LIỆU — Cách các đối tượng liên kết

```
                    ┌──────────────┐
                    │     USER     │
                    │ (tất cả roles)│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   user_type          user_type          user_type
   = 'athlete'        = 'trainer'        = 'gym_owner'
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌─────────────┐    ┌──────────────┐
  │  Athlete  │      │   Trainer   │    │  GymCenter   │
  │  Profile  │      │   Profile   │    │  (chuỗi gym) │
  └────┬──────┘      └──────┬──────┘    └──────┬───────┘
       │                    │                   │
       │ Subscription       │ GymTrainerLink    │ owns
       │ (monthly/once)     │ (pending/active)  │
       │                    │                   ▼
       └────────────────────┘            ┌──────────────┐
                │                        │  GymBranch   │
                ▼                        │  (chi nhánh) │
          ┌──────────┐                   └──────┬───────┘
          │  Program  │                          │
          │ (khóa học)│                   ┌──────┴───────────────────────┐
          └──────────┘                    │                               │
                                   ┌──────┴──────┐  ┌──────────────────┐
                                   │ GymAmenity  │  │   GymEquipment   │
                                   │ (tiện ích)  │  │   (thiết bị)     │
                                   └─────────────┘  └──────────────────┘
                                   ┌─────────────┐  ┌──────────────────┐
                                   │  GymGallery │  │   GymPricing     │
                                   │   (ảnh)     │  │   (bảng giá)     │
                                   └─────────────┘  └──────────────────┘
                                   ┌─────────────┐  ┌──────────────────┐
                                   │   GymEvent  │  │   GymReview      │
                                   │  (sự kiện)  │  │   (đánh giá)     │
                                   └─────────────┘  └──────────────────┘
```

---

## SƠ ĐỒ LUỒNG NGƯỜI DÙNG (USER FLOWS)

### Luồng 1 — Gymer tìm và đăng ký với HLV

```
Gymer                        Platform                      Trainer
  │                              │                              │
  ├── Truy cập /trainers ────────► Hiển thị danh sách ─────────│
  │                              │                              │
  ├── Tìm kiếm + Filter ─────────► Lọc kết quả ───────────────│
  │                              │                              │
  ├── Xem TrainerDetailPage ──────► Hồ sơ, gallery, giá ────────│
  │                              │                              │
  ├── Nhắn tin tư vấn ───────────►────────────────────────────►│
  │◄─────────────────────────────────────────────────────────── │
  │                              │                              │
  ├── Đăng ký khóa học ──────────► Tạo Subscription ───────────►│
  │                              │                              │
  ├── Nhận Program ──────────────►────────────────────────────►│
  │                              │                              │
  └── Theo dõi / Workout Log ────► Cập nhật tiến trình ─────────│
```

---

### Luồng 2 — Gym Owner xây dựng profile và kết nối HLV

```
Gym Owner                    Platform                      Trainer
  │                              │                              │
  ├── Đăng ký tài khoản ─────────► user_type = gym_owner ───────│
  │                              │                              │
  ├── Điền hồ sơ gym ────────────► Tạo GymCenter + Branch ──────│
  │                              │   (is_verified = false)       │
  │                              │                              │
  │                         Admin review                         │
  │◄── Email phê duyệt ──────────┤                              │
  │                              │ is_verified = true            │
  │                              │                              │
  ├── Thiết lập nội dung ─────────► Amenities, Equipment, ───────│
  │                              │   Pricing, Events, Gallery    │
  │                              │                              │
  ├── Mời HLV hợp tác ───────────► GymTrainerLink: pending ─────►│
  │                              │                              ├── Nhận lời mời
  │                              │                              │
  │                              │◄─── Accept ──────────────────┤
  │                              │ status = 'active'             │
  │                              │                              │
  ├── HLV xuất hiện trên trang gym►────────────────────────────►│
  └──                            │ Trainer Profile có badge gym  │
```

---

### Luồng 3 — Athlete đánh giá Gym (Verified Review)

```
Athlete                      Platform                      Gym Owner
  │                              │                              │
  ├── Có Subscription            │                              │
  │   với Trainer@GymX ──────────►                              │
  │                              │                              │
  ├── Vào /gyms/:gymId ──────────► Check canReview ─────────────│
  │                              │   (có Sub với Trainer@gym?)   │
  │                              │   → YES                       │
  │◄── Form Review hiển thị ──────┤                              │
  │                              │                              │
  ├── Submit đánh giá 4 sao ──────► Lưu GymReview ─────────────►│
  │                              │   is_visible = true           │
  │                              │                              │
  │                              │                              ├── Thấy rating tăng
  └──                            │                              └── trong Dashboard
```

---

## CÔNG NGHỆ & ĐỘ TIN CẬY

| Thành phần | Công nghệ | Lợi ích |
|-----------|-----------|---------|
| Frontend | React + TypeScript + Vite | Hiệu năng cao, type-safe |
| Backend | Node.js + Express + TypeORM | Scalable, maintainable |
| Database | PostgreSQL (Supabase) | Reliable, cloud-managed |
| Storage | Supabase Storage | CDN ảnh toàn cầu |
| Real-time | Socket.io | Chat tức thì |
| Auth | JWT (Access + Refresh tokens) | Bảo mật cao |
| Hosting | Render (backend) + Vercel (frontend) | 99.9% uptime |

---

## CÁC CON SỐ DỰ KIẾN (Mục tiêu)

| Chỉ số | Hiện tại | Mục tiêu 12 tháng |
|--------|----------|------------------|
| Gymer đăng ký | 10,000+ | 50,000+ |
| Trainer verified | 500+ | 2,000+ |
| Gym Center đối tác | 0 (mới ra mắt) | 200+ |
| Buổi tập ghi nhận | 50,000+ | 500,000+ |
| Đánh giá trung bình | 4.9 | > 4.8 |

---

## ĐIỂM KHÁC BIỆT SO VỚI ĐỐI THỦ

| Tính năng | GYMERVIET | Marketplace thông thường |
|-----------|-----------|------------------------|
| Kết nối trực tiếp HLV | Có, không qua môi giới | Thường qua trung gian |
| Profile gym chuỗi nhiều chi nhánh | Có | Hiếm |
| Review có điều kiện (verified) | Có | Thường mở cho tất cả |
| Trainer liên kết với Gym | Có, hai chiều | Không |
| Real-time messaging | Có | Ít phổ biến |
| Theo dõi tiến trình tập luyện | Có | Không |
| Chi phí cho Gymer | Miễn phí tham gia | Thường có phí |

---

## ROADMAP — LỘ TRÌNH PHÁT TRIỂN

### Hiện tại (v2.0)
- Gym Center module hoàn chỉnh
- Hệ thống verified review
- Kết nối Trainer ↔ Gym

### Sắp tới (v2.1 — Q3/2026)
- Mobile app (iOS + Android)
- Google Maps tích hợp đầy đủ
- Notification system (email + push)
- Gym Gallery reorder drag-and-drop

### Tương lai (v3.0 — 2027)
- Tích hợp thanh toán (SePay/VNPay)
- Gym membership card digital
- AI gợi ý HLV/Gym phù hợp
- Video streaming cho online training

---

## LIÊN HỆ & HỖ TRỢ

- Website: **gymerviet.vn**
- Email hỗ trợ: support@gymerviet.vn
- Đăng ký đối tác Gym: gymerviet.vn/gym/register
- Cộng đồng HLV: gymerviet.vn/trainer-guide
