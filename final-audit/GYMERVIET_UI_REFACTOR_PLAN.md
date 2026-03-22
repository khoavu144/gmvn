# GYMERVIET — UI/UX Audit & Refactor Master Plan
**Version:** 1.0 | **Date:** 2026-03-21  
**Scope:** Design System Unification + GymDetailPage + AthleteDetailPage + GymCard  
**Reference Design:** UserDashboard / AthleteDashboard / CoachDashboard  

---

## Tổng hợp 20 Q&A Decisions

| # | Quyết định | Hành động |
|---|---|---|
| Q1 | Font chuẩn | **Inter** duy nhất — xóa Roboto, Noto Sans, Manrope khỏi html/globals/index.css |
| Q2 | Token strategy | **Tailwind utilities thuần** — xóa toàn bộ `--mk-*`, `--cur-*`, `var(--border)` trong component |
| Q3 | Accent màu | **Mỗi page-context có accent riêng** — Gym: amber/warm, Athlete: slate/cool, Coach: violet |
| Q4 | athleteProfile.css | **Xóa file**, viết lại AthleteDetailPage bằng Tailwind utilities |
| Q5 | Own profile | **Thêm Edit button** khi `user.id === profile.trainer_id` |
| Q6 | GymDetailPage | **Split sub-components** + Tailwind-ify toàn bộ |
| Q7 | Badge overlap | **Fix same PR** với design system sync |
| Q8 | Button system | **Merge vào Button.tsx duy nhất**, xóa `.btn-*` classes trong globals.css |
| Q9 | FadeIn animation | **Xóa toàn bộ** FadeIn + IntersectionObserver |
| Q10 | Sidebar pattern | **Giữ phân biệt** — Athlete: dark `#0A0A0A`, Gym: light sidebar |
| Q11 | Section spacing | **py-10 section** (80px), **py-6 sub-section** (48px) |
| Q12 | Badge scope | **GymCard standard variant** bị chồng badge |
| Q13 | Typography | **Dùng type scale** trong tailwind.config (caption/body/h3...) |
| Q14 | Dashboard patterns | **Tất cả 5 pattern** — card, heading, checklist row, stat metrics, CTA link |
| Q15 | SummaryPill | **Convert → StatCard.tsx** đồng bộ với dashboard |
| Q16 | Athlete mobile | **Sidebar ẩn** on mobile, sticky CTA bottom |
| Q17 | Priority | **1. GymDetailPage → 2. AthleteDetailPage → 3. GymCard → 4. Token cleanup** |
| Q18 | Trainer link | **Verify getTrainerLinkPath()** đã xử lý đúng user_type |
| Q19 | marketplace.css | **Giữ file**, chỉ đồng bộ token bên trong về Tailwind |
| Q20 | Deliverable | **File code đã fix trực tiếp** |

---

## Sprint 1 — GymDetailPage

### 1.1 Split thành sub-components

**Tách từ GymDetailPage.tsx (1460 dòng) thành:**

```
src/pages/
  GymDetailPage.tsx          ← shell + data fetching only (~200 dòng)
src/components/gym-detail/
  GymHeroSection.tsx         ← gallery lightbox + hero image
  GymIdentityHeader.tsx      ← name, badges, breadcrumb, quick facts
  GymStickyNav.tsx           ← horizontal section nav tabs
  GymSidebarCta.tsx          ← sticky right-side CTA card (light)
  GymOverviewSection.tsx     ← description, taxonomy badges, amenities
  GymZonesSection.tsx        ← zones grid
  GymFacilitiesSection.tsx   ← amenities + equipment
  GymTrainersSection.tsx     ← trainer cards (verify getTrainerLinkPath)
  GymPricingSection.tsx      ← pricing cards
  GymScheduleSection.tsx     ← programs/sessions
  GymReviewsSection.tsx      ← review form + list
  GymMapSection.tsx          ← iframe embed + static map fallback
  GymSimilarSection.tsx      ← similar venues grid
```

### 1.2 Xóa FadeIn

