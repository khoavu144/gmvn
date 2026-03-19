# GYMERVIET — Full Codebase Audit
**Version:** New codebase (gymerviet-new.zip)  
**Scope:** Frontend (React/Vite/TypeScript) + Backend (NestJS/Express/TypeORM)  
**Trọng tâm:** AthleteDetailPage — UI/UX & Bugs  

---

## TÓM TẮT ĐIỀU HÀNH

| Hạng mục | Tổng số vấn đề |
|---|---|
| 🔴 Critical (bug gây mất dữ liệu / sai chức năng) | 5 |
| 🟠 High (UX nghiêm trọng / sai logic) | 7 |
| 🟡 Medium (không nhất quán, dễ gây nhầm lẫn) | 8 |
| 🟢 Low (cải thiện nhỏ, polish) | 4 |
| **Tổng** | **24** |

> **Ghi chú về ưu tiên:** Trước khi bắt tay vào bất kỳ feature mới nào (gallery lightbox, redesign v2, social links...), cần giải quyết hết 5 Critical và 7 High để không bị nợ kỹ thuật leo thang.

---

## PHẦN I — ATHLERE DETAIL PAGE (Trọng tâm audit)

### 🔴 [ATHLETE-BUG-01] Gallery counter hiển thị nhưng không có section render

**File:** `frontend/src/pages/AthleteDetailPage.tsx`  
**Dòng:** 197, toàn bộ `<section>` bên phải

**Mô tả:**  
Sidebar hiển thị stat `gallery.length` với label "Gallery", nhưng phần `<section className="space-y-6">` hoàn toàn không có block render gallery. User thấy số "5 Gallery" nhưng scroll suốt trang không tìm ra ảnh nào — đây là broken promise rõ ràng.

```tsx
// Có stat này:
<div className="text-lg font-bold text-black">{gallery.length}</div>
<div className="text-[10px] uppercase tracking-wider text-gray-500">Gallery</div>

// Nhưng KHÔNG CÓ section này trong JSX:
{gallery.length > 0 && (
  <div className="card">
    <h2 className="card-header">Gallery</h2>
    {/* Grid ảnh — hoàn toàn vắng mặt */}
  </div>
)}
```

**Fix:** Thêm gallery grid section (tương tự `ProfileGalleryTab`) vào `<section>` bên phải của AthleteDetailPage.

---

### 🔴 [ATHLETE-BUG-02] Back breadcrumb dẫn về danh sách Coach thay vì Athlete

**File:** `frontend/src/pages/AthleteDetailPage.tsx`  
**Dòng:** 126

**Mô tả:**  
Breadcrumb "← Khám phá hồ sơ" link tới `/coaches` (danh sách mặc định = trainer), không phải `/coaches?type=athlete`. User xem profile vận động viên, nhấn back lại thấy toàn HLV — gây mất orientation hoàn toàn.

```tsx
// Hiện tại — SAI:
<Link to="/coaches">← Khám phá hồ sơ</Link>

// Đúng phải là:
<Link to="/coaches?type=athlete">← Vận động viên</Link>
```

---

### 🔴 [ATHLETE-BUG-03] Không có social links dù TrainerProfile có đầy đủ field

**File:** `frontend/src/pages/AthleteDetailPage.tsx`  
**Types:** `SocialLinks` trong `types/index.ts` có: facebook, instagram, youtube, tiktok, twitter, website, linkedin

**Mô tả:**  
`profile.social_links` được lưu đầy đủ trong DB (athlete điền từ `ProfileCoachTab`) nhưng `AthleteDetailPage` không render bất kỳ social link nào. Athlete (đặc biệt thể hình, võ thuật) dùng Instagram/TikTok như portfolio chính — bỏ trống là mất toàn bộ giá trị social proof.

**Fix:** Thêm social links row vào sidebar, ngay dưới location, với icon hoặc text label.

---

### 🔴 [ATHLETE-BUG-04] Inconsistent canonical URL — `/athletes/:slug` vs `/athlete/:slug`

**File:** `frontend/src/pages/Profile.tsx` dòng 168 vs `frontend/src/App.tsx`

