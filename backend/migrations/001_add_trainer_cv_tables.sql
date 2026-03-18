-- ============================================================
-- Migration: Add Trainer CV Tables
-- Date: 2025
-- Tables: trainer_skills, trainer_packages
-- Also: Adds columns to trainer_profiles + testimonials
-- Note: If using TypeORM synchronize:true, this runs automatically.
--       Use this file for production manual migrations.
-- ============================================================

-- trainer_skills
CREATE TABLE IF NOT EXISTS trainer_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    level       INTEGER NOT NULL DEFAULT 80 CHECK (level BETWEEN 0 AND 100),
    category    VARCHAR(50),
    order_number INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trainer_skills_trainer ON trainer_skills(trainer_id);

-- trainer_packages
CREATE TABLE IF NOT EXISTS trainer_packages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    duration_months  INTEGER NOT NULL DEFAULT 1,
    sessions_per_week INTEGER,
    price            BIGINT NOT NULL,
    features         JSONB NOT NULL DEFAULT '[]',
    is_popular       BOOLEAN NOT NULL DEFAULT false,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    order_number     INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trainer_packages_trainer ON trainer_packages(trainer_id);

-- Add result_achieved and is_featured to existing testimonials table
ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS result_achieved VARCHAR(200),
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Add profile_template to trainer_profiles
ALTER TABLE trainer_profiles
    ADD COLUMN IF NOT EXISTS profile_template VARCHAR(20) NOT NULL DEFAULT 'card';

-- ============================================================
-- Sample seed data (for development/testing only)
-- ============================================================

-- Example skills for a trainer (replace UUID with real trainer_id)
-- INSERT INTO trainer_skills (trainer_id, name, level, category, order_number) VALUES
-- ('{{TRAINER_UUID}}', 'Powerlifting', 95, 'fitness', 1),
-- ('{{TRAINER_UUID}}', 'Nutrition Planning', 85, 'nutrition', 2),
-- ('{{TRAINER_UUID}}', 'Fat Loss', 90, 'fitness', 3),
-- ('{{TRAINER_UUID}}', 'Muscle Building', 88, 'fitness', 4);

-- Example packages
-- INSERT INTO trainer_packages (trainer_id, name, description, duration_months, sessions_per_week, price, features, is_popular, order_number) VALUES
-- ('{{TRAINER_UUID}}', 'Gói Khởi Đầu', 'Phù hợp cho người mới bắt đầu', 1, 3, 1500000, '["Lên kế hoạch tập luyện", "Tư vấn dinh dưỡng cơ bản", "Theo dõi tiến độ hàng tuần"]', false, 1),
-- ('{{TRAINER_UUID}}', 'Gói Tiêu Chuẩn', 'Tốt nhất cho phần lớn học viên', 3, 4, 3800000, '["Toàn bộ quyền lợi Gói Khởi Đầu", "Tư vấn dinh dưỡng chi tiết", "Check-in hàng ngày qua app", "Điều chỉnh chương trình linh hoạt"]', true, 2),
-- ('{{TRAINER_UUID}}', 'Gói Nâng Cao', 'Cam kết kết quả tối ưu', 6, 5, 6000000, '["Toàn bộ quyền lợi Gói Tiêu Chuẩn", "Hỗ trợ 24/7", "Phân tích thể trạng chuyên sâu", "Tập gym cùng PT", "Báo cáo tháng chi tiết"]', false, 3);