**Trước:**
```tsx
function FadeIn({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}>
      {children}
    </div>
  );
}
// Usage:
<FadeIn><SomeSection /></FadeIn>
```

**Sau:** Xóa component FadeIn, xóa useInView hook, render trực tiếp:
```tsx
<SomeSection />
```

### 1.3 Section spacing chuẩn

**Trước:**
```tsx
<section className="py-16 sm:py-20">
  <div className="mb-10 space-y-4"> {/* double spacing */}
```

**Sau — áp dụng cho mọi section:**
```tsx
{/* Main section */}
<section className="py-10">
  <div className="marketplace-container">
    {/* Section heading */}
    <div className="mb-6">
      <p className="text-overline text-gray-500 uppercase tracking-[0.12em] mb-1">KICKER</p>
      <h2 className="text-h2 font-black uppercase tracking-tight">Tiêu đề section</h2>
    </div>
    {/* Sub-section nội bộ */}
    <div className="py-6 border-t border-gray-100">
      ...
    </div>
  </div>
</section>
```

### 1.4 Typography arbitrary values → type scale

Thay tất cả arbitrary text values bằng class từ tailwind.config:

| Arbitrary | Thay bằng | tailwind.config key |
|---|---|---|
| `text-[0.66rem]` | `text-overline` | 11px / 700 / 0.08em |
| `text-[0.72rem]` | `text-caption` | 12px / 500 |
| `text-[0.78rem]` | `text-body-sm` | 13px / 400 |
| `text-[0.82rem]` | `text-body-sm` | 13px / 400 |
| `text-[0.875rem]` | `text-body` | 14px / 400 |
| `text-[0.9375rem]` | `text-body-lg` | 16px / 400 |
| `text-[0.98rem]` | `text-body-lg` | 16px / 400 |
| `text-[1.4rem]` | `text-display-sm` | 36px / 700 |

### 1.5 SummaryPill → StatCard pattern

**Xóa SummaryPill** trong GymDetailPage.tsx.  
**Dùng pattern StatCard.tsx (tone="subtle")** cho quick facts:

```tsx
// GymIdentityHeader.tsx — Quick facts row
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
  {quickFacts.map(fact => (
    <div key={fact.label} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:border-black transition-colors">
      <p className="text-overline text-gray-500 uppercase tracking-[0.12em] mb-1">{fact.label}</p>
      <p className="text-body font-bold text-black leading-snug">{fact.value}</p>
    </div>
  ))}
</div>
```

### 1.6 Badge overlap fix — GymCard standard variant

**Vấn đề:** `absolute left-3 top-3` (venue badge) và `absolute right-3 top-3` (SLA badge) không đủ gap khi gym name quá dài, badge trái chạm badge phải trên màn hình nhỏ.

**Fix GymCard.tsx standard variant:**
```tsx
{/* Image overlay badges — đảm bảo không chồng */}
<div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
  {/* Left: venue type */}
  <span className="text-overline bg-black/75 backdrop-blur-sm text-white px-2 py-1 rounded font-bold uppercase tracking-[0.08em] truncate max-w-[calc(100%-80px)]">
    {venueLabel}
  </span>
  {/* Right: verified — chỉ hiện nếu có, không push trái */}
  {gym.is_verified && (
    <span className="shrink-0 text-overline bg-white text-black px-2 py-1 rounded font-bold uppercase tracking-[0.08em]">
      ✓
    </span>
  )}
</div>
```

**Quy tắc mới cho badge overlay:**
- Wrap trong `flex items-start justify-between gap-2` thay vì 2 absolute riêng lẻ
- Badge trái: `truncate max-w-[calc(100%-80px)]` — không bao giờ tràn sang phải
- Badge phải: `shrink-0` — không bao giờ bị đẩy xuống

### 1.7 GymStickyNav — section nav refactor

**Trước:** Mix `marketplace-nav-*` CSS class với inline style.