**Mô tả:**  
- Route SEO canonical trong App.tsx: `/athlete/:slug` (số ít)
- Link "Xem hồ sơ public" trong Profile.tsx dùng: `/athletes/${myProfile.slug}` (số nhiều)
- Route `/athletes/:identifier` tồn tại nhưng không phải canonical

Kết quả: athlete chia sẻ link từ Profile page sẽ share URL `/athletes/slug-cua-toi` thay vì `/athlete/slug-cua-toi`. Cả 2 đều hoạt động về mặt kỹ thuật (cùng component) nhưng SEO bị split — Google index 2 URL khác nhau cho cùng 1 người.

```tsx
// Profile.tsx dòng 167-168 — SAI:
? (myProfile.slug ? `/athletes/${myProfile.slug}` : `/athletes/${user.id}`)

// Đúng:
? (myProfile.slug ? `/athlete/${myProfile.slug}` : `/athletes/${user.id}`)
```

---

### 🔴 [ATHLETE-BUG-05] Không có "Vận động viên liên quan" — dead end UX

**Mô tả:**  
Coach profile có `CoachRelatedFooter` hiển thị 3 coach tương tự. Athlete detail không có bất kỳ discovery mechanism nào ở cuối trang. User xem xong 1 athlete → không biết làm gì tiếp → bounce ngay. Không gọi thêm API nào để lấy similar athletes.

**Fix:** Tạo component `AthleteRelatedFooter` gọi `/users/trainers?user_type=athlete&limit=3` và render cuối trang.

---

### 🟠 [ATHLETE-UX-01] Chênh lệch thiết kế cực lớn giữa Coach và Athlete

**Mô tả:**  
Coach page có **9 section chuyên nghiệp** dạng flagship:  
`Hero → TrustRibbon → ResultsShowcase → Method → Offers → Testimonials → Authority → ClosingCTA → RelatedFooter`

Athlete page có **3 card đơn giản** dạng blog cũ:  
`Giới thiệu → Thế mạnh thi đấu → Thành tích`

Khi người dùng điều hướng từ Coach sang Athlete (hoặc ngược lại), visual language thay đổi hoàn toàn — dark hero vs white card, layout flagship vs layout blog. Đây là vấn đề brand consistency nghiêm trọng, không phải chỉ là thiếu feature.

---

### 🟠 [ATHLETE-UX-02] Stat "Thành tích" dùng field `success_stories` — sai ngữ nghĩa

**Dòng:** 198

**Mô tả:**  
`success_stories` là field thiết kế cho Coach (số học viên đạt kết quả). Athlete dùng field này để hiển thị "Thành tích" — không rõ nghĩa: thành tích gì? Số giải đấu? Số năm? Không có label context.

**Fix:** Với athlete, nên đếm `athleteAchievements.length` (số thành tích thực tế từ experience) thay vì `profile.success_stories`.

---

### 🟠 [ATHLETE-UX-03] "Permalink chuẩn SEO" hiển thị cho end user — developer noise

**Dòng:** 131-133

**Mô tả:**  
Topbar hiện có link "Permalink chuẩn SEO" với text in đậm, underline — trông như một đường link UI quan trọng với end user. Đây là artifact debug, không nên hiển thị trên production.

```tsx
<Link to={`/athlete/${profile.slug}`} className="text-xs font-semibold uppercase tracking-wider text-black underline underline-offset-4">
    Permalink chuẩn SEO
</Link>
```

**Fix:** Xóa hoặc ẩn sau admin-only flag.

---

### 🟠 [ATHLETE-UX-04] Loading skeleton không khớp layout thực tế

**Dòng:** 68-81

**Mô tả:**  
Loading skeleton render `grid-cols-[320px_minmax(0,1fr)]` với 2 column, nhưng không có skeleton cho breadcrumb bar và topbar. Khi data load xong, có flash layout thay đổi height. Skeleton cũng dùng `rounded-sm` trong khi card thực dùng `.card` class có `rounded-none` — mismatch visual khi transition.

---

## PHẦN II — GLOBAL UI/UX ISSUES

