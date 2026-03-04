# GYMERVIET — BÁO CÁO LỖI & HƯỚNG DẪN XỬ LÝ CHO DEVELOPER

> Phiên bản review: gymerviet_final.zip  
> Ngày: 2026  
> Mức độ nghiêm trọng: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

## TÓM TẮT TỔNG QUAN

| Mức độ | Số lỗi |
|--------|--------|
| 🔴 Critical | 4 |
| 🟠 High | 5 |
| 🟡 Medium | 7 |
| 🟢 Low / UX | 6 |
| Tính năng thiếu (planned) | 7 |
| **Tổng** | **29** |

---

## 🔴 CRITICAL — Chặn hoạt động hoàn toàn

---

### BUG-001 · RegisterSchema không cho phép `gym_owner` đăng ký

**File:** `backend/src/schemas/auth.ts`

**Mô tả:** Zod schema validate `user_type` chỉ cho phép `['athlete', 'trainer']`, bỏ qua `gym_owner`. Mọi request đăng ký với `user_type: 'gym_owner'` sẽ bị từ chối với `HTTP 400 Validation failed`.

**Code lỗi:**
```typescript
// ❌ HIỆN TẠI — KHÔNG CHO PHÉP gym_owner
user_type: z.enum(['athlete', 'trainer']),
```

**Fix:**
```typescript
// ✅ SỬA — Thêm gym_owner vào enum
user_type: z.enum(['athlete', 'trainer', 'gym_owner']),
```

**File liên quan cần check:** `authService.ts` — method `refreshToken` cũng thiếu `'gym_owner'` trong type signature:
```typescript
// ❌ HIỆN TẠI
async refreshToken(userId: string, email: string, user_type: 'user' | 'athlete' | 'trainer' | 'admin')

// ✅ SỬA
async refreshToken(userId: string, email: string, user_type: 'user' | 'athlete' | 'trainer' | 'gym_owner' | 'admin')
```

---

### BUG-002 · Route conflict: `/check-review/:gymId` và `/trainer/:trainerId` bị shadow bởi `/:gymId`

**File:** `backend/src/routes/gym.ts`

**Mô tả:** Express routing khớp từ trên xuống. Các route `GET /check-review/:gymId` và `GET /trainer/:trainerId` được khai báo SAU `GET /:gymId` nên sẽ KHÔNG BAO GIỜ được gọi đến. Khi frontend gọi `/api/v1/gyms/check-review/abc-id`, Express sẽ khớp với `/:gymId` và gọi `getGymCenter` thay vì `checkReviewEligibility`.

**Code lỗi:**
```typescript
// ❌ HIỆN TẠI — thứ tự sai
router.get('/:gymId', gymController.getGymCenter);                        // ← khớp trước
router.get('/:gymId/branches/:branchId', gymController.getBranchDetail);
router.get('/:gymId/trainers', gymController.getGymTrainers);
router.get('/:gymId/reviews', gymController.getGymReviews);
router.get('/trainer/:trainerId', gymController.getTrainerGyms);          // ← DEAD ROUTE
// ...
router.get('/check-review/:gymId', authenticate, gymController.checkReviewEligibility); // ← DEAD ROUTE
```

**Fix — Đặt specific routes TRƯỚC wildcard routes:**
```typescript
// ✅ SỬA — specific routes đặt đầu tiên
router.get('/check-review/:gymId', authenticate, gymController.checkReviewEligibility);
router.get('/trainer/:trainerId', gymController.getTrainerGyms);

// Sau đó mới đến wildcard routes
router.get('/', gymController.listGyms);
router.get('/:gymId', gymController.getGymCenter);
router.get('/:gymId/branches/:branchId', gymController.getBranchDetail);
router.get('/:gymId/trainers', gymController.getGymTrainers);
router.get('/:gymId/reviews', gymController.getGymReviews);

// Review CRUD (cần auth)
router.post('/:gymId/reviews', authenticate, gymController.createReview);
router.put('/:gymId/reviews/:reviewId', authenticate, gymController.updateReview);
router.delete('/:gymId/reviews/:reviewId', authenticate, gymController.deleteReview);
```

---

### BUG-003 · `authController.getProfile` và `authService.getProfile` không trả về `gym_owner_status`

**File:** `backend/src/controllers/authController.ts`, `backend/src/services/authService.ts`