**Sau — full Tailwind:**
```tsx
// GymStickyNav.tsx
export function GymStickyNav({ sections, activeSection, onNavigate }) {
  return (
    <nav className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="marketplace-container">
        <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={[
                'shrink-0 px-4 py-3 text-body font-semibold border-b-2 transition-colors whitespace-nowrap',
                activeSection === s.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

### 1.8 GymSidebarCta — light sidebar

```tsx
// GymSidebarCta.tsx
export function GymSidebarCta({ gym, branch, leadAction }) {
  return (
    <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
      <div className="sticky top-24 space-y-3">
        {/* Price card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <p className="text-overline text-gray-500 uppercase tracking-[0.12em] mb-1">Giá từ</p>
          <p className="text-display-sm font-black text-black">{formattedPrice}</p>

          <a href={leadAction.href} className="mt-4 flex items-center justify-center gap-2 w-full h-11 bg-black text-white text-body font-bold uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-colors">
            {leadAction.label}
          </a>
        </div>

        {/* Hours card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-overline text-gray-500 uppercase tracking-[0.12em] mb-3">Giờ mở cửa hôm nay</p>
          <TodayHours branch={branch} />
        </div>

        {/* Branch selector */}
        {gym.branches?.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-overline text-gray-500 uppercase tracking-[0.12em] mb-2">Chọn cơ sở</p>
            <BranchSelector gym={gym} />
          </div>
        )}
      </div>
    </aside>
  );
}
```

### 1.9 Dashboard patterns áp dụng vào GymDetailPage

Áp dụng 5 pattern từ UserDashboard:

**a. Card/panel:**
```tsx
// Tất cả content cards dùng pattern này
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
```

**b. Section heading:**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-black uppercase tracking-tight text-black">
    {title}
  </h2>
  {subtitle && <p className="text-body text-gray-600 mt-1">{subtitle}</p>}
</div>
```

**c. Step/checklist rows (dùng cho amenities/features list):**
```tsx
<div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
  <CheckCircle2 className="w-5 h-5 text-black shrink-0 mt-0.5" />
  <div>
    <h3 className="font-bold text-black">{item.label}</h3>
    <p className="text-body-sm text-gray-600">{item.description}</p>
  </div>
</div>
```

**d. Stat metrics row:**
```tsx
<div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
  {stats.map(s => (
    <div key={s.label} className="text-center">
      <p className="text-2xl font-black text-black">{s.value}</p>
      <p className="text-overline text-gray-500 uppercase tracking-[0.12em] mt-0.5">{s.label}</p>
    </div>
  ))}
</div>
```

**e. Link CTA:**
```tsx
<Link to={href} className="inline-flex items-center gap-2 text-body font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
  {label} <ArrowRight className="w-4 h-4" />
</Link>
```

---

## Sprint 2 — AthleteDetailPage

### 2.1 Xóa athleteProfile.css

Xóa file: `src/styles/athleteProfile.css`  
Xóa import: `import '../styles/athleteProfile.css';` trong AthleteDetailPage.tsx  
Viết lại toàn bộ bằng Tailwind utilities.

### 2.2 Accent màu cho Athlete page

Athlete accent: **slate/cool** — `slate-900` (bg dark sidebar), `slate-600` (muted text)  
Không dùng oklch vars, không dùng `--mk-*`.

```tsx
// Athlete sidebar — dark, full Tailwind
<aside className="hidden lg:flex w-64 shrink-0 flex-col bg-gray-950 text-white sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
```

### 2.3 Own profile detection — Edit button

```tsx
// AthleteDetailPage.tsx
const isOwnProfile = user && profile && user.id === profile.trainer_id;

// Trong breadcrumb hoặc hero section:
{isOwnProfile && (
  <Link
    to="/profile"
    className="inline-flex items-center gap-2 px-3 h-9 border border-gray-300 rounded-lg text-body font-semibold text-gray-700 hover:border-black hover:text-black transition-colors"
  >
    <Pencil className="w-3.5 h-3.5" />
    Chỉnh sửa hồ sơ
  </Link>
)}
```

### 2.4 Mobile: sidebar ẩn, sticky CTA bottom

