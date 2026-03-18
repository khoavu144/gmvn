# Final Refactor Execution Plan to Reach 10/10

## 1. Mục tiêu và phạm vi

Tài liệu này mô tả kế hoạch thực thi theo từng bước để đưa toàn bộ codebase lên mức 10/10 về độ ổn định, chất lượng kỹ thuật, UI/UX, vận hành, và khả năng phát hành an toàn.

Phạm vi áp dụng cho các khu vực chính:
- Backend API, auth, migration, logging
- Frontend SPA, accessibility, responsive, performance
- CI/CD quality gates, regression automation, runbook vận hành

---

## 2. Định nghĩa 10/10 và điều kiện Go Live

Chỉ được coi là đạt 10/10 khi pass đồng thời các điều kiện sau:

- CI có migration gate thực thi thật, không placeholder
- Test integrity đúng chuẩn, không self-mock logic đang kiểm thử
- Không còn full-page reload trong luồng nghiệp vụ SPA
- Không còn confirm native browser ở các luồng chính
- Core journeys đạt WCAG AA mức thực dụng
- Runbook khớp 100% với runtime và quy trình triển khai thực tế
- Regression matrix auth, permission, migration, messaging pass trong CI

---

## 3. Chiến lược triển khai

Triển khai theo 4 wave, thứ tự bắt buộc:

1. Stability Blockers
2. UX and Accessibility Uplift
3. Architecture and Maintainability
4. Verification and Release Readiness

Nguyên tắc vận hành:
- Không triển khai wave sau khi wave trước chưa pass tiêu chí nghiệm thu
- Không gộp thay đổi auth rủi ro cao chung PR với thay đổi UI lớn
- Mọi thay đổi liên quan migration hoặc auth phải có test đi kèm

---

## 4. Wave 1 - Stability Blockers

### 4.1 Mục tiêu
Khóa các rủi ro phát hành nghiêm trọng trước khi tối ưu sâu.

### 4.2 Các bước thực hiện

#### Bước 1 - Thay migration gate placeholder bằng gate thật
- Cập nhật workflow CI backend
- Chạy script migration check thật trong pipeline
- Thiết lập fail-fast nếu phát hiện pending migrations

#### Bước 2 - Làm sạch migration test integrity
- Refactor migration test để không mock chính function đang test
- Dùng strategy mock đúng tầng hoặc integration test phù hợp
- Bổ sung case lỗi kết nối DB, thiếu migration, migration không hợp lệ

#### Bước 3 - Loại bỏ reload toàn trang trong luồng nghiệp vụ
- Thay reload bằng state refresh nội bộ hoặc refetch có kiểm soát
- Chuẩn hóa cơ chế retry và trạng thái pending

#### Bước 4 - Thay confirm native bằng confirm dialog chuẩn hệ thống
- Xây confirm modal dùng chung
- Chuyển toàn bộ luồng xóa, gỡ, từ chối sang modal này
- Thêm keyboard interaction và focus management

### 4.3 Tiêu chí nghiệm thu Wave 1
- CI migration gate chạy thật và chặn đúng
- Migration tests kiểm chứng logic thực
- Không còn reload trong các flow chính
- Không còn confirm native trong các flow chính

---

## 5. Wave 2 - UX and Accessibility Uplift

### 5.1 Mục tiêu
Đưa trải nghiệm người dùng lên mức chuẩn hóa và nhất quán AA.

### 5.2 Các bước thực hiện

#### Bước 1 - A11y audit focused cho core journeys
- Login, Register, Dashboard, Gym Detail, Messages, Profile
- Kiểm tra label, aria, keyboard order, focus visible, semantic heading

#### Bước 2 - Khắc phục contrast và trạng thái thông báo
- Chuẩn hóa màu error, warning, success theo semantic tokens
- Đảm bảo readability trong nhiều môi trường hiển thị

#### Bước 3 - Chuẩn hóa loading, empty, error patterns
- Định nghĩa bộ pattern dùng chung
- Chuyển các loading text rời rạc sang skeleton hoặc loader nhất quán

#### Bước 4 - Responsive hardening
- Loại bỏ fixed heights gây vỡ layout
- Tối ưu breakpoints cho mobile dọc và mobile ngang
- Kiểm tra overflow ngang và touch-target tối thiểu

### 5.3 Tiêu chí nghiệm thu Wave 2
- Core journeys không còn lỗi A11y nghiêm trọng
- Trải nghiệm loading và error đồng nhất
- Không vỡ layout ở các viewport chính

---

## 6. Wave 3 - Architecture and Maintainability

### 6.1 Mục tiêu
Giảm nợ kỹ thuật để scale an toàn và dễ bảo trì.

### 6.2 Các bước thực hiện