### 🟠 [GLOBAL-UX-01] CoachDetailPage: `handleMessage` dùng `trainerId` từ URL param, không phải từ data

**File:** `frontend/src/pages/CoachDetailPage.tsx` dòng ~175

**Mô tả:**  
```tsx
const handleMessage = () => {
    navigate(`/messages?to=${trainerId}`); // trainerId từ URL param
}
```
Nếu user truy cập qua `/coach/:slug` route thì `trainerId` là `undefined` — message link broken. Nên dùng `trainer?.id` (từ data sau khi load).

---

### 🟠 [GLOBAL-UX-02] `FeaturedCoaches` không hỗ trợ athlete — homepage chỉ show trainer

**File:** `frontend/src/components/FeaturedCoaches.tsx`

**Mô tả:**  
`FeaturedCoaches` gọi `/users/trainers` (mặc định lấy trainer), sau đó `sortedAndCuratedCoaches` không filter `user_type`. Nếu API trả về athlete, component vẫn render nhưng link về `/coach/:slug` thay vì `/athlete/:slug` — vì `detailLink` chỉ được tính đúng trong `Coaches.tsx/CoachCard` chứ không phải trong `FeaturedCoaches`.

---

### 🟡 [GLOBAL-UX-03] Dashboard link "Khám phá Vận động viên" sai

**File:** `frontend/src/pages/Dashboard.tsx` dòng 206

**Mô tả:**  
```tsx
to: '/coaches?type=athlete'
```
Link này đúng về chức năng nhưng trong Dashboard context, label nên là "Vận động viên" chứ không đặt chung với coaches section.

---

### 🟡 [GLOBAL-UX-04] Breadcrumb "← Huấn luyện viên" trong CoachDetailPage dùng `window.history.back()`

**File:** `frontend/src/components/coach-flagship/CoachHeroFlagship.tsx` dòng ~53

**Mô tả:**  
```tsx
onClick={() => window.history.back()}
```
Nếu user mở trực tiếp từ share link (không có history), `history.back()` không làm gì. Nên dùng `<Link to="/coaches">` hoặc `useNavigate`.

---

### 🟡 [GLOBAL-UX-05] Profile.tsx: tab "Thành tích/Giải đấu" với athlete dùng cùng `ProfileExperienceTab` của coach

**Mô tả:**  
`ProfileExperienceTab` được thiết kế cho work history của coach (Công ty, Vai trò, Thời gian). Khi athlete dùng cùng form này để nhập "Giải đấu" — field labels không phù hợp: "Tổ chức" thay vì "Ban tổ chức", "Vai trò/Chức danh" thay vì "Hạng mục/Giải", etc.

---

### 🟡 [GLOBAL-UX-06] `ProfilePublic.tsx` vẫn tồn tại nhưng là legacy — route không được quảng bá

**File:** `frontend/src/pages/ProfilePublic.tsx`

**Mô tả:**  
Route `/profile/public/:trainerId` vẫn active trong App.tsx và được fallback tới từ Profile.tsx. Đây là trang cũ, thiếu nhiều section so với `CoachDetailPage`. Cần quyết định: deprecate hẳn hay tích hợp vào CoachDetailPage.

---

### 🟡 [GLOBAL-UX-07] `Coaches.tsx` tab switch reset page về 1 nhưng không reset search state

**File:** `frontend/src/pages/Coaches.tsx`

**Mô tả:**  
Khi switch từ "Coach" sang "Athlete", `page` reset về 1, nhưng `search`, `specialty`, `priceIdx` không reset. User tìm "Boxing" trong coach → switch sang athlete → vẫn filter "Boxing" → có thể ra 0 kết quả mà không biết lý do.

---

### 🟡 [GLOBAL-UX-08] Price display: `1,696,781.68đ/tháng` — formatting sai cho market VN

**File:** `frontend/src/pages/CoachDetailPage.tsx` (payment modal) và `Coaches.tsx`  
**Screenshot xác nhận:** `current-web.png`

