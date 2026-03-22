import type { GymTaxonomySeed, ReferenceCategorySeed, UserProfileCatalogSeed } from './types';

export const PRODUCT_CATEGORY_SEEDS: ReferenceCategorySeed[] = [
    { slug: 'training-programs', label: 'Giáo án tập luyện', product_type: 'digital', icon_emoji: '📘', sort_order: 10 },
    { slug: 'meal-guides', label: 'Meal guide', product_type: 'digital', icon_emoji: '🥗', sort_order: 20 },
    { slug: 'coach-consultation', label: 'Tư vấn 1-1', product_type: 'service', icon_emoji: '🗓️', sort_order: 30, requires_moderation: true },
    { slug: 'mobility-tools', label: 'Dụng cụ mobility', product_type: 'physical', icon_emoji: '🧘', sort_order: 40 },
    { slug: 'gym-gear', label: 'Phụ kiện tập luyện', product_type: 'physical', icon_emoji: '🎽', sort_order: 50 },
    { slug: 'combat-gear', label: 'Đồ boxing & combat', product_type: 'physical', icon_emoji: '🥊', sort_order: 60 },
    { slug: 'recovery-tools', label: 'Recovery & chăm sóc cơ thể', product_type: 'physical', icon_emoji: '🛀', sort_order: 70 },
    { slug: 'supplements', label: 'Thực phẩm bổ trợ', product_type: 'physical', icon_emoji: '🥤', sort_order: 80 },
    { slug: 'gym-merch', label: 'Gym merch', product_type: 'physical', icon_emoji: '🛍️', sort_order: 90 },
];

export const GYM_TAXONOMY_SEEDS: GymTaxonomySeed[] = [
    { slug: 'gym', label: 'Gym tổng hợp', term_type: 'venue_type', sort_order: 10 },
    { slug: 'strength-gym', label: 'Gym sức mạnh', term_type: 'venue_type', sort_order: 20 },
    { slug: 'boxing-gym', label: 'Phòng boxing', term_type: 'venue_type', sort_order: 30 },
    { slug: 'yoga-studio', label: 'Yoga studio', term_type: 'venue_type', sort_order: 40 },
    { slug: 'pilates-studio', label: 'Pilates studio', term_type: 'venue_type', sort_order: 50 },
    { slug: 'recovery-club', label: 'Recovery club', term_type: 'venue_type', sort_order: 60 },
    { slug: 'hybrid-training', label: 'Hybrid training', term_type: 'training_style', sort_order: 70 },
    { slug: 'group-class-heavy', label: 'Nhiều lớp nhóm', term_type: 'training_style', sort_order: 80 },
    { slug: 'free-weight-focus', label: 'Tập tạ tự do', term_type: 'training_style', sort_order: 90 },
    { slug: 'recovery-first', label: 'Ưu tiên recovery', term_type: 'training_style', sort_order: 100 },
    { slug: 'beginner-friendly', label: 'Dễ bắt đầu', term_type: 'audience', sort_order: 110 },
    { slug: 'women-friendly', label: 'Thoải mái cho nữ', term_type: 'audience', sort_order: 120 },
    { slug: 'family-friendly', label: 'Phù hợp gia đình', term_type: 'audience', sort_order: 130 },
    { slug: 'athlete-ready', label: 'Hợp cho athlete', term_type: 'audience', sort_order: 140 },
    { slug: 'budget', label: 'Giá mềm', term_type: 'positioning', sort_order: 150 },
    { slug: 'premium', label: 'Premium', term_type: 'positioning', sort_order: 160 },
    { slug: 'membership-first', label: 'Đi theo membership', term_type: 'service_model', sort_order: 170 },
    { slug: 'class-first', label: 'Đi theo class', term_type: 'service_model', sort_order: 180 },
    { slug: 'cold-plunge', label: 'Cold plunge', term_type: 'recovery_type', sort_order: 190 },
    { slug: 'sauna', label: 'Sauna', term_type: 'recovery_type', sort_order: 200 },
    { slug: 'focused', label: 'Tập trung, ít ồn', term_type: 'atmosphere', sort_order: 210 },
    { slug: 'community', label: 'Có cộng đồng', term_type: 'atmosphere', sort_order: 220 },
];

export const USER_PROFILE_CATALOG_SEEDS: UserProfileCatalogSeed[] = [
    {
        section: {
            slug: 'health_goals',
            title_vi: 'Mục tiêu tập luyện',
            description_vi: 'Chọn điều bạn đang ưu tiên nhất lúc này để app gợi ý phù hợp hơn.',
            sort_order: 10,
            applies_to: ['user', 'athlete', 'trainer', 'gym_owner'],
            min_select: 1,
            max_select: 3,
        },
        terms: [
            { slug: 'fat_loss', label_vi: 'Giảm mỡ', sort_order: 10 },
            { slug: 'muscle_gain', label_vi: 'Tăng cơ', sort_order: 20 },
            { slug: 'maintain', label_vi: 'Giữ form', sort_order: 30 },
            { slug: 'general_health', label_vi: 'Khỏe hơn mỗi ngày', sort_order: 40 },
            { slug: 'competition', label_vi: 'Chuẩn bị thi đấu', sort_order: 50 },
            { slug: 'rehab', label_vi: 'Phục hồi chấn thương', sort_order: 60 },
            { slug: 'mobility', label_vi: 'Dẻo hơn, đỡ đau mỏi', sort_order: 70 },
            { slug: 'stress_relief', label_vi: 'Ngủ ngon, bớt stress', sort_order: 80 },
        ],
    },
    {
        section: {
            slug: 'coach_specialties',
            title_vi: 'Chuyên môn huấn luyện',
            description_vi: 'Các mảng coach muốn được tìm thấy nhiều hơn trên hồ sơ.',
            sort_order: 20,
            applies_to: ['trainer', 'athlete'],
            min_select: 1,
            max_select: 4,
        },
        terms: [
            { slug: 'muscle', label_vi: 'Tăng cơ', sort_order: 10 },
            { slug: 'fat_loss', label_vi: 'Giảm mỡ', sort_order: 20 },
            { slug: 'powerlifting', label_vi: 'Powerlifting', sort_order: 30 },
            { slug: 'yoga', label_vi: 'Yoga', sort_order: 40 },
            { slug: 'pilates', label_vi: 'Pilates', sort_order: 50 },
            { slug: 'rehab', label_vi: 'Phục hồi', sort_order: 60 },
            { slug: 'calisthenics', label_vi: 'Calisthenics', sort_order: 70 },
            { slug: 'endurance', label_vi: 'Sức bền', sort_order: 80 },
        ],
    },
];
