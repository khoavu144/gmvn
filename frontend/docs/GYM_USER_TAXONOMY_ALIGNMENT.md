# Gym taxonomy ↔ User profile catalog

## Vấn đề

Hai lớp từ vựng tách biệt dễ khiến chủ phòng và người tập thấy **cùng ý nhưng khác chữ** (ví dụ môn, tiện ích, đối tượng phục vụ).

## Cách chốt kỹ thuật

- **Gym**: `GymTaxonomyTerm` (và các bảng taxonomy gym hiện có).
- **User profile**: `user_profile_terms` với cột tùy chọn `maps_to_gym_taxonomy_term_id` (UUID, nullable).

Khi một lựa chọn user và một term gym **cùng nghĩa kinh doanh**, admin/backend gán `maps_to_gym_taxonomy_term_id` trỏ tới id hàng `GymTaxonomyTerm` tương ứng. UI end user **không** thấy cột này.

## Gợi ý vận hành

1. Ưu tiên **một nhãn hiển thị** (`label_vi`) thống nhất giữa gym và user khi map.
2. Tra cứu / báo cáo có thể join theo `maps_to_gym_taxonomy_term_id` thay vì so khớp chuỗi tự do.
3. Nếu chưa map: coi như chỉ dùng trong phạm vi user profile (vẫn lưu `user_profile_term_selections`).

## API liên quan

- `GET /api/v1/user-profile/catalog` — trả các **nhóm** (`sections`) và **lựa chọn** (`terms`); mỗi term có thể có `maps_to_gym_taxonomy_term_id` khi đã cấu hình.