```tsx
// Sidebar chỉ hiện trên desktop
<aside className="hidden lg:flex ...">

// Mobile sticky CTA — đã có sẵn, giữ và cải thiện
<div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
  <button
    onClick={handleMessage}
    className="flex items-center justify-center gap-2 w-full h-11 bg-black text-white text-body font-bold uppercase tracking-widest rounded-lg"
  >
    Nhắn tin với {athlete.full_name.split(' ').pop()}
  </button>
</div>
```

### 2.5 Hero bento — Tailwind rewrite

```tsx
// Thay toàn bộ class athlete-bento-* bằng Tailwind
<div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-6">
  {/* Identity card */}
  <div className="relative bg-gray-950 rounded-xl overflow-hidden p-6 min-h-[200px] flex flex-col justify-end">
    {avatarUrl && (
      <div className="absolute inset-0">
        <img src={avatarUrl} alt="" aria-hidden className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
      </div>
    )}
    <div className="relative">
      <span className="inline-block text-overline bg-white/10 text-white/70 px-2 py-1 rounded uppercase tracking-[0.12em] mb-2">
        {athlete.specialties?.[0] || 'Pro Athlete'}
      </span>
      <h1 className="text-h1 font-black text-white leading-tight">
        {athlete.full_name}
        {athlete.is_verified && <span className="ml-2 text-caption text-green-400">✓</span>}
      </h1>
      {profile.headline && (
        <p className="text-body text-white/60 mt-1">{profile.headline}</p>
      )}
    </div>
  </div>

  {/* Stats card */}
  <div className="bg-gray-950 rounded-xl p-6 flex flex-col justify-between min-w-[180px]">
    <div className="space-y-4">
      {displayMetrics.map((m, i) => (
        <div key={i}>
          <p className="text-2xl font-black text-white">{m.value}</p>
          <p className="text-overline text-white/40 uppercase tracking-[0.12em]">{m.label}</p>
        </div>
      ))}
    </div>
    <button onClick={handleMessage} className="mt-4 flex items-center gap-2 text-body-sm font-bold text-white/80 hover:text-white transition-colors">
      Liên hệ ngay <ArrowRight className="w-4 h-4" />
    </button>
  </div>
</div>
```

### 2.6 Sections — Tailwind rewrite

```tsx
// Thay athlete-section → Tailwind pattern
<section id="athlete-section-achievements" className="py-10">
  <div className="mb-6">
    <h2 className="text-2xl font-black uppercase tracking-tight text-black">
      Thành tích & Kinh nghiệm
    </h2>
    <p className="text-body text-gray-600 mt-1">Hành trình thi đấu và huấn luyện</p>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Left: timeline */}
    {/* Right: awards */}
  </div>
</section>

// Alternating section bg — dùng Tailwind, không dùng class athlete-section-alt
<section className="bg-gray-50 -mx-4 px-4 sm:-mx-6 sm:px-6 py-10">
```

### 2.7 Packages section — inline style → Tailwind

```tsx
// Trước: inline style objects
// Sau:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {packages.map(pkg => (
    <div key={pkg.id} className={[
      'rounded-lg p-6 flex flex-col gap-3 border',
      pkg.is_popular
        ? 'bg-black text-white border-black'
        : 'bg-white text-black border-gray-200'
    ].join(' ')}>
      {pkg.is_popular && (
        <span className="text-overline text-white/50 uppercase tracking-[0.12em]">Phổ biến nhất</span>
      )}
      <h3 className="text-body-lg font-bold">{pkg.name}</h3>
      <p className="text-display-sm font-black">
        {pkg.price ? `${Number(pkg.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
        <span className="text-caption font-normal opacity-60">/{pkg.duration_months === 1 ? 'tháng' : `${pkg.duration_months} tháng`}</span>
      </p>
      <button
        onClick={handleMessage}
        className={[
          'mt-auto h-10 rounded-lg text-body font-bold uppercase tracking-widest transition-colors',
          pkg.is_popular
            ? 'bg-white text-black hover:bg-gray-100'
            : 'bg-black text-white hover:bg-gray-900'
        ].join(' ')}
      >
        Liên hệ
      </button>
    </div>
  ))}
