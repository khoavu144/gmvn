-- Chạy migration này trước khi deploy sort rating/views và lọc city trên /users/trainers.
-- Hỗ trợ lọc/sort directory Coach: thành phố, điểm đánh giá, lượt xem hồ sơ
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_view_count INT NOT NULL DEFAULT 0;