**Mô tả:**  
`toLocaleString('vi-VN')` cho ra `1.696.781,68` (dấu phẩy làm decimal separator), nhưng trong payment modal đang hiển thị `1,696,781.68` — sai locale, gây nhầm lẫn với user VN. Cần dùng consistent `toLocaleString('vi-VN')` ở mọi nơi.

---

## PHẦN III — BACKEND LOGIC BUGS

### 🔴 [BACKEND-BUG-01] `userService.getTrainerBySlug` filter cứng `user_type: 'trainer'` — athlete slug không resolve

**File:** `backend/src/services/userService.ts` dòng 170, 181

**Mô tả:**  
```ts
// Cả 2 query đều filter trainer:
let trainer = await this.repo.findOneBy({ slug, user_type: 'trainer' });
// ...
trainer = await this.repo.findOneBy({ id: profileRow.trainer_id, user_type: 'trainer' });
```
`CoachDetailPage` gọi `/users/trainers/slug/:slug` trước khi redirect. Nếu slug thuộc về athlete, cả 2 query đều miss → throw "Trainer not found" → CoachDetailPage nhảy vào catch → `setTrainer(null)` → hiện 404 thay vì redirect tới athlete.

**Fix:** Thay đổi `getTrainerBySlug` để trả về cả `user_type` trong kết quả, bỏ filter `user_type: 'trainer'` (hoặc tạo method `getUserBySlug` generic).

---

### 🟠 [BACKEND-BUG-02] `userService.getSimilarCoaches` không hỗ trợ athlete

**File:** `backend/src/services/userService.ts` dòng 203

**Mô tả:**  
```ts
const trainer = await this.repo.findOneBy({ id: trainerId, user_type: 'trainer' });
if (!trainer) return [];
// ...filter by user_type: 'trainer'
```
Nếu athlete detail muốn gọi similar athletes trong tương lai, endpoint này sẽ trả về `[]` luôn vì filter cứng `user_type: 'trainer'`.

---

### 🟡 [BACKEND-BUG-03] `getFullPublicProfile` (endpoint `/profiles/trainer/:id/full`) load song song gallery/experience trước khi confirm `is_profile_public`

**File:** `backend/src/services/profileService.ts` dòng 148-187

**Mô tả:**  
```ts
const [profile, experience, gallery, ...] = await Promise.all([
    this.getPublicProfile(trainerId), // check is_profile_public
    this.getExperience(trainerId),     // load dù chưa biết public hay không
    this.getGallery(trainerId),        // load dù chưa biết public hay không
    ...
]);
if (!profile) return null; // check SAU khi đã load hết
```
Lãng phí N queries cho profile private. Cần check profile trước, rồi mới load experience/gallery/etc.

---

## PHẦN IV — TỔNG HỢP THEO MỨC ĐỘ ƯU TIÊN

### Làm ngay trước khi bắt feature mới:

| # | ID | Nơi | Mức | Tóm tắt |
|---|---|---|---|---|
| 1 | ATHLETE-BUG-01 | AthleteDetailPage | 🔴 | Gallery stat có nhưng không render |
| 2 | ATHLETE-BUG-02 | AthleteDetailPage | 🔴 | Breadcrumb back về Coach list |
| 3 | ATHLETE-BUG-03 | AthleteDetailPage | 🔴 | Social links không hiển thị |
| 4 | ATHLETE-BUG-04 | Profile.tsx | 🔴 | URL canonical `/athletes/` vs `/athlete/` |
| 5 | ATHLETE-BUG-05 | AthleteDetailPage | 🔴 | Không có related athletes |
| 6 | GLOBAL-UX-01 | CoachDetailPage | 🟠 | `handleMessage` dùng URL param undefined |
| 7 | BACKEND-BUG-01 | userService | 🔴 | Athlete slug không resolve từ `/users/trainers/slug/` |
| 8 | ATHLETE-UX-01 | AthleteDetailPage | 🟠 | Design chênh lệch quá lớn so với Coach |
| 9 | ATHLETE-UX-02 | AthleteDetailPage | 🟠 | `success_stories` sai ngữ nghĩa với athlete |
| 10 | ATHLETE-UX-03 | AthleteDetailPage | 🟠 | "Permalink chuẩn SEO" hiện với end user |
| 11 | GLOBAL-UX-02 | FeaturedCoaches | 🟠 | Athlete link trong homepage sai route |
| 12 | GLOBAL-UX-04 | CoachHeroFlagship | 🟡 | `window.history.back()` có thể fail |
| 13 | GLOBAL-UX-07 | Coaches.tsx | 🟡 | Tab switch không reset filter |
| 14 | GLOBAL-UX-08 | Toàn app | 🟡 | Price locale format không nhất quán |
| 15 | BACKEND-BUG-02 | userService | 🟠 | getSimilarCoaches không hỗ trợ athlete |