</div>
```

---

## Sprint 3 — GymCard badge fix (standard variant)

### 3.1 Root cause

Trong `standard` variant, có **3 badge absolute** xếp chồng trong cùng vùng:
1. `absolute left-3 top-3` — venue type
2. `absolute right-3 top-3` — verified badge
3. `absolute inset-x-4 bottom-4` — price + proof

Khi venue label dài (ví dụ "Recovery & Wellness") thì badge trái tràn sang badge phải.

### 3.2 Fix

```tsx
// GymCard.tsx — standard variant thumbnail area
<div className={`relative overflow-hidden bg-gray-100 ${imageClass}`}>
  {thumbnailUrl ? (
    <img ... className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
  ) : (
    <GymCardPlaceholder label={venueLabel} />
  )}

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

  {/* TOP ROW: venue + verified — flex, không overlap */}
  <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
    <span className="text-overline bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded font-bold uppercase tracking-[0.08em] max-w-[75%] truncate">
      {venueLabel}
    </span>
    {gym.is_verified && (
      <span className="shrink-0 inline-flex items-center gap-1 text-overline bg-white text-black px-2 py-1 rounded font-bold uppercase tracking-[0.08em]">
        ✓ <span className="hidden sm:inline">Verified</span>
      </span>
    )}
  </div>

  {/* BOTTOM ROW: price + proof */}
  <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
    <span className="text-caption font-bold text-white">{formattedPrice}</span>
    <span className="text-caption text-white/80">{proofValue}</span>
  </div>
</div>
```

---

## Sprint 4 — Token & globals.css cleanup

> **Note:** Sprint này chạy sau Sprints 1-3 để tránh breaking change trong lúc đang refactor page.

### 4.1 Font unification — Inter only

**index.css:**
```css
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**globals.css — xóa:**
```css
/* XÓA: Noto Sans reference */
html {
  font-family: 'Noto Sans', ...; /* → đổi thành Inter */
}
/* XÓA: --font-display: 'Manrope' */
/* XÓA: --font-body: 'Inter' (redundant sau khi set :root) */
```

**tailwind.config.js — update:**
```js
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
  // XÓA: condensed, mono
},
```

**index.html — chỉ giữ:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<!-- XÓA: Roboto, Noto Sans, Manrope Google Fonts link -->
```

### 4.2 Xóa CSS token namespaces

**globals.css — xóa toàn bộ khối `:root` chứa `--mk-*` và `--cur-*`:**
```css
/* XÓA TOÀN BỘ: */
:root {
  --mk-bg: ...;
  --mk-bg-elevated: ...;
  /* ... tất cả --mk-* */
  --cur-surface: ...;
  /* ... tất cả --cur-* */
  --font-display: ...;
  --type-display-lg: ...;
  /* ... tất cả --type-* */
}
```

**Giữ lại trong globals.css chỉ:**
```css
:root {
  --header-height: 56px;
  --bottom-nav-height: 64px;
  /* Semantic colors dùng Tailwind color names */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
}
```

### 4.3 Button.tsx — merge CSS class cũ

Xóa khỏi `globals.css @layer components`:
```css
/* XÓA: */
.btn-base { ... }
.btn-primary { ... }
.btn-secondary { ... }
.btn-tertiary { ... }
```

Mọi nơi dùng `className="btn-primary"` → thay bằng `<Button variant="primary">`.

Mọi nơi dùng `className="btn-secondary"` → thay bằng `<Button variant="secondary">`.

**Button.tsx — bỏ dark mode variants (không dùng), thêm `full-width` size:**
```tsx
// Thêm size:
size === 'full' && 'h-11 w-full px-6 text-sm',
// Xóa tất cả dark: classes
```

### 4.4 marketplace.css — giữ file, đồng bộ token

Thay các `var(--mk-*)` reference bên trong marketplace.css bằng Tailwind color values:

```css
/* Trước: */
.marketplace-shell {
  background: var(--mk-bg);
}
.marketplace-badge--accent {
  background: var(--mk-accent-soft);
  color: var(--mk-accent-ink);
}