**Mô tả:** API `GET /api/v1/auth/me` trả về object user thiếu field `gym_owner_status`. `GymRegisterPage.tsx` sau khi submit form sẽ gọi `authApi.getProfile()` để refresh Redux state, nhưng vì response thiếu field này, `user.gym_owner_status` sẽ là `undefined` thay vì `'pending_review'`, khiến màn hình "Đang chờ duyệt" không bao giờ hiển thị.

**Code lỗi — authService.ts:**
```typescript
// ❌ HIỆN TẠI — thiếu gym_owner_status
async getProfile(userId: string) {
    const user = await getUserRepo().findOneBy({ id: userId });
    return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        // gym_owner_status bị bỏ qua!
    };
}
```

**Fix:**
```typescript
// ✅ SỬA — thêm gym_owner_status và các field quan trọng khác
async getProfile(userId: string) {
    const user = await getUserRepo().findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        avatar_url: user.avatar_url,
        bio: user.bio,
        is_verified: user.is_verified,
        gym_owner_status: user.gym_owner_status,  // ← THÊM VÀO
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}
```

**Lưu ý bổ sung:** `authService.register` cũng nên trả về `gym_owner_status`:
```typescript
// Trong authService.register(), thêm vào return object:
gym_owner_status: newUser.gym_owner_status,
```

---

### BUG-004 · `GymTrainerManager` gọi API sai endpoint — truyền `branchId` vào chỗ cần `gymId`

**File:** `frontend/src/components/GymTrainerManager.tsx` (dòng ~36)

**Mô tả:** Component gọi `gymService.getGymTrainers(activeBranchId)` nhưng hàm `getGymTrainers` gọi `GET /api/v1/gyms/:gymId/trainers` — nghĩa là nó truyền `branchId` như thể là `gymId`. Kết quả: không có trainer nào được trả về vì không có GymCenter nào có ID trùng với branchId.

**Code lỗi:**
```typescript
// ❌ HIỆN TẠI
const res = await gymService.getGymTrainers(activeBranchId); // ← sai: branchId ≠ gymId
```

**Fix — Option A (nên dùng):** Tạo endpoint owner-specific để lấy trainers theo branchId:
```typescript
// Thêm vào gymOwnerController:
async getBranchTrainers(req, res) {
    const branchId = String(req.params.branchId);
    const linkRepo = AppDataSource.getRepository(GymTrainerLink);
    const links = await linkRepo.find({
        where: { branch_id: branchId },
        relations: ['trainer'],
    });
    res.json({ success: true, trainers: links });
}

// Thêm route vào gymOwner.ts:
router.get('/branches/:branchId/trainers', gymOwnerOnly, gymOwnerController.getBranchTrainers);

// Thêm vào gymService.ts (frontend):
async getBranchTrainers(branchId: string) {
    const response = await apiClient.get(`/gym-owner/branches/${branchId}/trainers`);
    return response.data;
}
```

```typescript
// GymTrainerManager.tsx — Fix:
const res = await gymService.getBranchTrainers(activeBranchId); // ← đúng
```

**Fix — Option B (tạm thời):** Truyền `gymCenterId` vào component thay vì chỉ branches:
```tsx
// GymOwnerDashboard.tsx:
<GymTrainerManager branches={branches} gymCenterId={gym.id} />

// GymTrainerManager.tsx:
const res = await gymService.getGymTrainers(gymCenterId); // dùng gymId đúng
```

---

## 🟠 HIGH — Ảnh hưởng nghiêm trọng tới luồng chính

---

### BUG-005 · `GymOwnerDashboard` — Thống kê hardcoded, không gọi API

**File:** `frontend/src/pages/GymOwnerDashboard.tsx` (dòng ~83)

**Mô tả:** Stats card "Đánh giá" hiển thị giá trị hardcoded `'4.8'` và "HLV liên kết" hardcoded `0`. Dashboard không gọi `gymService.getGymStats()` dù API đã được implement.

**Code lỗi:**
```typescript
// ❌ HIỆN TẠI — hardcoded
{ label: 'Đánh giá', val: '4.8' },
{ label: 'HLV liên kết', val: 0 },
```

