# GYMERVIET — Audit & Refactor Guide
> Bản kiểm tra toàn diện: Bug · Logic · UI/UX
> Codebase: `gymerviet-new` (re-design lần cuối)
> Ngày: 2026-03-09

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [🔴 CRITICAL — 2 lỗi](#2--critical--2-lỗi)
3. [🟠 HIGH — 6 lỗi](#3--high--6-lỗi)
4. [🟡 MEDIUM — 5 lỗi](#4--medium--5-lỗi)
5. [🔵 LOW — 3 lỗi](#5--low--3-lỗi)
6. [✅ Những điều hoạt động tốt](#6--những-điều-hoạt-động-tốt)
7. [Kế hoạch fix theo thứ tự ưu tiên](#7-kế-hoạch-fix-theo-thứ-tự-ưu-tiên)

---

## 1. Tổng quan

| Mức độ | Số lượng | Tác động |
|--------|----------|----------|
| 🔴 CRITICAL | 2 | Tính năng hoàn toàn broken, 404 hoặc trang orphan |
| 🟠 HIGH | 6 | Lỗi logic/UX ảnh hưởng trực tiếp người dùng |
| 🟡 MEDIUM | 5 | Hiệu năng, trải nghiệm chưa đúng, logic sai ngầm |
| 🔵 LOW | 3 | Code quality, debug code còn sót |
| **Tổng** | **16** | |

---

## 2. 🔴 CRITICAL — 2 lỗi

---

### [C-001] URL mismatch: `checkReviewEligibility` — 404 mỗi lần check

**File:** `frontend/src/services/gymService.ts:40` và `backend/src/routes/gym.ts:8`

**Mô tả:**
Frontend và backend dùng thứ tự URL segment khác nhau. Express sẽ match `/gyms/check-review/...` nhưng frontend gọi `/gyms/:gymId/check-review` — Express bắt đó là route `/:gymId` với `gymId = "check-review"`, sau đó `/check-review` là path không tồn tại → **404**.

```
// ❌ Frontend gọi:
GET /gyms/abc123/check-review

// ✅ Backend khai báo:
GET /gyms/check-review/:gymId  →  tức là /gyms/check-review/abc123
```

**Hậu quả:** Nút "Viết đánh giá" không bao giờ hiển thị, mọi user đều bị chặn review.

**Fix — 1 trong 2 cách (khuyên dùng cách A):**

**Cách A — Sửa backend route cho nhất quán với REST convention:**
```typescript
// backend/src/routes/gym.ts — dòng 8
// Thay:
router.get('/check-review/:gymId', authenticate, gymController.checkReviewEligibility);
// Thành:
router.get('/:gymId/check-review', authenticate, gymController.checkReviewEligibility);
```
> ⚠️ Đồng thời cập nhật controller: `req.params.gymId` vẫn đúng tên, không cần đổi.

**Cách B — Sửa frontend:**
```typescript
// frontend/src/services/gymService.ts — dòng 40
// Thay:
const response = await apiClient.get(`/gyms/${gymId}/check-review`);
// Thành:
const response = await apiClient.get(`/gyms/check-review/${gymId}`);
```
> ⚠️ Cách B có thể gây nhầm lẫn sau vì không theo REST convention. Dùng cách A.

---

### [C-002] `ProfilePublic.tsx` — Trang orphan, không có route

**File:** `frontend/src/App.tsx`, `frontend/src/pages/ProfilePublic.tsx`

**Mô tả:**
`ProfilePublic.tsx` (313 dòng) là một trang hoàn chỉnh với Redux dispatch, UI đầy đủ, nhưng không được khai báo route nào trong `App.tsx`. Không ai có thể truy cập trang này qua URL.

Thêm vào đó, bên trong chính `ProfilePublic.tsx`, khi có lỗi nó link tới `/profile/:trainerId?view=public` — một URL cũng không tồn tại.

```tsx
// ProfilePublic.tsx:40 — broken link
<Link to={`/profile/${trainerId}?view=public`}>Xem thông tin cơ bản</Link>
// Route /profile/:trainerId không tồn tại trong App.tsx
```

**Fix:**

**Bước 1 — Thêm route vào `App.tsx`:**
```tsx
// frontend/src/App.tsx — thêm vào imports
import ProfilePublic from './pages/ProfilePublic';

// Thêm vào router, gần coach/profile routes:
{ path: '/profile/public/:trainerId', element: <ProfilePublic /> },
```

**Bước 2 — Sửa broken link trong `ProfilePublic.tsx:40`:**
```tsx
// Thay:
<Link to={`/profile/${trainerId}?view=public`}>Xem thông tin cơ bản</Link>
// Thành:
<Link to={`/coaches/${trainerId}`}>Xem thông tin cơ bản</Link>
```

**Bước 3 — Cân nhắc:** `ProfileCV.tsx` (trang `/coach/:slug`) và `ProfilePublic.tsx` (trang `/profile/public/:trainerId`) có thể overlap mục đích. Nếu `ProfileCV` đã đủ, cân nhắc dùng `ProfilePublic` như fallback khi trainer chưa có slug.

---

## 3. 🟠 HIGH — 6 lỗi

---

### [H-001] `inviteTrainer()` — sai argument signature, TypeScript sẽ error

**File:** `frontend/src/components/GymBranchEditor.tsx:156` vs `frontend/src/services/gymService.ts:126`

**Mô tả:**
`gymService.inviteTrainer` nhận `(branchId: string, data: { trainer_id, role_at_gym })` — 2 tham số.
`GymBranchEditor` gọi `gymService.inviteTrainer(branch.id, { trainer_id: ..., role_at_gym: ... })` — đúng.

Tuy nhiên, xem lại **backend route**: `POST /gym-owner/branches/:branchId/trainers/invite` nhận `trainer_id` và `role_at_gym` trong body — **đúng**. Vấn đề là `role_at_gym` trong GymBranchEditor được hardcode là `'Main Coach'` thay vì cho user chọn.

```tsx
// GymBranchEditor.tsx:156 — hardcoded role
await gymService.inviteTrainer(branch.id, { trainer_id: trainerId, role_at_gym: 'Main Coach' });
```

**Fix:**
```tsx
// Thêm state cho role selection:
const [inviteRole, setInviteRole] = useState('Huấn luyện viên');

// Trong UI trước nút mời, thêm:
<select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
  className="input-field text-sm">
  <option value="Huấn luyện viên">Huấn luyện viên</option>
  <option value="PT Chính">PT Chính</option>
  <option value="PT Phụ">PT Phụ</option>
  <option value="Yoga Instructor">Yoga Instructor</option>
</select>

// Thay hardcode:
await gymService.inviteTrainer(branch.id, { trainer_id: trainerId, role_at_gym: inviteRole });
```

---

### [H-002] `GymRegisterPage` bỏ qua `?step=3` từ `ProtectedRoute` — pending state không hiển thị

**File:** `frontend/src/pages/GymRegisterPage.tsx` và `frontend/src/components/ProtectedRoute.tsx:44`

**Mô tả:**
`ProtectedRoute` redirect gym_owner đang pending về `/gym-owner/register?step=3` với mục đích hiển thị màn hình "đang chờ duyệt". Nhưng `GymRegisterPage` không có `useSearchParams`, không đọc `?step=3` → luôn show form đăng ký mới, không phải màn hình pending.

Kết quả: gym_owner đang chờ duyệt nhìn thấy form đăng ký trống, có thể submit lại và gây duplicate.

**Fix:**
```tsx
// frontend/src/pages/GymRegisterPage.tsx — thêm vào đầu file:
import { useSearchParams } from 'react-router-dom';

// Trong component, thêm:
const [searchParams] = useSearchParams();
const isPendingView = searchParams.get('step') === '3';

// Thêm condition render đầu component (trước return chính):
if (isPendingView || user?.gym_owner_status === 'pending_review') {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold mb-2">Hồ sơ đang chờ phê duyệt</h2>
        <p className="text-gray-500 text-sm">
          Chúng tôi sẽ xem xét trong vòng 24–48 giờ. Bạn sẽ nhận email khi được duyệt.
        </p>
      </div>
    </div>
  );
}
```

> Lưu ý: `submitted` state trong component đã có màn hình pending tương tự — hợp nhất 2 case này.

---

### [H-003] `Dashboard.tsx` — thứ tự `import` vi phạm ES Module convention

**File:** `frontend/src/pages/Dashboard.tsx:1-19`

**Mô tả:**
File có import chia làm 2 khối tách rời bởi `OverviewData` interface — đây là lỗi cú pháp không gây crash nhưng vi phạm convention, có thể gây lỗi với strict linters và confuse tooling.

```tsx
// ❌ Hiện tại (imports bị ngắt giữa bởi interface):
import { useEffect, useState } from 'react';
// ... 6 imports
interface OverviewData { ... }   // ← Interface chen giữa imports
import { gymService } from '../services/gymService';
import type { GymTrainerLink } from '../types';
import { useToast } from '../components/Toast';
```

**Fix:**
```tsx
// ✅ Đưa tất cả imports lên đầu, interface xuống sau:
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import AdminGymApproval from '../components/AdminGymApproval';
import AdminReviewManagement from '../components/AdminReviewManagement';
import { gymService } from '../services/gymService';
import type { GymTrainerLink } from '../types';
import { useToast } from '../components/Toast';

// Sau đó mới đến interfaces:
interface OverviewData {
    active_clients?: number;
    // ...
}
```

---

### [H-004] `GymDetailPage` — `window.location.reload()` sau submit review

**File:** `frontend/src/pages/GymDetailPage.tsx:529`

**Mô tả:**
Sau khi user submit review, page full reload (`window.location.reload()`). Toàn bộ state bị reset: active branch, lightbox, scroll position. Đây là anti-pattern với SPA.

```tsx
// ❌ Hiện tại:
<GymReviewForm gymId={gym.id} branchId={activeBranchId}
  onSuccess={() => window.location.reload()} />
```

**Fix:**
```tsx
// ✅ Thay bằng refetch state tại chỗ:
const [reviewRefreshTick, setReviewRefreshTick] = useState(0);

// Trong JSX:
<GymReviewForm gymId={gym.id} branchId={activeBranchId}
  onSuccess={() => setReviewRefreshTick(t => t + 1)} />

// GymReviewList cần nhận prop để trigger refetch:
<GymReviewList gymId={gym.id} refreshTick={reviewRefreshTick} />

// Trong GymReviewList.tsx — thêm refreshTick vào useEffect deps:
useEffect(() => { fetchReviews(); }, [gymId, refreshTick]);
```

---

### [H-005] `21x alert()` khắp codebase — `Toast` component đã có nhưng không được dùng

**Files:** `GymBranchEditor.tsx` (13 lần), `GymOwnerDashboard.tsx` (5 lần), `ProfileProgressTab.tsx` (1 lần), `ProfileCoachTab.tsx` (2 lần)

**Mô tả:**
`useToast()` hook đã được build sẵn và được dùng tốt ở `CoachDashboard`, `WorkoutsPage`. Nhưng các component khác vẫn dùng `alert()` — là native browser dialog, block UI, không đồng bộ với design system.

**Fix template cho `GymBranchEditor.tsx`:**
```tsx
// Thêm vào đầu component:
import { useToast } from './Toast'; // hoặc path đúng

const GymBranchEditor: React.FC<GymBranchEditorProps> = ({ branch, onClose, onUpdate }) => {
    const { toast, ToastComponent } = useToast();
    // ...

    const handleSaveInfo = async () => {
        setLoading(true);
        try {
            await gymService.updateBranch(branch.id, infoForm);
            toast.success('Đã cập nhật thông tin cơ bản'); // ← thay alert()
            onUpdate();
        } catch (error) {
            toast.error('Lỗi cập nhật thông tin'); // ← thay alert()
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {ToastComponent} {/* ← nhớ render */}
            {/* ... rest of JSX */}
        </div>
    );
};
```

Áp dụng tương tự cho toàn bộ 21 chỗ còn lại.

---

### [H-006] `MessagesPage` — Socket listener re-register gây stale closure

**File:** `frontend/src/pages/MessagesPage.tsx:35-51`

**Mô tả:**
`useEffect` đăng ký `handleMessage` vào socket với `[accessToken, activePartner]` trong dependency array. Mỗi khi `activePartner` thay đổi, effect unmount → re-mount, disconnect rồi reconnect socket. Ngoài ra, `handleMessage` closure capture `activePartner` và `user` tại thời điểm đăng ký — các message đến khi đang switch conversation có thể bị bỏ qua.

```tsx
// ❌ Hiện tại — re-register socket mỗi khi đổi conversation:
useEffect(() => {
    if (!accessToken) return;
    socketService.connect(accessToken);
    const handleMessage = (data: any) => {
        // activePartner là giá trị cũ do closure
        if (data.message.sender_id !== activePartner) return prev;
        // ...
    };
    socketService.onMessageReceive(handleMessage);
    return () => { socketService.offMessageReceive(); };
}, [accessToken, activePartner]); // ← activePartner ở đây gây re-connect
```

**Fix — tách socket connect ra khỏi message handler:**
```tsx
// ✅ Sử dụng useRef để tránh stale closure:
const activePartnerRef = useRef<string | null>(null);

// Sync ref khi state thay đổi:
useEffect(() => {
    activePartnerRef.current = activePartner;
}, [activePartner]);

// Socket chỉ connect 1 lần khi có token:
useEffect(() => {
    if (!accessToken) return;
    socketService.connect(accessToken);

    const handleMessage = (data: any) => {
        // Dùng ref thay vì closure value:
        if (data.message.sender_id !== activePartnerRef.current) return;
        setMessages(prev => [...prev, data.message]);
        loadConversations();
    };

    socketService.onMessageReceive(handleMessage);
    return () => { socketService.offMessageReceive(); };
}, [accessToken]); // ← Chỉ re-run khi token thay đổi
```

---

## 4. 🟡 MEDIUM — 5 lỗi

---

### [M-001] `GymOwnerDashboard` — Stats API gọi đúng nhưng UI chưa hiển thị trainer count

**File:** `frontend/src/pages/GymOwnerDashboard.tsx`

**Mô tả:**
`gymService.getGymStats(myGym.id)` gọi đúng endpoint `/gym-owner/stats/:centerId`. Stats về `total_trainers`, `total_branches` được fetch và lưu vào state nhưng tab "Huấn luyện viên" trong GymOwnerDashboard hiển thị danh sách trainers từ `gym.branches[].trainer_links` — không refetch khi trainer được invite/remove qua GymBranchEditor.

**Fix:**
```tsx
// Sau khi GymBranchEditor gọi onUpdate(), thêm refetch stats:
const handleBranchUpdate = async () => {
    await fetchMyGym(); // đã refetch gym
    // Refetch stats riêng để cập nhật KPI cards:
    if (gym) {
        const statsRes = await gymService.getGymStats(gym.id);
        if (statsRes.success) setStats(statsRes.stats);
    }
};

// Trong JSX:
<GymBranchEditor branch={editingBranch} onClose={() => setEditingBranch(null)} onUpdate={handleBranchUpdate} />
```

---

### [M-002] `Profile.tsx` — `gym_owner` và `admin` chỉ thấy tab "Cá nhân", không có thông báo

**File:** `frontend/src/pages/Profile.tsx:52-65`

**Mô tả:**
Logic tabs chỉ check `trainer` hoặc `athlete` để show proTabs. Gym owner và admin được assign `normalTabs` (chỉ 1 tab "Thông tin cá nhân") mà không có giải thích tại sao thiếu tabs khác. Với gym_owner, quản lý gym là ở `/gym-owner` — hợp lý — nhưng không có shortcut link.

**Fix:**
```tsx
// Sau phần normalTabs, thêm render conditional:
{(user.user_type === 'gym_owner') && (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm font-medium text-gray-700">Quản lý phòng tập</p>
        <p className="text-xs text-gray-500 mt-1">
            Thông tin chi nhánh, huấn luyện viên và bảng giá được quản lý tại trang riêng.
        </p>
        <Link to="/gym-owner" className="btn-primary text-xs mt-3 inline-block">
            Đến trang Quản lý Gym →
        </Link>
    </div>
)}
```

---

### [M-003] `App.tsx` — Không có lazy loading, bundle 1.27MB

**File:** `frontend/src/App.tsx`

**Mô tả:**
Toàn bộ 35 page imports là static. Vite build cho 1 chunk `index.js` nặng 1,270 KB (gzip: 376 KB) — vượt ngưỡng khuyến nghị 500 KB. Tất cả pages tải cùng lúc ngay cả khi user chỉ mở trang chủ.

**Fix:**
```tsx
// frontend/src/App.tsx — thay static imports bằng lazy:
import { lazy, Suspense } from 'react';

// Các pages nặng (ưu tiên lazy trước):
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const GymDetailPage    = lazy(() => import('./pages/GymDetailPage'));
const GymOwnerDashboard = lazy(() => import('./pages/GymOwnerDashboard'));
const ProfileCV        = lazy(() => import('./pages/ProfileCV'));
const CoachDetail      = lazy(() => import('./pages/CoachDetailPage'));
const ProgramsPage     = lazy(() => import('./pages/ProgramsPage'));
const MessagesPage     = lazy(() => import('./pages/MessagesPage'));
const WorkoutsPage     = lazy(() => import('./pages/WorkoutsPage'));

// Pages legal (rất ít traffic, lazy là ưu tiên cao):
const AboutPage        = lazy(() => import('./pages/legal/AboutPage'));
// ... tương tự cho các legal pages khác

// Wrap router với Suspense fallback:
function App() {
    return (
        <HelmetProvider>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AuthRestorer>
                        <Suspense fallback={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                            </div>
                        }>
                            <RouterProvider router={router} />
                        </Suspense>
                    </AuthRestorer>
                </QueryClientProvider>
            </Provider>
        </HelmetProvider>
    );
}
```

**Kết quả dự kiến:** Bundle giảm từ 1,270KB xuống ~300KB chunk chính.

---

### [M-004] `GymReviewList.tsx` — `refreshTick` chưa có (liên quan H-004)

**File:** `frontend/src/components/GymReviewList.tsx`

**Mô tả:**
Hiện tại `GymReviewList` fetch reviews 1 lần khi mount, không có cơ chế refetch từ bên ngoài. Kết hợp với fix H-004, component cần nhận `refreshTick` prop.

**Fix:**
```tsx
// GymReviewList.tsx
interface GymReviewListProps {
    gymId: string;
    refreshTick?: number; // ← thêm prop này
}

const GymReviewList: React.FC<GymReviewListProps> = ({ gymId, refreshTick = 0 }) => {
    // ...
    useEffect(() => {
        fetchReviews();
    }, [gymId, refreshTick]); // ← thêm refreshTick vào deps
```

---

### [M-005] Inconsistency: `Coaches.tsx` dùng TanStack Query, `Gyms.tsx` dùng manual `useState`

**Files:** `frontend/src/pages/Coaches.tsx`, `frontend/src/pages/Gyms.tsx`

**Mô tả:**
Hai trang listing tương tự nhau nhưng dùng 2 pattern fetch data khác nhau hoàn toàn:
- `Coaches.tsx`: `useQuery` (TanStack) — có cache, dedup, background refetch
- `Gyms.tsx`: manual `useState + useEffect + try/catch` — không có cache, không dedup

Điều này gây không nhất quán, `Gyms.tsx` sẽ fetch lại mỗi lần navigate đến trang.

**Fix — chuẩn hóa Gyms.tsx theo TanStack Query:**
```tsx
// Gyms.tsx — thay manual fetch bằng useQuery
import { useQuery } from '@tanstack/react-query';

// Xóa: useState loading/error, useEffect fetchGyms
// Thêm:
const { data, isLoading, isError } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => gymService.listGyms({ limit: 60, sort: 'views' }),
    staleTime: 2 * 60 * 1000, // 2 phút cache
});

const gyms: GymCenter[] = data?.gyms || [];
// Thay loading → isLoading, error → isError trong JSX
```

---

## 5. 🔵 LOW — 3 lỗi

---

### [L-001] `console.error` còn sót trong 10+ file production

**Files:** `GymReviewList.tsx`, `FeaturedCoaches.tsx`, `AdminReviewManagement.tsx`, `AdminGymApproval.tsx`, `ProgramsPage.tsx`, `WorkoutsPage.tsx`, `MessagesPage.tsx`, `GymOwnerDashboard.tsx`, `CoachDetailPage.tsx`

**Fix:**
Trong production build, console.error không crash app nhưng leak thông tin vào DevTools của user. Dùng một logger wrapper:

```ts
// frontend/src/lib/logger.ts
const isProd = import.meta.env.PROD;

export const logger = {
    error: (...args: unknown[]) => { if (!isProd) console.error(...args); },
    warn: (...args: unknown[])  => { if (!isProd) console.warn(...args); },
    log: (...args: unknown[])   => { if (!isProd) console.log(...args); },
};
```

```tsx
// Thay toàn bộ console.error bằng:
import { logger } from '../lib/logger';
// ...
} catch (err) { logger.error(err); }
```

---

### [L-002] 33 implicit `any` types trong TypeScript

**Các file chính:** `dashboardController.ts`, `gymController.ts`, `GymOwnerDashboard.tsx`, `CoachDetailPage.tsx`

**Mô tả:**
`any` type tắt TypeScript hoàn toàn, ẩn bug tại compile time.

**Fix — priority cao nhất:**
```tsx
// GymOwnerDashboard.tsx — gymTrainers state:
// Thay: const [gymTrainers, setGymTrainers] = useState<any[]>([]);
// Thành:
import type { GymTrainerLink } from '../types';
const [gymTrainers, setGymTrainers] = useState<GymTrainerLink[]>([]);

// GymDetailPage.tsx:
// Thay: const [gymTrainers, setGymTrainers] = useState<any[]>([]);
// Thành: useState<GymTrainerLink[]>([])

// Backend dashboardController.ts — lambda tham số:
// Thay: .filter((p: any) => p.is_published)
// Thành: .filter((p: Program) => p.is_published)
// (import Program entity)
```

---

### [L-003] `Home.tsx` thiếu `import React` — tiềm năng lỗi với một số configs

**File:** `frontend/src/pages/Home.tsx`

**Mô tả:**
Với `"jsx": "react-jsx"` (React 17+), không cần `import React`. Tuy nhiên bất kỳ config nào cũ hơn hoặc tool nào cần explicit import sẽ fail. Các file khác đều import React hoặc destructure hooks.

**Fix:**
```tsx
// Thêm vào đầu Home.tsx (optional nhưng safe):
import React from 'react';
// hoặc nếu cần hooks:
import { useState } from 'react';
```

---

## 6. ✅ Những điều hoạt động tốt

Những phần này **không cần sửa**, đã được implement đúng:

| Khu vực | Nhận xét |
|---------|----------|
| **Design system** | Tailwind config v2.0 + globals.css chuẩn: tokens, dark mode `media`, Lexend font, 8px radius — nhất quán |
| **Auth flow** | Token refresh interceptor trong `api.ts`, `AuthRestorer` trong App, ProtectedRoute với role check — solid |
| **Socket.IO** | Kết nối đúng, cleanup trên unmount, re-connect khi token thay đổi — pattern đúng |
| **GymDetailPage** | Layout wpresidence-style: hero gallery, sticky nav, 2-col grid, lightbox — UI/UX tốt |
| **ProfileCV** | Slug-based routing, SEO meta, stat counters, dark/light theme — well-built |
| **Admin routes** | `router.use(authenticate, adminOnly)` global — tất cả admin endpoints đều được bảo vệ đúng |
| **gymAdmin routes** | Tương tự, `router.use(authenticate, adminOnly)` đầy đủ |
| **GymReviewForm/List** | Props và API call đúng, rating UI đơn giản và clear |
| **NotificationBell** | Polling 60s + Socket.IO push, click-outside dismiss, unread badge — UX tốt |
| **Toast component** | `useToast()` hook sạch, animation đẹp, dismiss button — chỉ cần dùng nhất quán hơn |
| **BottomNav** | 5 items, active state, safe-area padding iOS — đúng spec mobile |
| **Header scroll behavior** | Hide on scroll down, show on scroll up, backdrop blur — UX chuẩn |
| **GymBranchEditor** | 9 tabs đầy đủ tính năng — comprehensive nhất của app |
| **CoachDetailPage** | VietQR payment flow, subscription check, similar coaches — functional |
| **TypeScript frontend** | 0 errors `tsc --noEmit` (33 `any` là warning, không crash) |

---

## 7. Kế hoạch fix theo thứ tự ưu tiên

### Sprint 1 — Fix ngay (30 phút)

```
[C-001] Sửa URL checkReview — 1 dòng backend route
[C-002] Thêm route ProfilePublic vào App.tsx — 3 dòng
[H-003] Sắp xếp lại import trong Dashboard.tsx — 5 phút
[H-004] Thay window.location.reload() bằng refreshTick — 20 phút
```

### Sprint 2 — Fix trong tuần (2-3 giờ)

```
[H-005] Replace 21x alert() bằng useToast() — ~1 giờ
[H-006] Fix MessagesPage socket stale closure với useRef — 30 phút
[H-002] Thêm useSearchParams vào GymRegisterPage — 20 phút
[H-001] Thêm role selection cho inviteTrainer trong GymBranchEditor — 20 phút
```

### Sprint 3 — Improve (1 ngày)

```
[M-003] Lazy loading App.tsx — ~2 giờ (impact lớn nhất: bundle -60%)
[M-005] Chuẩn hóa Gyms.tsx dùng TanStack Query — 1 giờ
[M-004] Thêm refreshTick vào GymReviewList — 20 phút
[M-001] Fix stats refetch sau GymBranchEditor onUpdate — 20 phút
[M-002] Thêm gym_owner shortcut trong Profile.tsx — 15 phút
```

### Sprint 4 — Cleanup (2-3 giờ)

```
[L-001] Thay console.error bằng logger wrapper — 1 giờ
[L-002] Gán type cho 33 'any' quan trọng nhất — 1 giờ
[L-003] Thêm React import vào Home.tsx — 1 phút
```

---

*Tổng thời gian ước tính: Sprint 1 (30p) + Sprint 2 (3h) + Sprint 3 (1 ngày) + Sprint 4 (3h)*
*Không có fix nào yêu cầu thay đổi schema DB hoặc migration.*