/* Sau: */
.marketplace-shell {
  background: theme('colors.gray.50');
}
.marketplace-badge--accent {
  background: theme('colors.amber.100');
  color: theme('colors.amber.900');
}
```

---

## Files cần xóa sau refactor

```
src/styles/athleteProfile.css     ← xóa (thay bằng Tailwind inline)
src/styles/coachProfile.css       ← xem xét cùng sprint (scope tương tự)
```

## Files cần tạo mới

```
src/components/gym-detail/
  GymHeroSection.tsx
  GymIdentityHeader.tsx
  GymStickyNav.tsx
  GymSidebarCta.tsx
  GymOverviewSection.tsx
  GymZonesSection.tsx
  GymFacilitiesSection.tsx
  GymTrainersSection.tsx
  GymPricingSection.tsx
  GymScheduleSection.tsx
  GymReviewsSection.tsx
  GymMapSection.tsx
  GymSimilarSection.tsx
```

## Checklist dev team

### Sprint 1 — GymDetailPage
- [ ] Tạo thư mục `src/components/gym-detail/`
- [ ] Extract 13 sub-components từ GymDetailPage.tsx
- [ ] Xóa FadeIn component + useInView hook
- [ ] Replace tất cả `py-16`, `py-20` → `py-10` / `py-6`
- [ ] Replace tất cả arbitrary `text-[...]` → type scale class
- [ ] Replace SummaryPill → StatCard pattern
- [ ] Fix badge overlay trong standard variant GymCard
- [ ] Rewrite GymStickyNav → full Tailwind
- [ ] Rewrite GymSidebarCta → full Tailwind light pattern
- [ ] Áp dụng 5 dashboard patterns (card/heading/row/stat/cta-link)
- [ ] Verify `getTrainerLinkPath()` routing đúng cho athlete user_type
- [ ] Test trên mobile (375px) — không có sidebar
- [ ] Test badge không chồng trên màn hình 375px

### Sprint 2 — AthleteDetailPage
- [ ] Xóa `import '../styles/athleteProfile.css'`
- [ ] Xóa file `athleteProfile.css`
- [ ] Rewrite sidebar với Tailwind (`bg-gray-950`)
- [ ] Thêm `isOwnProfile` check → Edit button
- [ ] Rewrite hero bento grid → Tailwind
- [ ] Rewrite tất cả `athlete-section-*` class → Tailwind
- [ ] Convert inline style packages → Tailwind
- [ ] Mobile: verify sidebar hidden, sticky CTA hiện đúng
- [ ] Test own profile view vs public view

### Sprint 3 — GymCard
- [ ] Fix `standard` variant badge overlay
- [ ] Test với venue label dài (> 20 chars)
- [ ] Test trên 375px, 414px, 768px

### Sprint 4 — Token cleanup
- [ ] index.html: giữ chỉ Inter Google Font link
- [ ] index.css: xóa `--font-display`, `--font-body` vars
- [ ] globals.css: xóa toàn bộ `--mk-*`, `--cur-*`, `--type-*` blocks
- [ ] globals.css: xóa `.btn-base`, `.btn-primary`, `.btn-secondary`, `.btn-tertiary`
- [ ] tailwind.config.js: bỏ `condensed`, `mono` font family
- [ ] Tìm toàn bộ `var(--mk-` trong codebase → replace bằng Tailwind
- [ ] marketplace.css: replace `var(--mk-*)` → `theme('colors.*')`
- [ ] Badge.tsx: xóa `var(--mk-*)` → Tailwind
- [ ] Button.tsx: xóa tất cả `dark:` variants

---

## Accent color per section

| Page context | Primary accent | Badge bg | Badge text |
|---|---|---|---|
| Gym detail | `amber` | `amber-100` | `amber-900` |
| Athlete detail | `slate` (dark) | `gray-800` | `white` |
| Coach detail | `violet` | `violet-100` | `violet-900` |
| Dashboard | `black` | `gray-100` | `black` |

---

*Plan hoàn tất. Implement theo thứ tự Sprint 1 → 2 → 3 → 4.*