---

## PHẦN V — 15 CÂU HỎI CẦN GIẢI ĐÁP TRƯỚC KHI LÀM

Dưới đây là 15 câu hỏi trực tiếp — mỗi câu quyết định hướng implementation cụ thể. Trả lời xong thì mình bắt tay vào từng task mà không cần hỏi thêm.

---

**Q1 — Athlete page có được nâng lên ngang tầm Coach flagship không, hay giữ layout đơn giản hơn?**

> Coach có 9 section, dark hero, premium feel. Nếu athlete cũng nâng lên flagship thì cần build `AthleteHeroFlagship`, `AthleteResultsShowcase` riêng (không thể reuse coach components). Nếu giữ đơn giản thì chỉ cần thêm gallery + social + related section vào layout hiện tại.

---

**Q2 — Athlete có "Gói dịch vụ" / "Pricing" không?**

> Athlete profile hiện tại không có `CoachOffersFlagship`. Một số athlete (PT kiêm athlete, influencer fitness) có thể muốn bán gói coaching. Bạn có muốn expose pricing cho athlete không, hay athlete profile thuần là "showcase" không bán hàng?

---

**Q3 — Gallery section của athlete render theo dạng nào — grid ảnh đơn hay before/after pair?**

> Coach có `CoachResultsShowcase` cho before/after. Athlete thường có competition photos, progress shots. Bạn muốn gallery athlete là: (a) grid ảnh đơn giản như `ProfileGalleryTab`, (b) lightbox full-screen, hay (c) before/after slider như coach?

---

**Q4 — Social links hiển thị icon hay text label? Và platform nào được ưu tiên?**

> `TrainerProfile.social_links` có: facebook, instagram, youtube, tiktok, twitter, website, linkedin. Với athlete VN market, Instagram và TikTok quan trọng nhất. Bạn muốn: (a) hiện tất cả platform có data, (b) chỉ hiện top 4 (Instagram, TikTok, YouTube, Facebook), hay (c) có cấu hình thứ tự ưu tiên?

---

**Q5 — "Nhắn tin vận động viên" có đúng không, hay athlete profile cần CTA khác?**

> Với coach, CTA = "book session / mua gói". Với athlete, mục đích nhắn tin là gì từ góc nhìn business? Sponsor liên hệ? Fan nhắn tin? Hay là feature ít dùng? Nếu athlete không bán service thì CTA primary nên là "Follow" hoặc "Share" thay vì "Nhắn tin".

---

**Q6 — `ProfileExperienceTab` cho athlete có cần form riêng với label khác không?**

> Hiện tại athlete dùng cùng form nhập "Kinh nghiệm" với coach (field: Tổ chức, Vai trò, Thời gian). Với athlete thì phù hợp hơn là: Tên giải đấu, Hạng mục, Kết quả (Vô địch/Top 3/...), Năm. Bạn muốn tách form riêng hay dùng chung và chỉ đổi placeholder/label?

---

**Q7 — Route `/athletes/:identifier` có được giữ hay chỉ dùng `/athlete/:slug`?**

> Hiện có 2 route: `/athlete/:slug` (canonical SEO) và `/athletes/:identifier` (fallback). Để SEO sạch, nên 301 redirect `/athletes/:slug` → `/athlete/:slug`. Bạn có muốn làm redirect này không? (Lưu ý: có thể ảnh hưởng link đã share nếu có user thật đang dùng `/athletes/`).