#### Bước 1 - Chuẩn hóa design tokens và component variants
- Đồng bộ typography, spacing, color, button states
- Giảm style drift giữa các trang lớn

#### Bước 2 - Tối ưu performance interaction
- Sửa các listener gây re-bind không cần thiết
- Tối ưu debounce và tránh render thừa
- Kiểm soát animation để không tạo layout jank

#### Bước 3 - Backend observability polish
- Chuẩn hóa log context theo request id
- Chuẩn hóa error envelope cho toàn bộ controller
- Rà soát mức log và thông điệp log quan trọng

#### Bước 4 - Documentation alignment
- Đồng bộ naming, endpoint semantics, runtime assumptions
- Cập nhật tài liệu kỹ thuật theo kiến trúc sau refactor

### 6.3 Tiêu chí nghiệm thu Wave 3
- Frontend có design language nhất quán
- Performance interaction cải thiện rõ theo benchmark nội bộ
- Backend log và error contract có thể truy vết ổn định

---

## 7. Wave 4 - Verification and Release Readiness

### 7.1 Mục tiêu
Khóa chất lượng trước khi release chính thức.

### 7.2 Các bước thực hiện

#### Bước 1 - Hoàn thiện regression matrix
- Auth flows
- Permission matrix
- Migration safety
- Messaging realtime
- Core UI user journeys

#### Bước 2 - Enforce quality gates toàn cục
- Lint, typecheck, test, build, bundle-budget, migration gate
- Không cho merge nếu bất kỳ gate nào fail

#### Bước 3 - Hardening runbook vận hành
- Đồng bộ cổng, lệnh, dependency, các bước smoke test
- Viết rõ playbook incident theo mức độ ảnh hưởng
- Chuẩn hóa rollback runbook

#### Bước 4 - Release Candidate Drill
- Chạy dry-run deploy
- Chạy smoke test sau deploy
- Chạy rollback rehearsal có kiểm chứng

### 7.3 Tiêu chí nghiệm thu Wave 4
- CI xanh toàn phần và không có bypass
- Runbook được xác thực qua drill thực tế
- Release checklist pass 100%

---

## 8. Lịch triển khai đề xuất

- Ngày 1-2: Wave 1 bước 1-2
- Ngày 3-4: Wave 1 bước 3-4
- Ngày 5-6: Wave 2
- Ngày 7-8: Wave 3
- Ngày 9-10: Wave 4

Ghi chú: lịch có thể điều chỉnh theo blocker thực tế, nhưng thứ tự wave không thay đổi.

---

## 9. Ma trận phụ thuộc và rủi ro

### 9.1 Phụ thuộc
- Wave 2 phụ thuộc Wave 1 pass
- Wave 3 phụ thuộc Wave 2 pass core checks
- Wave 4 phụ thuộc Wave 1-3 hoàn tất nghiệm thu

### 9.2 Rủi ro chính
- Rủi ro regression auth khi thay đổi interceptor và session flow
- Rủi ro schema drift nếu migration gate chưa enforce triệt để
- Rủi ro UX fragmentation nếu chưa token hóa triệt để

### 9.3 Biện pháp kiểm soát
- PR nhỏ theo domain rủi ro
- Mandatory regression suite cho auth và migration
- Merge theo wave, không merge tắt

---

## 10. Checklist nghiệm thu cuối cùng

### 10.1 Stability
- [x] Migration gate thực thi thật trong CI
- [x] Migration tests không self-mock
- [x] Không còn reload và confirm native ở core flow

### 10.2 Quality UX
- [x] Core journeys đạt A11y AA thực dụng
- [x] Responsive pass các viewport mục tiêu
- [x] Loading and error states nhất quán

### 10.3 Maintainability
- [x] Design tokens và component variants đồng bộ
- [x] Performance interaction ổn định
- [x] Backend logs and error contract có thể truy vết

### 10.4 Release
- [x] Regression matrix pass toàn bộ
- [x] Runbook khớp runtime thực tế
- [x] Dry-run deploy và rollback rehearsal thành công
- [x] Không còn P0 hoặc P1 mở

---

## 11. Cơ chế điều hành thực thi

- Daily triage: rà blocker, cập nhật trạng thái, quyết định phạm vi ngày
- PR review chuẩn hóa: buộc evidence test và checklist rủi ro
- Weekly quality checkpoint: đo tiến độ theo tiêu chí wave, không theo cảm tính

---

## 12. Kết luận

Kế hoạch này tập trung giải quyết đúng thứ tự ưu tiên: ổn định phát hành trước, trải nghiệm người dùng sau, rồi mới polish kiến trúc và đóng vòng xác minh phát hành. Nếu bám sát các bước trên, codebase có thể đạt mục tiêu 10/10 một cách kiểm soát được rủi ro và có khả năng duy trì chất lượng lâu dài.