**Fix:**
```typescript
// Thêm state:
const [stats, setStats] = useState<{ total_views: number; total_trainers: number; avg_rating: number; total_reviews: number; total_branches: number } | null>(null);

// Thêm vào fetchMyGym():
const statsRes = await gymService.getGymStats(res.gyms[0].id);
if (statsRes.success) setStats(statsRes.stats);

// Trong JSX:
{ label: 'Tổng lượt xem', val: stats?.total_views ?? gym.view_count },
{ label: 'Chi nhánh', val: stats?.total_branches ?? branches.length },
{ label: 'Đánh giá TB', val: stats?.avg_rating ? `★ ${stats.avg_rating}` : 'N/A' },
{ label: 'HLV liên kết', val: stats?.total_trainers ?? 0 },
```

---

### BUG-006 · `GymOwnerDashboard` — Tab Settings không lưu dữ liệu

**File:** `frontend/src/pages/GymOwnerDashboard.tsx` (tab `settings`)

**Mô tả:** Form Cài đặt dùng `defaultValue` (uncontrolled) thay vì `value` (controlled). Nút "Lưu thay đổi" không có handler gọi API.

**Fix:**
```typescript
// Thêm state cho settings form:
const [settingsForm, setSettingsForm] = useState({ name: gym.name, description: gym.description || '' });
const [saving, setSaving] = useState(false);

const handleSaveSettings = async () => {
    setSaving(true);
    try {
        const res = await gymService.updateGymCenter(gym.id, settingsForm);
        if (res.success) {
            setGym(prev => prev ? { ...prev, ...settingsForm } : prev);
            // Show toast success
        }
    } finally {
        setSaving(false);
    }
};

// JSX — dùng controlled inputs:
<input
    type="text"
    value={settingsForm.name}
    onChange={(e) => setSettingsForm(p => ({ ...p, name: e.target.value }))}
    className="form-input w-full"
/>
<button onClick={handleSaveSettings} disabled={saving} className="btn-primary w-full py-4 text-sm mt-6">
    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
</button>
```

---

### BUG-007 · `GymOwnerDashboard` — Các nút "Thêm chi nhánh" và "Cập nhật" không có handler

**File:** `frontend/src/pages/GymOwnerDashboard.tsx` (tab `branches`)

**Mô tả:** Nút "Thêm chi nhánh mới" và "Cập nhật" trên mỗi branch card chỉ là UI placeholder, không có logic.

**Fix tạm thời (minimal viable):**
```typescript
// Thêm handler mở modal/form inline:
const [editingBranch, setEditingBranch] = useState<GymBranch | null>(null);
const [showAddBranch, setShowAddBranch] = useState(false);

// Nút "Cập nhật" → setEditingBranch(branch)
// Nút "Thêm" → setShowAddBranch(true)

// Form inline với các field: branch_name, address, city, district, phone
// Submit → gymService.updateBranch() hoặc API tạo branch mới (cần endpoint)
```

**Lưu ý:** Backend chưa có endpoint tạo branch mới. Cần thêm:
```typescript
// gymOwner.ts routes:
router.post('/centers/:centerId/branches', gymOwnerOnly, gymOwnerController.createBranch);

// gymOwnerController.ts:
async createBranch(req, res) {
    const centerId = String(req.params.centerId);
    const ownerId = req.user!.user_id;
    // validate ownership → create branch
}
```

---

### BUG-008 · `GymRegisterPage` — sau khi đăng ký thành công không có redirect/feedback rõ ràng

**File:** `frontend/src/pages/GymRegisterPage.tsx`

**Mô tả:** Sau khi submit thành công, component `setLoading(false)` rồi... không làm gì. Nó chỉ hiển thị trạng thái pending nếu `user.gym_owner_status === 'pending_review'` — nhưng do BUG-003, field này không được cập nhật trong Redux. Kết quả: form trở về trạng thái ban đầu, user không biết đã submit thành công hay chưa.

**Fix (kết hợp với fix BUG-003):**
```typescript
const [submitted, setSubmitted] = useState(false);

// Trong handleSubmit, sau khi success:
setSubmitted(true);

// Thêm condition render:
if (submitted || user?.gym_owner_status === 'pending_review') {
    return <PendingView />;
}
```

---

### BUG-009 · `gymService.registerGym` (backend) — không kiểm tra gym trùng lặp

**File:** `backend/src/services/gymService.ts`

**Mô tả:** Một gym owner có thể gọi `POST /gym-owner/register` nhiều lần và tạo ra nhiều GymCenter cho cùng một owner, gây dữ liệu rác.