---

**Q8 — `ProfilePublic.tsx` có bị deprecated hoàn toàn chưa, hay vẫn cần maintain?**

> Route `/profile/public/:trainerId` vẫn active. Đây là trang cũ, không có flagship design. Nếu tất cả trainer đều đã có slug thì có thể redirect 301 sang `/coach/:slug`. Bạn muốn: (a) giữ lại làm fallback, (b) redirect về CoachDetailPage, hay (c) xóa hẳn?

---

**Q9 — "Related athletes" lấy theo logic nào — cùng specialty, cùng city, hay random?**

> Coach dùng `getSimilarCoaches` matching overlap specialties. Athlete thường có `specialties` là môn thể thao (Bodybuilding, Powerlifting, etc.). Bạn muốn related athletes theo: (a) cùng specialty, (b) cùng city (`profile.location`), (c) kết hợp, hay (d) đơn giản là mới nhất?

---

**Q10 — `success_stories` field của athlete có ý nghĩa gì trong context hiện tại?**

> Athlete có thể tự nhập `success_stories = 12` nhưng không ai biết đó là 12 cái gì. Bạn muốn: (a) rename label thành "Số giải đấu" và để user tự điền, (b) auto-count từ `experience` records loại "achievement", hay (c) ẩn stat đó với athlete và thay bằng stat khác (số followers, số năm thi đấu)?

---

**Q11 — Backend: `getTrainerBySlug` có được sửa để support athlete không?**

> Fix này cần đổi tên method hoặc bỏ filter `user_type: 'trainer'`. Risk: nếu có code khác đang dựa vào việc method này CHỈ trả về trainer thì cần kiểm tra. Bạn muốn: (a) tạo method `getUserBySlug` mới (an toàn hơn), hay (b) sửa thẳng `getTrainerBySlug` bỏ filter user_type?

---

**Q12 — Có cần thêm "Athlete Verification Badge" khác với "Verified Coach" không?**

> `is_verified` hiện dùng chung. Athlete profile hiện tại không show badge (dù `isAthleteProfile && athlete.is_verified` có thể check được). Bạn muốn: (a) dùng cùng badge "✓ Verified", (b) badge riêng "✓ Elite Athlete", hay (c) chưa cần, để sau?

---

**Q13 — Filter trang `/coaches` khi ở tab Athlete có cần customization không?**

> Tab "Vận động viên" hiện dùng cùng filter với Coach: Specialty, Giá, Sort. Với athlete không có giá, filter "Giá" vô nghĩa. Specialty của athlete cũng khác (Bodybuilding, Powerlifting vs Yoga, HIIT của coach). Bạn muốn: (a) hide filter "Giá" khi ở tab Athlete, (b) dùng specialty list riêng cho athlete, hay (c) để nguyên tạm thời?

---

**Q14 — Athlete "Quá trình thay đổi" (`ProfileProgressTab`) có hiển thị trên public profile không?**

> `progress_photos` được lưu trong `ProfileProgressTab` (chỉ athlete có tab này). Nhưng `AthleteDetailPage` không render progress photos. Đây là content rất giá trị với athlete (body transformation timeline). Bạn có muốn hiện progress photos trên public profile không, hay giữ private?

---

**Q15 — Timeline ưu tiên: fix bugs trước hay redesign AthleteDetailPage trước?**

> Có 2 hướng tiếp cận:
> - **Option A (Fix-first):** Sửa 5 critical bug (gallery, breadcrumb, social, URL, related) → release → sau đó redesign flagship
> - **Option B (Redesign-first):** Build AthleteDetailPage flagship mới từ đầu (bao gồm gallery, social, related trong đó) → 1 lần deploy bao gồm hết
>
> Option A an toàn hơn, Option B tốt hơn về UX nhưng cần nhiều thời gian hơn. Bạn chọn hướng nào?

---

*Audit thực hiện bởi Claude Sonnet 4.6 — 19/03/2026*  
*Codebase: gymerviet-new.zip — Frontend: React/Vite/TypeScript — Backend: Express/TypeORM/PostgreSQL*
