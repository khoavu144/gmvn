# GYMERVIET — Design Document

> **Nền tảng kết nối Huấn luyện viên thể hình, Vận động viên và Phòng gym tại Việt Nam**
> Live: [gymerviet.com](https://www.gymerviet.com)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript, Vite, Redux Toolkit, TanStack Query (where used) |
| **Styling** | Tailwind CSS + [`frontend/src/index.css`](frontend/src/index.css), [`frontend/src/styles/globals.css`](frontend/src/styles/globals.css), [`frontend/src/styles/marketplace.css`](frontend/src/styles/marketplace.css) |
| **Font** | **Inter** (body), **Manrope** (display) — see `frontend/index.html` and Tailwind `fontFamily` |
| **Routing** | React Router DOM v7 |
| **State** | Redux Toolkit (`authSlice`, `profileSlice`, …) |
| **API Client** | Axios (`apiClient` singleton with JWT interceptor) |
| **SEO** | `react-helmet-async` |
| **Backend** | Node.js + Express + TypeScript |
| **ORM** | TypeORM |
| **Database** | PostgreSQL (Supabase) |
| **Cache/Session** | Redis (optional, graceful fallback) |
| **Auth** | JWT Access + Refresh Token, bcryptjs |
| **Realtime** | Socket.io (notifications, messages) |
| **File Upload** | Multer + Supabase Storage |
| **Payment** | SePay (HMAC-SHA256 webhook) + VietQR |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Frontend → Vercel, Backend → Render |

**Canonical design reference (implementation):** [`frontend/docs/CODEBASE_STATUS.md`](frontend/docs/CODEBASE_STATUS.md) §3 and the token map at the top of [`frontend/src/index.css`](frontend/src/index.css). This document tracks product intent; tokens in code win when they differ.

---

## 2. Design System (canonical in code)

### Layers

1. **App shell / dashboard / forms:** Tailwind **`gray-*`** + semantic success | warning | error | info (see `globals.css`).
2. **Marketplace / warm editorial:** CSS variables **`--mk-*`** (OKLCH neutrals + accent) in `index.css`; used heavily in `marketplace.css` and marketplace routes.
3. **Curator / product detail accents:** **`--cur-*`** in `marketplace.css` (browns, surfaces).

### Typography

- **Body:** Inter (`:root` and Tailwind `font-sans`).
- **Display / headlines:** Manrope via `--font-display` and Tailwind `font-display`.
- Type scale helpers: `--type-display-lg`, `--type-headline-sm`, etc. in `index.css`.

### Neutrals

- Prefer **`gray-*`** for shell and auth flows so one neutral family spans list pages, dashboard, and legal.
- **Coach/Athlete flagship** components under `components/coach-flagship/` may use **`--mk-*`** for editorial continuity with marketplace tone.

### Component patterns

- Shared UI: [`frontend/src/components/ui/`](frontend/src/components/ui/) (`Button`, `Badge`, …).
- Layout: `page-shell`, `page-container`, `card`, `section-heading` in `globals.css`.
- **Border radius:** ~8px cards, full pills where specified in components.
- **Motion:** `transition` ~150ms; respect `prefers-reduced-motion` in `index.css`.

---

## 3. Frontend Routes

```
/                        → Home.tsx (landing page)
/login                   → Login.tsx
/register                → Register.tsx
/forgot-password         → ForgotPassword.tsx
/reset-password          → ResetPassword.tsx
/verify-email            → VerifyEmail.tsx

/coaches                 → Coaches.tsx (listing, filters, search)
/coaches/:trainerId      → CoachDetailPage.tsx (legacy ID route)
/coach/:slug             → CoachDetailPage.tsx (canonical URL)
/athlete/:slug           → AthleteDetailPage.tsx

/gyms                    → Gyms.tsx (listing + map)
/gyms/:id                → GymDetailPage.tsx

/gallery                 → CommunityGallery.tsx (masonry + lightbox)

/* Protected */
/dashboard               → Dashboard.tsx (trainer/athlete/gym_owner/admin)
/profile                 → Profile.tsx (edit own profile)
/profile/cv              → ProfileCV.tsx (public CV preview)
/programs                → ProgramsPage.tsx
/workouts                → WorkoutsPage.tsx
/messages                → MessagesPage.tsx
/subscriptions           → SubscriptionsPage.tsx
/onboarding              → OnboardingPage.tsx
/gym/register            → GymRegisterPage.tsx
/gym/owner/dashboard     → GymOwnerDashboard.tsx

/* Legal */
/about  /faq  /contact  /terms  /privacy
/guidelines  /community-standards
/coach-guide  /payment-policy  /report
```

---

## 4. User Types & Roles

| Role | Description |
|---|---|
| `trainer` | Huấn luyện viên — có TrainerProfile, quản lý packages/programs |
| `athlete` | Vận động viên — theo dõi progress, đăng ký gói tập |
| `gym_owner` | Chủ phòng gym — quản lý GymCenter, branches, pricing |
| `user` | Người dùng thường (mặc định khi đăng ký) |
| `admin` | Quản trị viên — duyệt gyms, quản lý gallery |

---

## 5. Database Entities

### User & Auth
| Entity | Table | Mô tả |
|---|---|---|
| `User` | `users` | Core user: slug, user_type, avatar, bio, specialties, is_verified, is_banned |
| `EmailVerificationToken` | `email_verification_tokens` | OTP 6 số, expires 24h |
| `PasswordResetToken` | `password_reset_tokens` | OTP 6 số, expires 1h |

### Trainer Profile
| Entity | Table | Mô tả |
|---|---|---|
| `TrainerProfile` | `trainer_profiles` | headline, bio_long, location, social_links, years_experience, certifications_json, is_accepting_clients |
| `TrainerSkill` | `trainer_skills` | name, proficiency_level (0-100), category |
| `TrainerExperience` | `trainer_experience` | title, organization, experience_type (work/education/certification/achievement), start_date, end_date |
| `TrainerPackage` | `trainer_packages` | name, duration_months, sessions_per_week, price, features[], is_popular |
| `TrainerGallery` | `trainer_gallery` | image_url, caption, media_type, order_number |
| `TrainerFAQ` | `trainer_faqs` | question, answer, order_number |
| `TrainerProfileHighlight` | `trainer_profile_highlights` | title, value, icon_key |
| `TrainerMediaFeature` | `trainer_media_features` | media_type, url, thumbnail_url, caption |
| `TrainerPressMention` | `trainer_press_mentions` | source_name, title, excerpt, mention_url |
| `Testimonial` | `testimonials` | client_name, comment, rating, result_achieved, is_featured |
| `BeforeAfterPhoto` | `before_after_photos` | before_image_url, after_image_url, caption |

### Gym
| Entity | Table | Mô tả |
|---|---|---|
| `GymCenter` | `gym_centers` | owner_id, name, description, cover_image_url, is_verified |
| `GymBranch` | `gym_branches` | gym_center_id, branch_name, address, coordinates |
| `GymAmenity` | `gym_amenities` | branch_id, name, icon_key |
| `GymEquipment` | `gym_equipment` | branch_id, name, category, quantity |
| `GymPricing` | `gym_pricing` | branch_id, plan_name, price, billing_cycle |
| `GymGallery` | `gym_gallery` | branch_id, image_url, caption |
| `GymTrainerLink` | `gym_trainer_links` | gym_center_id, trainer_id, is_verified |
| `GymReview` | `gym_reviews` | branch_id, user_id, rating, content |
| `GymEvent` | `gym_events` | branch_id, title, event_date |

### Business Logic
| Entity | Table | Mô tả |
|---|---|---|
| `Program` | `programs` | trainer_id, name, pricing_type, price variants, training_format |
| `Subscription` | `subscriptions` | user_id, program_id, status (pending/active/expired) |
| `FinancialTransaction` | `financial_transactions` | subscription_id, amount, transfer_content (SePay) |
| `Message` | `messages` | sender_id, receiver_id, content (Zod max 2000 chars) |
| `Notification` | `notifications` | user_id, type, message, is_read, metadata |

### Community & Progress
| Entity | Table | Mô tả |
|---|---|---|
| `CommunityGallery` | `community_gallery` | image_url, caption, category, is_featured, source |
| `UserProgress` | `user_progress` | user_id, weight, body_fat, measurements |
| `ProgressPhoto` | `progress_photos` | user_id, image_url |
| `Workout` | `workouts` | trainer_id, name, exercises[] |
| `WorkoutLog` | `workout_logs` | user_id, workout_id, duration, calories |

---

## 6. Backend API Routes

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/users/trainers              (list, search, filter)
GET    /api/v1/users/trainers/:id
GET    /api/v1/users/trainers/slug/:slug
GET    /api/v1/users/trainers/:id/similar
GET    /api/v1/users/trainers/:id/testimonials
GET    /api/v1/users/trainers/:id/before-after

GET    /api/v1/profiles/trainer/:id/full   ← returns { profile, experience, skills, packages, premium }
GET    /api/v1/profiles/slug/:slug
GET    /api/v1/profiles/me                 (protected)
PUT    /api/v1/profiles/me                 (protected)
CRUD   /api/v1/profiles/me/skills
CRUD   /api/v1/profiles/me/experience
CRUD   /api/v1/profiles/me/packages
CRUD   /api/v1/profiles/me/gallery
CRUD   /api/v1/profiles/me/testimonials

GET    /api/v1/programs/trainers/:id/programs
GET    /api/v1/programs/:id
POST   /api/v1/programs          (protected, trainer)

POST   /api/v1/subscriptions     (protected)
GET    /api/v1/subscriptions/my
POST   /api/v1/subscriptions/webhook/sepay

GET    /api/v1/gyms              (list, search)
GET    /api/v1/gyms/:id
GET    /api/v1/gyms/trainer/:id  (gyms linked to trainer)
CRUD   /api/v1/gym-owner/*       (protected, gym_owner)
CRUD   /api/v1/gym-admin/*       (protected, admin)

GET    /api/v1/messages          (protected)
POST   /api/v1/messages
GET    /api/v1/notifications     (protected)
PATCH  /api/v1/notifications/:id/read

GET    /api/v1/gallery           (community gallery, public)
POST   /api/v1/gallery/upload    (protected, admin)

POST   /api/v1/upload            (image upload → Supabase Storage)

GET    /api/v1/dashboard         (protected)

GET    /api/v1/admin/*           (protected, admin only)
```

---

## 7. Coach Profile Page Architecture

```
/coach/:slug
└── CoachDetailPage.tsx           ← API: 7 parallel calls, subscription flow
    ├── CoachMobileNav.tsx        ← Sticky tab bar (mobile, after 80px scroll)
    └── div.coach-profile-layout
        ├── ProfileSidebar.tsx    ← Fixed left sidebar (desktop ≥ 1024px)
        │   ├── Avatar + verified badge
        │   ├── Name, headline, location
        │   ├── Nav: 7 section links (IntersectionObserver active)
        │   ├── Social icons (IG, TK, YT, FB, Web)
        │   └── "Liên hệ ngay" CTA button
        └── main.coach-profile-main      ← Scrollable content
            ├── #section-about      → ProfileHeroSection
            ├── #section-services   → ProfileServicesSection
            ├── #section-gallery    → CoachResultsShowcase (reused)
            ├── #section-experience → ProfileExperienceSection
            ├── #section-packages   → ProfilePricingSection
            ├── #section-testimonials → CoachTestimonialsWall (reused)
            ├── #section-contact    → ProfileContactSection
            └── CoachRelatedFooter (full-width, below layout)
```

### API Data Mapping (Profile)
```
GET /profiles/trainer/:id/full → { success, profile, experience, skills, packages, premium }

profile     → trainerProfile state  (bio_long, social_links, location, headline, years_experience)
experience  → profileExperienceData (timeline)
skills      → profileSkillsData     (skill bars)
packages    → profilePackagesData   (pricing cards, fallback: programs)
premium     → premium state         (hero.tagline, hero.metrics, highlights, mediaFeatures)
```

---

## 8. Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **WRAP, not REWRITE** | CoachDetailPage API logic preserved — sidebar added as wrapper |
| **Rules of Hooks** | All `useMemo` hooks placed BEFORE conditional early returns |
| **trust proxy** | `app.set('trust proxy', 1)` required for Render + express-rate-limit |
| **Slug deduplication** | Seed uses `findOne({ where: [{ email }, { slug }] })` OR query |
| **null social_links** | `typeof null === 'object'` in JS — explicit `sl !== null` guard |
| **TypeORM save() cast** | Use `as unknown as Entity` to bypass overload ambiguity |
| **noUnusedLocals** | Vercel build uses `tsconfig.app.json` with `noUnusedLocals: true` |

---

## 9. File Structure (Key Paths)

```
gymerviet-new/
├── frontend/src/
│   ├── pages/                    # Route-level page components
│   ├── components/
│   │   ├── profile/              # Coach profile: Sidebar, MobileNav, 5 new sections
│   │   ├── coach-flagship/       # Reused: ResultsShowcase, TestimonialsWall, RelatedFooter
│   │   ├── gallery/              # Masonry + Lightbox
│   │   └── [shared components]
│   ├── store/slices/             # Redux slices
│   ├── services/api.ts           # Axios client
│   ├── styles/
│   │   ├── index.css             # Global design tokens, buttons
│   │   ├── fonts.css             # Lexend + Vietnamese unicode-range
│   │   └── coachProfile.css      # Profile page layout + all section CSS
│   └── types/index.ts
│
└── backend/src/
    ├── entities/                 # TypeORM entities (38 total)
    ├── routes/                   # Express routers (15 files)
    ├── controllers/              # Request handlers
    ├── services/                 # Business logic (profileService, userService, authService...)
    ├── middleware/               # auth, errorHandler, requestLogger, upload
    ├── seeds/fullSeed.ts         # 7 coaches + 6 athletes + 3 gyms + community gallery
    ├── config/database.ts        # TypeORM DataSource (Supabase PostgreSQL)
    ├── socket.ts                 # Socket.io server init
    └── app.ts                    # Express app (trust proxy, CORS, rate limit, routes)
```

---

## 10. Seed Data (Demo Accounts)

> Password cho tất cả demo accounts: `Demo@123456`

| Type | Email | Note |
|---|---|---|
| Coach | `phan.minh.hoang@gymerviet.com` | Calisthenics, Hà Nội |
| Coach | `bui.quang.huy@gymerviet.com` | Marathon, Hà Nội |
| Coach | `le.thi.mai@gymerviet.com` | Yoga, TP.HCM |
| Coach | `nguyen.van.duc@gymerviet.com` | Powerlifting |
| Coach | `tran.thi.lan@gymerviet.com` | Muay Thai |
| Coach | `hoang.minh.tuan@gymerviet.com` | CrossFit |
| Coach | `vo.thi.hoa@gymerviet.com` | Pilates |
| Athlete | `le.van.phong@gymerviet.com` | Runner |
| Gym | `minh.gym.owner@gymerviet.com` | Iron Paradise Gym |

---

*Last updated: 2026-03-20*