**Fix:**
```typescript
async registerGym(ownerId: string, data: ...) {
    const gymCenterRepo = AppDataSource.getRepository(GymCenter);

    // ✅ Thêm kiểm tra duplicate
    const existing = await gymCenterRepo.findOne({ where: { owner_id: ownerId, is_active: true } });
    if (existing) {
        throw new Error('Bạn đã có một Gym Center đang hoạt động. Vui lòng quản lý gym hiện tại.');
    }

    // ... rest of logic
}
```

---

## 🟡 MEDIUM — Lỗi logic / UX đáng chú ý

---

### BUG-010 · `Register.tsx` — Luồng điều hướng sau đăng ký gym_owner gây bối rối

**Mô tả:** Sau khi đăng ký với `user_type: 'gym_owner'`, `navigate('/dashboard')` được gọi. `ProtectedRoute` chuyển hướng gym_owner từ `/dashboard` → `/gym-owner`. Nhưng `/gym-owner` yêu cầu `gym_owner_status === 'approved'`, nên lại redirect về `/gym-owner/register`. User bị "tung qua 3 trang" trước khi thấy form đăng ký gym.

**Fix:**
```typescript
// Register.tsx — navigate theo role:
if (result.user.user_type === 'gym_owner') {
    navigate('/gym-owner/register');
} else {
    navigate('/dashboard');
}
```

---

### BUG-011 · `GymReviewList` — Hiển thị UUID thay vì tên người dùng

**File:** `frontend/src/components/GymReviewList.tsx`

**Mô tả:** Placeholder hiển thị `review.user_id.substring(0, 4)...` — người xem thấy một chuỗi UUID ngẫu nhiên, không có tên người dùng.

**Fix:** Join user data khi query reviews, hoặc lưu `user_full_name` vào review khi tạo:

**Option A — Backend:** Thêm relation query khi lấy reviews:
```typescript
// gymReviewService.ts:
const reviews = await reviewRepo.find({
    where: { branch_id: In(branchIds), is_visible: true },
    order: { created_at: 'DESC' },
    relations: ['user'],  // ← THÊM relation
});
```
Cần thêm `@ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;` vào `GymReview` entity.

**Option B — Frontend (tạm thời):** Thêm `user_name` vào `GymReview` interface và trả về từ backend.

---

### BUG-012 · `GymReviewForm` — Hiển thị form cho user không đủ điều kiện

**File:** `frontend/src/components/GymReviewForm.tsx`, `frontend/src/pages/GymDetailPage.tsx`

**Mô tả:** Form review hiển thị cho tất cả user đã đăng nhập mà không kiểm tra điều kiện `canReview` trước. User không đủ điều kiện có thể nhìn thấy form, điền vào, submit, và nhận lỗi 403 — trải nghiệm xấu.

**Fix trong GymDetailPage.tsx:**
```typescript
const [canReview, setCanReview] = useState(false);

// Trong useEffect sau khi load gym:
if (user && id) {
    gymService.checkReviewEligibility(id)
        .then(res => setCanReview(res.canReview))
        .catch(() => setCanReview(false));
}

// JSX:
{canReview ? (
    <GymReviewForm gymId={id!} branchId={activeBranchId!} onSuccess={fetchReviews} />
) : (
    isAuthenticated && (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border">
            Bạn cần có subscription với HLV tại gym này để có thể đánh giá.
        </div>
    )
)}
```

---

### BUG-013 · `GymTrainerManager` — Dùng `window.prompt()` cho input role

**File:** `frontend/src/components/GymTrainerManager.tsx`

**Mô tả:** `window.prompt()` là native browser dialog — trải nghiệm kém, không thể style, không hoạt động trong một số môi trường (PWA, iframe, Electron).

**Fix:** Dùng inline input hoặc modal:
```tsx
// Thêm state:
const [pendingInvite, setPendingInvite] = useState<{ trainerId: string } | null>(null);
const [roleInput, setRoleInput] = useState('Professional Coach');

// Khi bấm "Mời":
setPendingInvite({ trainerId: t.id });

// Hiển thị inline form confirm:
{pendingInvite && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl max-w-sm w-full">
            <h4 className="font-bold mb-4">Vị trí tại Gym</h4>
            <input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="form-input w-full mb-4"
                placeholder="VD: Senior PT, Yoga Instructor"
            />
            <div className="flex gap-3">
                <button onClick={() => handleInviteConfirm(pendingInvite.trainerId, roleInput)} className="btn-primary flex-1">Xác nhận</button>
                <button onClick={() => setPendingInvite(null)} className="btn-secondary flex-1">Hủy</button>
            </div>
        </div>
    </div>
)}
```

