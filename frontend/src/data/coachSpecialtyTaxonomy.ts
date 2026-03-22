/** Nhóm chuyên môn cho directory Coach / VĐV — map với chip lọc API `specialty` (một giá trị mỗi lần). */

export interface SpecialtyCategory {
    id: string;
    label: string;
    description: string;
    /** Giá trị gửi API khi bấm lối tắt hero (đại diện nhóm) */
    shortcutSpecialty: string;
    items: readonly string[];
}

export const SPECIALTY_CATEGORIES: readonly SpecialtyCategory[] = [
    {
        id: 'strength',
        label: 'Sức mạnh & thể hình',
        description: 'Tăng cơ, sức mạnh, thể hình.',
        shortcutSpecialty: 'Bodybuilding',
        items: ['Gym tổng hợp', 'Bodybuilding', 'Powerlifting', 'Calisthenics'],
    },
    {
        id: 'cardio',
        label: 'Cardio & HIIT',
        description: 'Sức bền, đốt mỡ, nhịp cao.',
        shortcutSpecialty: 'HIIT',
        items: ['Cardio', 'HIIT', 'Zumba', 'Dance Fitness'],
    },
    {
        id: 'mindbody',
        label: 'Mind-body',
        description: 'Yoga, pilates, dẻo dai.',
        shortcutSpecialty: 'Yoga',
        items: ['Yoga', 'Pilates', 'Stretching'],
    },
    {
        id: 'combat',
        label: 'Võ thuật & functional',
        description: 'Đòn tay, phản xạ, CrossFit.',
        shortcutSpecialty: 'Boxing',
        items: ['CrossFit', 'Boxing', 'Kickboxing', 'Muay Thai'],
    },
    {
        id: 'wellness',
        label: 'Dinh dưỡng & phục hồi',
        description: 'Ăn uống, vật lý trị liệu.',
        shortcutSpecialty: 'Dinh dưỡng',
        items: ['Dinh dưỡng', 'Phục hồi chức năng'],
    },
    {
        id: 'other',
        label: 'Khác',
        description: 'Bơi và chuyên môn khác.',
        shortcutSpecialty: 'Bơi lội',
        items: ['Bơi lội'],
    },
] as const;

export const ALL_SPECIALTIES: string[] = SPECIALTY_CATEGORIES.flatMap((c) => [...c.items]);

export function categoryIdForSpecialty(specialty: string): string | null {
    const s = specialty.trim();
    if (!s) return null;
    const cat = SPECIALTY_CATEGORIES.find((c) => c.items.includes(s));
    return cat?.id ?? null;
}
