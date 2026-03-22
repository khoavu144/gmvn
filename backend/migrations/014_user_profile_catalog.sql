-- Catalog mục/quan tâm hồ sơ (Interests / specialties). Khớp UserProfileCatalog1742800000000.
CREATE TABLE IF NOT EXISTS user_profile_sections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug character varying(80) NOT NULL,
    title_vi character varying(200) NOT NULL,
    description_vi text,
    sort_order integer NOT NULL DEFAULT 0,
    applies_to jsonb NOT NULL DEFAULT '["user","athlete","trainer","gym_owner"]',
    min_select integer NOT NULL DEFAULT 0,
    max_select integer NOT NULL DEFAULT 20,
    is_active boolean NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "PK_user_profile_sections" PRIMARY KEY (id),
    CONSTRAINT "UQ_user_profile_sections_slug" UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS user_profile_terms (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    section_id uuid NOT NULL,
    slug character varying(120) NOT NULL,
    label_vi character varying(200) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    maps_to_gym_taxonomy_term_id uuid,
    is_active boolean NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "PK_user_profile_terms" PRIMARY KEY (id),
    CONSTRAINT "UQ_user_profile_terms_section_slug" UNIQUE (section_id, slug),
    CONSTRAINT "FK_user_profile_terms_section" FOREIGN KEY (section_id)
        REFERENCES user_profile_sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profile_term_selections (
    user_id uuid NOT NULL,
    term_id uuid NOT NULL,
    CONSTRAINT "PK_user_profile_term_selections" PRIMARY KEY (user_id, term_id),
    CONSTRAINT "FK_ups_user" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT "FK_ups_term" FOREIGN KEY (term_id) REFERENCES user_profile_terms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_user_profile_terms_section" ON user_profile_terms (section_id);

INSERT INTO user_profile_sections (slug, title_vi, description_vi, sort_order, applies_to, min_select, max_select)
VALUES
    ('health_goals', 'Mục tiêu của bạn', 'Chọn mục tiêu sức khỏe — không bắt buộc khi đăng ký.', 10,
     '["user","athlete"]'::jsonb, 0, 8),
    ('coach_specialties', 'Chuyên môn huấn luyện', 'Lĩnh vực bạn huấn luyện tốt nhất.', 20,
     '["trainer"]'::jsonb, 0, 12)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO user_profile_terms (section_id, slug, label_vi, sort_order)
SELECT s.id, v.slug, v.label_vi, v.sort_order
FROM user_profile_sections s
CROSS JOIN (VALUES
    ('fat_loss', 'Giảm mỡ', 10),
    ('muscle_gain', 'Tăng cơ', 20),
    ('maintain', 'Giữ form', 30),
    ('general_health', 'Sức khỏe tổng thể', 40),
    ('competition', 'Thi đấu', 50),
    ('rehab', 'Phục hồi / vận động an toàn', 60),
    ('mobility', 'Linh hoạt / giãn cơ', 70),
    ('stress_relief', 'Giảm căng thẳng', 80)
) AS v(slug, label_vi, sort_order)
WHERE s.slug = 'health_goals'
ON CONFLICT (section_id, slug) DO NOTHING;

INSERT INTO user_profile_terms (section_id, slug, label_vi, sort_order)
SELECT s.id, v.slug, v.label_vi, v.sort_order
FROM user_profile_sections s
CROSS JOIN (VALUES
    ('muscle', 'Tăng cơ', 10),
    ('fat_loss', 'Giảm mỡ', 20),
    ('powerlifting', 'Powerlifting', 30),
    ('yoga', 'Yoga', 40),
    ('pilates', 'Pilates', 50),
    ('rehab', 'Phục hồi chấn thương', 60),
    ('calisthenics', 'Calisthenics', 70),
    ('endurance', 'Thể lực (endurance)', 80)
) AS v(slug, label_vi, sort_order)
WHERE s.slug = 'coach_specialties'
ON CONFLICT (section_id, slug) DO NOTHING;