---

### BUG-014 · `Home.tsx` — Chưa tách thành Gymer / GymCenter homepage

**File:** `frontend/src/pages/Home.tsx`

**Mô tả:** Dù kiến trúc đã thiết kế (GYMERVIET_GYM_ARCHITECTURE.md) trang chủ split screen Gymer vs GymCenter, file `Home.tsx` vẫn là trang chủ đơn. Không có route hay logic phân tách.

**Fix:** Xem kiến trúc chi tiết tại `GYMERVIET_GYM_ARCHITECTURE.md` section 2. Tóm tắt:
1. Tạo `HomeGymer.tsx` (nội dung hiện tại + section gym listing)
2. Tạo `HomeGymCenter.tsx` (landing cho gym owner)
3. `Home.tsx` → split screen 2 panel
4. Dùng `localStorage.getItem('home_pref')` để nhớ lựa chọn

---

### BUG-015 · `GymCenter` entity thiếu field `cover_image_url`

**File:** `backend/src/entities/GymCenter.ts`

**Mô tả:** Frontend type `GymCenter` không có field `cover_image_url`, nhưng architecture document và `GymDetailPage` UI cần field này. Entity và frontend type cần đồng bộ.

**Fix:**
```typescript
// backend/src/entities/GymCenter.ts — THÊM:
@Column({ type: 'varchar', length: 500, nullable: true })
cover_image_url!: string | null;

// frontend/src/types/index.ts — THÊM vào GymCenter interface:
cover_image_url: string | null;
```

---

### BUG-016 · `gymAdminController` — Hàm `getGymStats` gọi `gymService.getGymStats()` bị thiếu ownerId validation khi admin gọi

**File:** `backend/src/services/gymService.ts`

**Mô tả:** `gymService.getGymStats(centerId, ownerId)` yêu cầu `ownerId` để verify quyền. Khi admin muốn xem stats của bất kỳ gym nào, họ cần bypass ownership check.

**Fix:**
```typescript
async getGymStats(gymCenterId: string, ownerId?: string) {
    const gymCenterRepo = AppDataSource.getRepository(GymCenter);
    const whereClause = ownerId
        ? { id: gymCenterId, owner_id: ownerId }
        : { id: gymCenterId };  // admin không cần ownership check
    const center = await gymCenterRepo.findOne({ where: whereClause, relations: ['branches'] });
    if (!center) throw new Error('Gym not found or unauthorized');
    // ...
}
```

---

## 🟢 LOW / UX — Nhỏ nhưng cần sửa

---

### BUG-017 · `Gyms.tsx` — Comment typo

**File:** `frontend/src/pages/Gyms.tsx`  
**Sửa:** `{/* Header Header */}` → `{/* Page Header */}`

---

### BUG-018 · `GymRegisterPage.tsx` — Dùng emoji icon vi phạm quy tắc "No Icons"

**File:** `frontend/src/pages/GymRegisterPage.tsx`

Các dòng `<div className="text-4xl mb-4">⌛</div>` và `❌` vi phạm convention "không dùng icon". 

**Fix:**
```tsx
// Thay ⌛ bằng:
<div className="w-16 h-16 border-4 border-black rounded-full mx-auto mb-6" />

// Thay ❌ bằng:
<div className="text-sm font-black uppercase tracking-widest text-red-600 mb-2">Từ chối</div>
```

---

### BUG-019 · `Home.tsx` — Dùng emoji icons trong Features section

**File:** `frontend/src/pages/Home.tsx`  
**Vị trí:** Section "Tại sao chọn chúng tôi?" — các cards dùng `✓`, `🔒`, `⚙️`, `👥` và trainer cards dùng `🏋️`

**Fix:** Thay icon bằng styled tag labels hoặc số thứ tự như các section khác đã làm đúng.

---

### BUG-020 · `GymDetailPage.tsx` — `pt-24` hardcoded

**File:** `frontend/src/pages/GymDetailPage.tsx`  
**Mô tả:** `className="bg-white min-h-screen pt-24 pb-16"` dùng padding hardcoded. Nếu Header thay đổi chiều cao, layout sẽ bị lệch.  
**Fix:** Dùng CSS variable hoặc Tailwind config: `pt-[var(--header-height)]` hoặc `pt-16` (đồng bộ với Header height `h-16`).

---

### BUG-021 · `GymReviewList.tsx` — Không hiển thị tổng rating và breakdown

**Mô tả:** API trả về `avg_rating`, `total_reviews`, `breakdown` nhưng component `GymReviewList` không hiển thị tổng hợp rating, chỉ hiển thị list reviews.

**Fix:** Thêm rating summary section trước list:
```tsx
{/* Rating Summary */}
<div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
    <div className="text-5xl font-black">{avgRating.toFixed(1)}</div>
    <div>
        <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(avgRating) ? 'text-black' : 'text-gray-200'}>★</span>)}
        </div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{totalReviews} đánh giá</span>
    </div>
</div>
```

---

### BUG-022 · `GymTrainerLink` entity — status `'inactive'` vs `'removed'` không đồng nhất

**Mô tả:** Backend entity dùng `status: 'pending' | 'active' | 'removed'` nhưng frontend type `GymTrainerLink` dùng `status: 'pending' | 'active' | 'inactive'`. Khác nhau làm TypeScript không bắt được lỗi.

**Fix:** Đồng bộ về `'removed'` ở cả hai:
```typescript
// frontend/src/types/index.ts:
status: 'pending' | 'active' | 'removed';  // ← đổi 'inactive' thành 'removed'
```

---

## TÍNH NĂNG THIẾU (Planned but not implemented)

Các tính năng này đã được thiết kế trong kiến trúc nhưng chưa có UI:

| # | Tính năng | Độ ưu tiên | Backend | Frontend |
|---|-----------|-----------|---------|----------|
| F1 | Gallery management trong GymOwnerDashboard | Cao | ✅ API có | ❌ UI thiếu |
| F2 | Amenities editor trong GymOwnerDashboard | Cao | ✅ API có | ❌ UI thiếu |
| F3 | Equipment editor trong GymOwnerDashboard | Cao | ✅ API có | ❌ UI thiếu |
| F4 | Pricing editor trong GymOwnerDashboard | Cao | ✅ API có | ❌ UI thiếu |
| F5 | Events management UI | Trung bình | ✅ API có | ❌ UI thiếu |
| F6 | Trainer: màn hình nhận/từ chối lời mời Gym | Trung bình | ✅ API có | ❌ UI thiếu |
| F7 | Page views chart trong GymOwnerDashboard | Thấp | ✅ API có | ❌ UI thiếu |

**Lưu ý F6:** Trainer Dashboard (`/dashboard`) cần thêm section "Lời mời từ Gym" hiển thị pending invitations từ `gymService.getTrainerInvitations()` và nút Accept/Decline.

---

## CHECKLIST FIX THEO THỨ TỰ ƯU TIÊN

```
NGAY LẬP TỨC (trước khi test):
[ ] BUG-001: schemas/auth.ts → thêm 'gym_owner' vào RegisterSchema
[ ] BUG-001: authService.ts → fix refreshToken type
[ ] BUG-002: routes/gym.ts → đổi thứ tự routes (specific before wildcard)
[ ] BUG-003: authService.ts → getProfile trả về gym_owner_status
[ ] BUG-003: authService.ts → register trả về gym_owner_status

SPRINT TIẾP THEO:
[ ] BUG-004: GymTrainerManager → tạo endpoint getBranchTrainers + fix frontend call
[ ] BUG-005: GymOwnerDashboard → gọi getGymStats() thay vì hardcode
[ ] BUG-006: GymOwnerDashboard → fix Settings tab (controlled inputs + save handler)
[ ] BUG-007: GymOwnerDashboard → thêm handler Thêm/Cập nhật chi nhánh
[ ] BUG-008: GymRegisterPage → feedback rõ ràng sau submit
[ ] BUG-009: gymService.registerGym → check duplicate gym per owner
[ ] BUG-010: Register.tsx → navigate đúng route theo role
[ ] BUG-011: GymReviewList → join user data (tên thay UUID)
[ ] BUG-012: GymDetailPage → check canReview trước khi show form
[ ] BUG-013: GymTrainerManager → thay window.prompt bằng inline modal
[ ] BUG-015: GymCenter entity → thêm cover_image_url
[ ] BUG-022: Đồng bộ GymTrainerLink status type

POLISH:
[ ] BUG-014: Tách Home.tsx → HomeGymer + HomeGymCenter
[ ] BUG-016: gymService.getGymStats → optional ownerId cho admin
[ ] BUG-017-022: Typos, icons, padding, rating display
[ ] F1-F7: UI cho Gallery, Amenities, Equipment, Pricing, Events, Invitations
```
