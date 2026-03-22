import { generateSlug } from '../../utils/slugify';
import { imagesByKind } from './imageManifest';
import type {
    MockAthleteRecord,
    MockCoachRecord,
    MockDataset,
    MockGalleryRecord,
    MockGymOwnerRecord,
    MockGymRecord,
    MockMemberRecord,
    MockMessageThread,
    MockProductOrderRecord,
    MockProductRecord,
    MockProductReviewRecord,
    MockShopRecord,
    MockWishlistRecord,
    SeedImageKind,
} from './types';

const DEMO_EMAIL_DOMAIN = 'seed.gymerviet.demo';
const DOWNLOAD_BASE = 'https://downloads.gymerviet.demo/products';
const PROFILE_BASE = 'https://gymerviet.com';

const buildSchedule = (
    weekdayOpen: string,
    weekdayClose: string,
    saturday: { open: string; close: string } = { open: weekdayOpen, close: weekdayClose },
    sunday: { open: string; close: string } | null = null,
) => ({
    mon: { open: weekdayOpen, close: weekdayClose },
    tue: { open: weekdayOpen, close: weekdayClose },
    wed: { open: weekdayOpen, close: weekdayClose },
    thu: { open: weekdayOpen, close: weekdayClose },
    fri: { open: weekdayOpen, close: weekdayClose },
    sat: { open: saturday.open, close: saturday.close },
    sun: sunday ? { open: sunday.open, close: sunday.close } : { open: '', close: '', is_closed: true },
});

const roundMoney = (value: number) => Math.round(value / 10000) * 10000;

const slugEmail = (slug: string) => `${slug}@${DEMO_EMAIL_DOMAIN}`;
const shopEmail = (slug: string) => `shop+${slug}@${DEMO_EMAIL_DOMAIN}`;

const shortName = (fullName: string) => fullName.split(' ').slice(-1)[0] ?? fullName;

const cycle = <T,>(items: readonly T[], index: number): T => items[index % items.length];

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

function selectImages(kind: SeedImageKind, count: number, offset: number, tag?: string): string[] {
    const basePool = imagesByKind(kind);
    const filtered = tag ? basePool.filter((entry) => entry.tags.includes(tag)) : basePool;
    const pool = filtered.length >= count ? filtered : basePool;
    return range(count).map((step) => cycle(pool, offset + step).url);
}

function selectImage(kind: SeedImageKind, offset: number, tag?: string): string {
    return selectImages(kind, 1, offset, tag)[0];
}

function buildProgramStructure(focus: string, index: number) {
    const lifts = [
        `${focus} kỹ thuật`,
        'Bài chính RPE 7',
        'Bài phụ giữ nhịp',
        'Cooldown 8 phút',
    ];
    return {
        week_1: {
            day_1: {
                title: 'Buổi 1 · Vào nhịp',
                warmup: '5 phút khởi động khớp + 2 set nhẹ',
                cooldown: 'Đi bộ chậm 5 phút và giãn hông',
                exercises: [
                    { name: lifts[0], sets: 4, reps: '6-8', rest_seconds: 90 },
                    { name: lifts[1], sets: 4, reps: '8', rest_seconds: 120 },
                    { name: lifts[2], sets: 3, reps: '10-12', rest_seconds: 75 },
                ],
            },
            day_2: {
                title: 'Buổi 2 · Tăng nhịp tim',
                warmup: 'Mobility 6 phút + band activation',
                cooldown: 'Thở phục hồi 3 phút',
                exercises: [
                    { name: `${focus} tempo`, sets: 3, reps: '10', rest_seconds: 60 },
                    { name: 'Circuit 12 phút', sets: 4, reps: '45 giây / trạm', rest_seconds: 30 },
                    { name: 'Core finisher', sets: 3, reps: '40 giây', rest_seconds: 30 },
                ],
            },
        },
        week_2: {
            day_1: {
                title: 'Buổi 3 · Chồng tiến độ',
                warmup: 'Đi bộ nhanh 5 phút + dynamic stretch',
                cooldown: 'Foam roll 5 phút',
                exercises: [
                    { name: `${focus} nặng vừa`, sets: 5, reps: '5', rest_seconds: 150 },
                    { name: 'Bài phụ unilateral', sets: 3, reps: '8 mỗi bên', rest_seconds: 75 },
                    { name: 'Conditioning cuối buổi', sets: 5, reps: '30 giây làm / 30 giây nghỉ', rest_seconds: 30 },
                ],
            },
            day_2: {
                title: 'Buổi 4 · Hồi lại đúng cách',
                warmup: 'Flow 8 phút',
                cooldown: 'Giãn lưng và hông 6 phút',
                exercises: [
                    { name: 'Mobility block', sets: 3, reps: '8-10 nhịp', rest_seconds: 20 },
                    { name: `${focus} kỹ thuật nhẹ`, sets: 3, reps: '12', rest_seconds: 60 },
                    { name: 'Đi bộ hoặc spin nhẹ', sets: 1, reps: '20 phút', rest_seconds: 0 },
                ],
            },
        },
    };
}

type CoachArchetype = {
    imageTag: string;
    specialties: string[];
    focus: string;
    audience: string;
    outcome: string;
    packageThemes: string[];
    productFocus: string;
    goals: string[];
};

const coachArchetypes: Record<string, CoachArchetype> = {
    calisthenics: {
        imageTag: 'calisthenics',
        specialties: ['Calisthenics', 'Bodyweight', 'Mobility'],
        focus: 'làm chủ trọng lượng cơ thể',
        audience: 'người thích tập ngoài trời và muốn mạnh lên rõ rệt',
        outcome: 'lên xà chắc hơn, vai khỏe hơn và tập không còn lo đau cổ tay',
        packageThemes: ['Nền tảng 1-1', 'Skill build', 'Form check'],
        productFocus: 'bodyweight',
        goals: ['general_fitness', 'mobility', 'muscle_gain'],
    },
    pilates: {
        imageTag: 'pilates',
        specialties: ['Pilates', 'Core Strength', 'Posture'],
        focus: 'siết core và sửa tư thế',
        audience: 'dân văn phòng, mẹ bỉm hoặc người hay đau lưng',
        outcome: 'đứng thẳng hơn, bụng gọn hơn và người nhẹ ra sau vài tuần',
        packageThemes: ['Pilates đều nhịp', 'Core & posture', 'Reformer mix'],
        productFocus: 'pilates',
        goals: ['general_fitness', 'mobility', 'stress_relief'],
    },
    physique: {
        imageTag: 'strength',
        specialties: ['Hypertrophy', 'Body Recomp', 'Nutrition'],
        focus: 'tăng cơ có số đo và siết mỡ không rối đầu',
        audience: 'người muốn body gọn mà vẫn có lực',
        outcome: 'ăn dễ hơn, tập có log rõ ràng và nhìn form lên thật',
        packageThemes: ['Body recomposition', 'Lean bulk', 'Contest prep'],
        productFocus: 'strength',
        goals: ['muscle_gain', 'fat_loss', 'competition'],
    },
    yoga: {
        imageTag: 'yoga',
        specialties: ['Yoga', 'Breathwork', 'Mobility'],
        focus: 'thở sâu, mềm người và ngủ ngon hơn',
        audience: 'người cần một nhịp tập bền và không áp lực',
        outcome: 'vai gáy đỡ cứng, tinh thần dịu lại và lịch tập dễ theo',
        packageThemes: ['Flow chậm', 'Breath reset', 'Yoga phục hồi'],
        productFocus: 'yoga',
        goals: ['stress_relief', 'mobility', 'general_health'],
    },
    hybrid: {
        imageTag: 'conditioning',
        specialties: ['Hybrid Fitness', 'Conditioning', 'Endurance'],
        focus: 'vừa khỏe vừa bền chứ không lệch một phía',
        audience: 'người thích chạy, đạp hoặc tập mạch nhưng vẫn muốn giữ cơ',
        outcome: 'tim phổi lên thấy rõ mà sức tạ không tụt',
        packageThemes: ['Hybrid base', 'Race prep', 'Conditioning lab'],
        productFocus: 'conditioning',
        goals: ['endurance', 'fat_loss', 'general_fitness'],
    },
    boxing: {
        imageTag: 'boxing',
        specialties: ['Boxing', 'Footwork', 'Conditioning'],
        focus: 'ra đòn gọn, chân tay nhịp nhàng và cardio tốt hơn',
        audience: 'người muốn tập vui nhưng vẫn có tính kỹ thuật',
        outcome: 'đỡ vụng tay, đỡ hụt hơi và tự tin hơn hẳn khi vào bài',
        packageThemes: ['Boxing nhập môn', 'Footwork & combo', 'Fight camp cơ bản'],
        productFocus: 'combat',
        goals: ['general_fitness', 'fat_loss', 'competition'],
    },
    running: {
        imageTag: 'run',
        specialties: ['Running', 'Pacing', 'Strength for Runners'],
        focus: 'chạy đỡ hụt, pace ổn và chân không nát sau race',
        audience: 'runner cuối tuần hoặc người đang ôn 5K-21K',
        outcome: 'có lịch chạy dễ bám, biết hôm nào phải nghỉ và không tập quá tay',
        packageThemes: ['5K steady', '10K build', 'Half marathon prep'],
        productFocus: 'run',
        goals: ['endurance', 'general_health', 'competition'],
    },
    rehab: {
        imageTag: 'recovery',
        specialties: ['Rehab', 'Mobility', 'Pain-free Training'],
        focus: 'tập lại êm hơn sau giai đoạn đau mỏi hoặc nghỉ dài',
        audience: 'người hay đau lưng, đau vai hoặc vừa quay lại tập',
        outcome: 'biết giới hạn cơ thể và lên lại nhịp tập mà không sợ tái đau',
        packageThemes: ['Quay lại tập', 'Vai lưng dễ chịu', 'Mobility phục hồi'],
        productFocus: 'recovery',
        goals: ['rehab', 'mobility', 'general_health'],
    },
    powerlifting: {
        imageTag: 'strength',
        specialties: ['Powerlifting', 'Strength', 'Technique'],
        focus: 'đẩy squat bench dead lên bằng kỹ thuật tử tế',
        audience: 'người mê sức mạnh và muốn log số rõ ràng',
        outcome: 'bar path gọn hơn, ăn ngủ có nhịp và PR bền hơn',
        packageThemes: ['Big 3 base', 'Meet prep', 'Technique audit'],
        productFocus: 'strength',
        goals: ['muscle_gain', 'competition', 'general_fitness'],
    },
    mobility: {
        imageTag: 'mobility',
        specialties: ['Mobility', 'Recovery', 'Desk Reset'],
        focus: 'đỡ cứng người và dễ duy trì lịch tập giữa guồng làm việc',
        audience: 'người ngồi nhiều, stress nhiều hoặc ngủ không sâu',
        outcome: 'cơ thể mở hơn, tinh thần dễ chịu hơn và quay lại tập đều hơn',
        packageThemes: ['Desk reset', 'Mobility đều', 'Recovery rhythm'],
        productFocus: 'recovery',
        goals: ['mobility', 'stress_relief', 'general_health'],
    },
};

type AthleteArchetype = {
    imageTag: string;
    specialties: string[];
    focus: string;
    achievement: string;
    interests: string[];
};

const athleteArchetypes: Record<string, AthleteArchetype> = {
    runner: {
        imageTag: 'run',
        specialties: ['Running', 'Endurance'],
        focus: 'đi đường dài mà vẫn giữ cảm giác chân tươi',
        achievement: 'Hoàn thành race đúng pace mục tiêu',
        interests: ['running', 'mobility'],
    },
    yoga: {
        imageTag: 'yoga',
        specialties: ['Yoga', 'Mobility'],
        focus: 'giữ nhịp thở ổn và cơ thể mềm bền theo năm',
        achievement: 'Dạy workshop chia sẻ kỹ thuật thở',
        interests: ['yoga', 'wellness'],
    },
    boxing: {
        imageTag: 'boxing',
        specialties: ['Boxing', 'Conditioning'],
        focus: 'vào bài sắc hơn nhưng vẫn tỉnh đầu',
        achievement: 'Thi đấu amateur với nhịp ra đòn sạch',
        interests: ['boxing', 'conditioning'],
    },
    pilates: {
        imageTag: 'pilates',
        specialties: ['Pilates', 'Core Strength'],
        focus: 'cân bằng lại cơ thể sau thời gian ngồi nhiều',
        achievement: 'Duy trì đều 4 buổi mỗi tuần suốt 6 tháng',
        interests: ['pilates', 'posture'],
    },
    powerlifting: {
        imageTag: 'strength',
        specialties: ['Powerlifting', 'Strength'],
        focus: 'tăng lực có kiểm soát chứ không đẩy đại',
        achievement: 'Tăng tổng mức tạ trong mùa giải gần nhất',
        interests: ['powerlifting', 'recovery'],
    },
    calisthenics: {
        imageTag: 'calisthenics',
        specialties: ['Calisthenics', 'Bodyweight'],
        focus: 'khóa form đẹp và có thể biểu diễn kỹ thuật',
        achievement: 'Mở được kỹ năng mới sau block 12 tuần',
        interests: ['bodyweight', 'mobility'],
    },
    hybrid: {
        imageTag: 'conditioning',
        specialties: ['Hybrid Fitness', 'Conditioning'],
        focus: 'vừa chạy vừa kéo tạ mà người vẫn ổn',
        achievement: 'Giữ pace chạy tốt trong lúc vẫn tăng lực',
        interests: ['hybrid', 'endurance'],
    },
    physique: {
        imageTag: 'strength',
        specialties: ['Physique', 'Body Recomp'],
        focus: 'điều chỉnh body composition chậm mà chắc',
        achievement: 'Lên form rõ nét trước mùa chụp hình',
        interests: ['bodybuilding', 'nutrition'],
    },
    rehab: {
        imageTag: 'recovery',
        specialties: ['Recovery', 'Mobility'],
        focus: 'quay lại vận động đều mà không sợ đau tái',
        achievement: 'Trở lại tập đều sau một quãng nghỉ dài',
        interests: ['recovery', 'mobility'],
    },
};

const coachSpecs = [
    { key: 'coach-hoang', full_name: 'Phan Minh Hoàng', city: 'Hà Nội', district: 'Ba Đình', archetype: 'calisthenics', years: 7, clients: 146, stories: 44, verified: true, accepting: true, basePrice: 1600000 },
    { key: 'coach-linh', full_name: 'Lê Thuỳ Linh', city: 'TP. Hồ Chí Minh', district: 'Quận 3', archetype: 'pilates', years: 6, clients: 214, stories: 68, verified: true, accepting: true, basePrice: 1350000 },
    { key: 'coach-david', full_name: 'David Nguyễn', city: 'TP. Hồ Chí Minh', district: 'Quận 7', archetype: 'physique', years: 10, clients: 132, stories: 39, verified: true, accepting: true, basePrice: 2550000 },
    { key: 'coach-nhi', full_name: 'Nguyễn Diệu Nhi', city: 'Đà Nẵng', district: 'Hải Châu', archetype: 'yoga', years: 8, clients: 168, stories: 57, verified: true, accepting: true, basePrice: 1250000 },
    { key: 'coach-huong', full_name: 'Mai Hương', city: 'TP. Hồ Chí Minh', district: 'Thủ Đức', archetype: 'hybrid', years: 7, clients: 151, stories: 48, verified: true, accepting: true, basePrice: 1750000 },
    { key: 'coach-khoa', full_name: 'Trần Anh Khoa', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', archetype: 'boxing', years: 9, clients: 119, stories: 33, verified: true, accepting: true, basePrice: 1850000 },
    { key: 'coach-huy', full_name: 'Bùi Quang Huy', city: 'Hà Nội', district: 'Cầu Giấy', archetype: 'running', years: 6, clients: 142, stories: 41, verified: true, accepting: true, basePrice: 1450000 },
    { key: 'coach-an-nhien', full_name: 'Võ An Nhiên', city: 'Đà Nẵng', district: 'Sơn Trà', archetype: 'rehab', years: 8, clients: 122, stories: 52, verified: true, accepting: true, basePrice: 1500000 },
    { key: 'coach-nam', full_name: 'Đặng Quốc Nam', city: 'Hải Phòng', district: 'Lê Chân', archetype: 'powerlifting', years: 9, clients: 111, stories: 36, verified: true, accepting: false, basePrice: 2100000 },
    { key: 'coach-tam', full_name: 'Trần Minh Tâm', city: 'Cần Thơ', district: 'Ninh Kiều', archetype: 'mobility', years: 5, clients: 136, stories: 47, verified: true, accepting: true, basePrice: 1200000 },
    { key: 'coach-gia-bao', full_name: 'Phạm Gia Bảo', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', archetype: 'calisthenics', years: 5, clients: 96, stories: 28, verified: false, accepting: true, basePrice: 1300000 },
    { key: 'coach-nhu-y', full_name: 'Hoàng Như Ý', city: 'Hà Nội', district: 'Tây Hồ', archetype: 'pilates', years: 7, clients: 176, stories: 58, verified: true, accepting: true, basePrice: 1500000 },
    { key: 'coach-phuc', full_name: 'Nguyễn Đức Phúc', city: 'Đà Nẵng', district: 'Hải Châu', archetype: 'physique', years: 6, clients: 88, stories: 24, verified: false, accepting: true, basePrice: 1700000 },
    { key: 'coach-thao-my', full_name: 'Lâm Thảo My', city: 'Nha Trang', district: 'Vạn Thạnh', archetype: 'yoga', years: 5, clients: 143, stories: 46, verified: true, accepting: true, basePrice: 1180000 },
    { key: 'coach-hoai-an', full_name: 'Vũ Hoài An', city: 'TP. Hồ Chí Minh', district: 'Phú Nhuận', archetype: 'hybrid', years: 6, clients: 102, stories: 31, verified: false, accepting: true, basePrice: 1580000 },
    { key: 'coach-nhat-minh', full_name: 'Trần Nhật Minh', city: 'Hà Nội', district: 'Đống Đa', archetype: 'boxing', years: 7, clients: 93, stories: 27, verified: true, accepting: true, basePrice: 1680000 },
    { key: 'coach-thu-uyen', full_name: 'Phạm Thu Uyên', city: 'TP. Hồ Chí Minh', district: 'Thảo Điền', archetype: 'running', years: 5, clients: 97, stories: 29, verified: true, accepting: false, basePrice: 1420000 },
    { key: 'coach-quoc-khanh', full_name: 'Lê Quốc Khánh', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', archetype: 'rehab', years: 8, clients: 117, stories: 49, verified: true, accepting: true, basePrice: 1620000 },
    { key: 'coach-gia-linh', full_name: 'Đoàn Gia Linh', city: 'TP. Hồ Chí Minh', district: 'Quận 10', archetype: 'powerlifting', years: 6, clients: 84, stories: 22, verified: false, accepting: true, basePrice: 1950000 },
    { key: 'coach-hai-nam', full_name: 'Nguyễn Hải Nam', city: 'Huế', district: 'Phú Hội', archetype: 'mobility', years: 6, clients: 129, stories: 43, verified: true, accepting: true, basePrice: 1260000 },
] as const;

const athleteSpecs = [
    { key: 'athlete-ngoc-anh', full_name: 'Trần Ngọc Anh', city: 'Hà Nội', district: 'Long Biên', archetype: 'runner', experience: 'intermediate' },
    { key: 'athlete-khanh-vy', full_name: 'Phạm Khánh Vy', city: 'Đà Nẵng', district: 'Sơn Trà', archetype: 'yoga', experience: 'advanced' },
    { key: 'athlete-huu-tai', full_name: 'Lê Hữu Tài', city: 'TP. Hồ Chí Minh', district: 'Phú Nhuận', archetype: 'boxing', experience: 'advanced' },
    { key: 'athlete-nhat-ha', full_name: 'Nguyễn Nhật Hạ', city: 'TP. Hồ Chí Minh', district: 'Quận 2', archetype: 'pilates', experience: 'intermediate' },
    { key: 'athlete-minh-phuc', full_name: 'Đỗ Minh Phúc', city: 'Hải Phòng', district: 'Ngô Quyền', archetype: 'powerlifting', experience: 'advanced' },
    { key: 'athlete-kim-oanh', full_name: 'Bùi Kim Oanh', city: 'Hà Nội', district: 'Nam Từ Liêm', archetype: 'calisthenics', experience: 'intermediate' },
    { key: 'athlete-quang-duy', full_name: 'Võ Quang Duy', city: 'TP. Hồ Chí Minh', district: 'Quận 7', archetype: 'hybrid', experience: 'intermediate' },
    { key: 'athlete-tu-linh', full_name: 'Lê Tú Linh', city: 'TP. Hồ Chí Minh', district: 'Quận 3', archetype: 'physique', experience: 'advanced' },
    { key: 'athlete-hai-yen', full_name: 'Trương Hải Yến', city: 'Nha Trang', district: 'Lộc Thọ', archetype: 'runner', experience: 'intermediate' },
    { key: 'athlete-thanh-tung', full_name: 'Phan Thanh Tùng', city: 'Cần Thơ', district: 'Ninh Kiều', archetype: 'rehab', experience: 'beginner' },
    { key: 'athlete-bao-tram', full_name: 'Huỳnh Bảo Trâm', city: 'Huế', district: 'Vỹ Dạ', archetype: 'runner', experience: 'intermediate' },
    { key: 'athlete-trong-nhan', full_name: 'Ngô Trọng Nhân', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', archetype: 'boxing', experience: 'intermediate' },
    { key: 'athlete-my-duyen', full_name: 'Trần Mỹ Duyên', city: 'Đà Nẵng', district: 'Hải Châu', archetype: 'yoga', experience: 'advanced' },
    { key: 'athlete-gia-hung', full_name: 'Nguyễn Gia Hưng', city: 'Hà Nội', district: 'Cầu Giấy', archetype: 'calisthenics', experience: 'intermediate' },
    { key: 'athlete-tuong-vy', full_name: 'Phạm Tường Vy', city: 'TP. Hồ Chí Minh', district: 'Thủ Đức', archetype: 'pilates', experience: 'intermediate' },
    { key: 'athlete-duc-anh', full_name: 'Lê Đức Anh', city: 'Hà Nội', district: 'Hoàng Mai', archetype: 'powerlifting', experience: 'advanced' },
    { key: 'athlete-yen-nhi', full_name: 'Đoàn Yến Nhi', city: 'TP. Hồ Chí Minh', district: 'Quận 1', archetype: 'hybrid', experience: 'intermediate' },
    { key: 'athlete-hoang-long', full_name: 'Trương Hoàng Long', city: 'Đà Nẵng', district: 'Ngũ Hành Sơn', archetype: 'physique', experience: 'advanced' },
    { key: 'athlete-thanh-mai', full_name: 'Nguyễn Thanh Mai', city: 'Hà Nội', district: 'Tây Hồ', archetype: 'runner', experience: 'intermediate' },
    { key: 'athlete-phuoc-thanh', full_name: 'Phạm Phước Thành', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', archetype: 'rehab', experience: 'beginner' },
] as const;

const memberSpecs = [
    { key: 'member-thao', full_name: 'Phạm Bích Thảo', city: 'TP. Hồ Chí Minh', district: 'Quận 4', goal: 'fat_loss', interests: ['pilates', 'walking', 'meal-prep'], bio: 'Đi làm agency, tối ráng giữ 3 buổi tập/tuần để ngủ ngon hơn.' },
    { key: 'member-kiet', full_name: 'Lương Minh Kiệt', city: 'Hà Nội', district: 'Thanh Xuân', goal: 'muscle_gain', interests: ['gym', 'meal-prep', 'supplements'], bio: 'Dân IT, đang cố tăng cân gọn chứ không muốn bụng đi trước.' },
    { key: 'member-van', full_name: 'Nguyễn Hoài Vân', city: 'Đà Nẵng', district: 'Hải Châu', goal: 'stress_relief', interests: ['yoga', 'breathwork', 'mobility'], bio: 'Thích lịch tập nhẹ đầu, không áp lực nhưng vẫn thấy người khỏe lên.' },
    { key: 'member-son', full_name: 'Trần Minh Sơn', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', goal: 'general_health', interests: ['boxing', 'conditioning', 'recovery'], bio: 'Ca làm hơi thất thường nên cần app gợi đúng kiểu tập linh hoạt.' },
    { key: 'member-uyen', full_name: 'Hoàng Thu Uyên', city: 'Hà Nội', district: 'Long Biên', goal: 'mobility', interests: ['pilates', 'desk-reset', 'recovery'], bio: 'Ngồi nhiều nên ưu tiên đỡ đau vai gáy trước rồi mới siết dáng.' },
    { key: 'member-hieu', full_name: 'Phạm Đức Hiếu', city: 'Hải Phòng', district: 'Lê Chân', goal: 'maintain', interests: ['strength', 'running', 'nutrition'], bio: 'Tập để giữ nhịp sống ổn định, không thích giáo án quá cầu kỳ.' },
    { key: 'member-tram', full_name: 'Lê Ngọc Trâm', city: 'Huế', district: 'Phú Hội', goal: 'fat_loss', interests: ['walking', 'pilates', 'healthy-food'], bio: 'Mới quay lại tập sau thời gian chăm em bé nên cần thứ gì dễ theo.' },
    { key: 'member-tung', full_name: 'Vũ Nhật Tùng', city: 'TP. Hồ Chí Minh', district: 'Thủ Đức', goal: 'muscle_gain', interests: ['powerlifting', 'mobility', 'gear'], bio: 'Thích log số và muốn app nói chuyện đơn giản, không màu mè.' },
    { key: 'member-han', full_name: 'Ngô Gia Hân', city: 'Nha Trang', district: 'Vĩnh Hải', goal: 'general_health', interests: ['yoga', 'recovery', 'community'], bio: 'Tập chủ yếu để tinh thần ổn hơn, bonus có dáng đẹp thì càng vui.' },
    { key: 'member-thinh', full_name: 'Đặng Gia Thịnh', city: 'Cần Thơ', district: 'Ninh Kiều', goal: 'rehab', interests: ['mobility', 'stretching', 'walking'], bio: 'Vừa đau lưng xong nên giờ ưu tiên tập không bị dội lại.' },
    { key: 'member-quynh', full_name: 'Nguyễn Minh Quỳnh', city: 'TP. Hồ Chí Minh', district: 'Quận 10', goal: 'stress_relief', interests: ['yoga', 'breathwork', 'tea-time'], bio: 'Muốn app bớt cảm giác phòng gym nặng nề, gần gũi hơn là tốt nhất.' },
    { key: 'member-dat', full_name: 'Phan Quốc Đạt', city: 'Hà Nội', district: 'Đống Đa', goal: 'general_health', interests: ['running', 'gym', 'shaker'], bio: 'Tập để còn có sức chơi với con chứ không chạy theo số quá nhiều.' },
    { key: 'member-lan', full_name: 'Bùi Ngọc Lan', city: 'Đà Nẵng', district: 'Sơn Trà', goal: 'maintain', interests: ['pilates', 'mobility', 'community'], bio: 'Thích mấy hồ sơ thật thà kiểu “chưa có giá” hơn là làm quá.' },
    { key: 'member-khang', full_name: 'Trần Hoàng Khang', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', goal: 'muscle_gain', interests: ['gym', 'protein-snacks', 'recovery'], bio: 'Mới đi tập lại nên cần thấy đúng chỗ bắt đầu cho người bình thường.' },
    { key: 'member-diem', full_name: 'Lý Thu Diễm', city: 'Hà Nội', district: 'Tây Hồ', goal: 'mobility', interests: ['yoga', 'pilates', 'wellness'], bio: 'Cần chỗ xem coach và studio nhanh, đỡ phải nhảy nhiều tab.' },
    { key: 'member-phat', full_name: 'Nguyễn Hữu Phát', city: 'TP. Hồ Chí Minh', district: 'Quận 7', goal: 'fat_loss', interests: ['boxing', 'meal-prep', 'walking'], bio: 'Tập tối sau giờ làm, chỉ cần lịch nào bám được là mừng.' },
    { key: 'member-linh-nhi', full_name: 'Trịnh Linh Nhi', city: 'Huế', district: 'An Cựu', goal: 'general_health', interests: ['walking', 'light-strength', 'recovery'], bio: 'Muốn app có cảm giác thật người dùng chứ không phải demo showroom.' },
    { key: 'member-khoi', full_name: 'Đỗ Minh Khôi', city: 'Hà Nội', district: 'Cầu Giấy', goal: 'competition', interests: ['running', 'endurance', 'nutrition'], bio: 'Đang nhắm race cuối năm nên cần dữ liệu và lời khuyên đỡ lan man.' },
    { key: 'member-ngoc', full_name: 'Lê Hải Ngọc', city: 'Đà Nẵng', district: 'Liên Chiểu', goal: 'stress_relief', interests: ['yoga', 'recovery', 'community'], bio: 'Muốn tìm chỗ tập sáng sớm gần nhà và không khí dễ thở.' },
    { key: 'member-an', full_name: 'Phùng Quỳnh An', city: 'TP. Hồ Chí Minh', district: 'Phú Nhuận', goal: 'maintain', interests: ['pilates', 'walking', 'healthy-food'], bio: 'Tập đều vừa phải thôi nhưng vẫn thích mua mấy món gear xinh xắn.' },
] as const;

const gymOwnerSpecs = [
    { key: 'owner-forge', full_name: 'Lê Quốc An', city: 'Hà Nội', district: 'Long Biên', bio: 'Đang vận hành một cụm strength gym, ưu tiên trải nghiệm tập thật và phản hồi nhanh.' },
    { key: 'owner-northside', full_name: 'Nguyễn Đức Hào', city: 'Hà Nội', district: 'Cầu Giấy', bio: 'Xuất thân từ dân tập tạ nên rất khó tính với layout và thiết bị.' },
    { key: 'owner-warehouse', full_name: 'Trần Gia Bảo', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', bio: 'Muốn gym trông bụi vừa đủ nhưng dịch vụ phải gọn gàng, rõ ràng.' },
    { key: 'owner-saigon-south', full_name: 'Phạm Thu Hằng', city: 'TP. Hồ Chí Minh', district: 'Quận 7', bio: 'Ưu tiên lớp boxing vừa có kỹ thuật vừa không quá ngợp cho người mới.' },
    { key: 'owner-lotus-flow', full_name: 'Bùi Lan Anh', city: 'Đà Nẵng', district: 'Hải Châu', bio: 'Thích không gian sáng, nhẹ, và mọi thứ phải có nhịp thở chứ không gấp gáp.' },
    { key: 'owner-som', full_name: 'Lê Hoàng Phúc', city: 'Đà Nẵng', district: 'Sơn Trà', bio: 'Vận hành studio nhỏ nên từng feedback và từng cuộc hẹn đều rất quan trọng.' },
    { key: 'owner-reform', full_name: 'Nguyễn Trà My', city: 'TP. Hồ Chí Minh', district: 'Quận 3', bio: 'Pilates với mình phải sạch, rõ, và người mới vào không được bị khớp.' },
    { key: 'owner-core-room', full_name: 'Trương Quốc Thịnh', city: 'TP. Hồ Chí Minh', district: 'Thủ Đức', bio: 'Làm studio ven sông nên mình giữ nhịp trải nghiệm mềm nhưng vẫn rất thực dụng.' },
    { key: 'owner-d7-hybrid', full_name: 'Võ Tuấn Kiệt', city: 'TP. Hồ Chí Minh', district: 'Quận 7', bio: 'Hybrid mà rối là hỏng, nên mọi thứ ở đây đi theo logic rất rõ.' },
    { key: 'owner-east-lake', full_name: 'Ngô Minh Khoa', city: 'Hà Nội', district: 'Tây Hồ', bio: 'Muốn ai tới tập cũng hiểu ngay mình nên làm gì tiếp theo.' },
    { key: 'owner-reset', full_name: 'Hoàng Quỳnh Như', city: 'TP. Hồ Chí Minh', district: 'Quận 2', bio: 'Recovery không phải phần phụ, đó là lý do chỗ này được mở ra.' },
    { key: 'owner-pulse', full_name: 'Phan Gia Khánh', city: 'TP. Hồ Chí Minh', district: 'Quận 1', bio: 'Không theo kiểu spa sang chảnh quá, ưu tiên hữu ích và quay lại được thường xuyên.' },
    { key: 'owner-flex24', full_name: 'Lâm Thanh Tùng', city: 'Cần Thơ', district: 'Ninh Kiều', bio: 'Phòng tập neighborhood thì phải dễ vào, dễ hỏi và không làm người mới ngại.' },
    { key: 'owner-steel-yard', full_name: 'Đặng Hoàng Long', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', bio: 'Tập tạ nặng nhưng dịch vụ vẫn phải lịch sự và rõ giá ngay từ đầu.' },
    { key: 'owner-atelier', full_name: 'Nguyễn Minh Châu', city: 'TP. Hồ Chí Minh', district: 'Quận 1', bio: 'Premium với mình là chỉn chu, không phải phô trương.' },
    { key: 'owner-eastwest', full_name: 'Lê Phương Anh', city: 'Hà Nội', district: 'Ba Đình', bio: 'Club càng cao cấp càng phải minh bạch để khách thấy đáng tiền.' },
    { key: 'owner-her-motion', full_name: 'Phạm Yến Nhi', city: 'TP. Hồ Chí Minh', district: 'Phú Nhuận', bio: 'Mình làm studio cho nữ nên từ copy tới không gian đều phải đủ dễ chịu.' },
    { key: 'owner-moc', full_name: 'Trần Bảo Uyên', city: 'Huế', district: 'Vỹ Dạ', bio: 'Không gian mềm nhưng vận hành rất chắc tay, đó là thứ mình giữ lâu nhất.' },
    { key: 'owner-run-lift', full_name: 'Nguyễn Hồng Quân', city: 'Đà Nẵng', district: 'Sơn Trà', bio: 'Runner và lifter đều ghé được, miễn là mọi thứ đủ rõ để không mất thời gian.' },
    { key: 'owner-tamsau', full_name: 'Bùi Nhật Nam', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', bio: 'Performance phải gắn với dữ liệu nhưng trải nghiệm vẫn phải nói bằng ngôn ngữ đời thường.' },
] as const;

const gymSpecs = [
    { key: 'forge-house-long-bien', name: 'Forge House Long Biên', city: 'Hà Nội', district: 'Long Biên', owner_key: 'owner-forge', type: 'strength-gym', linked: ['coach-david', 'coach-nam', 'coach-gia-linh'], positioning: 'premium' },
    { key: 'northside-iron-club', name: 'Northside Iron Club', city: 'Hà Nội', district: 'Cầu Giấy', owner_key: 'owner-northside', type: 'strength-gym', linked: ['coach-nam', 'coach-huy', 'coach-hai-nam'], positioning: 'mid' },
    { key: 'warehouse-fight-club', name: 'The Warehouse Fight Club', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh', owner_key: 'owner-warehouse', type: 'boxing-gym', linked: ['coach-khoa', 'coach-nhat-minh', 'coach-huong'], positioning: 'mid' },
    { key: 'saigon-south-boxing-room', name: 'Saigon South Boxing Room', city: 'TP. Hồ Chí Minh', district: 'Quận 7', owner_key: 'owner-saigon-south', type: 'boxing-gym', linked: ['coach-khoa', 'coach-huong', 'coach-phuc'], positioning: 'premium' },
    { key: 'lotus-flow-house', name: 'Lotus Flow House', city: 'Đà Nẵng', district: 'Hải Châu', owner_key: 'owner-lotus-flow', type: 'yoga-studio', linked: ['coach-nhi', 'coach-thao-my', 'coach-tam'], positioning: 'premium' },
    { key: 'som-studio-yoga', name: 'Sớm Studio Yoga', city: 'Đà Nẵng', district: 'Sơn Trà', owner_key: 'owner-som', type: 'yoga-studio', linked: ['coach-nhi', 'coach-an-nhien', 'coach-hai-nam'], positioning: 'mid' },
    { key: 'reform-lab-pilates', name: 'Reform Lab Pilates', city: 'TP. Hồ Chí Minh', district: 'Quận 3', owner_key: 'owner-reform', type: 'pilates-studio', linked: ['coach-linh', 'coach-nhu-y', 'coach-tam'], positioning: 'premium' },
    { key: 'core-room-riverside', name: 'Core Room Riverside', city: 'TP. Hồ Chí Minh', district: 'Thủ Đức', owner_key: 'owner-core-room', type: 'pilates-studio', linked: ['coach-linh', 'coach-nhu-y', 'coach-hoai-an'], positioning: 'premium' },
    { key: 'district-7-hybrid-hall', name: 'District 7 Hybrid Hall', city: 'TP. Hồ Chí Minh', district: 'Quận 7', owner_key: 'owner-d7-hybrid', type: 'gym', linked: ['coach-huong', 'coach-david', 'coach-huy'], positioning: 'mid' },
    { key: 'east-lake-endurance-hub', name: 'East Lake Endurance Hub', city: 'Hà Nội', district: 'Tây Hồ', owner_key: 'owner-east-lake', type: 'gym', linked: ['coach-huy', 'coach-thu-uyen', 'coach-hoai-an'], positioning: 'premium' },
    { key: 'reset-recovery-social', name: 'Reset Recovery Social', city: 'TP. Hồ Chí Minh', district: 'Quận 2', owner_key: 'owner-reset', type: 'recovery-club', linked: ['coach-an-nhien', 'coach-quoc-khanh', 'coach-tam'], positioning: 'premium' },
    { key: 'pulse-recovery-club', name: 'Pulse Recovery Club', city: 'TP. Hồ Chí Minh', district: 'Quận 1', owner_key: 'owner-pulse', type: 'recovery-club', linked: ['coach-quoc-khanh', 'coach-hai-nam', 'coach-linh'], positioning: 'luxury' },
    { key: 'flex24-nguyen-van-cu', name: 'Flex24 Nguyễn Văn Cừ', city: 'Cần Thơ', district: 'Ninh Kiều', owner_key: 'owner-flex24', type: 'gym', linked: ['coach-tam', 'coach-hai-nam', 'coach-gia-bao'], positioning: 'budget' },
    { key: 'steel-yard-go-vap', name: 'Steel Yard Gò Vấp', city: 'TP. Hồ Chí Minh', district: 'Gò Vấp', owner_key: 'owner-steel-yard', type: 'strength-gym', linked: ['coach-david', 'coach-gia-linh', 'coach-khoa'], positioning: 'mid' },
    { key: 'atelier-fitness-club', name: 'Atelier Fitness Club', city: 'TP. Hồ Chí Minh', district: 'Quận 1', owner_key: 'owner-atelier', type: 'gym', linked: ['coach-linh', 'coach-david', 'coach-nhi'], positioning: 'luxury' },
    { key: 'eastwest-athletic-club', name: 'EastWest Athletic Club', city: 'Hà Nội', district: 'Ba Đình', owner_key: 'owner-eastwest', type: 'gym', linked: ['coach-huy', 'coach-david', 'coach-nam'], positioning: 'premium' },
    { key: 'her-motion-studio', name: 'Her Motion Studio', city: 'TP. Hồ Chí Minh', district: 'Phú Nhuận', owner_key: 'owner-her-motion', type: 'pilates-studio', linked: ['coach-linh', 'coach-thao-my', 'coach-tam'], positioning: 'premium' },
    { key: 'moc-pilates-recovery', name: 'Mộc Pilates & Recovery', city: 'Huế', district: 'Vỹ Dạ', owner_key: 'owner-moc', type: 'pilates-studio', linked: ['coach-hai-nam', 'coach-tam', 'coach-thao-my'], positioning: 'mid' },
    { key: 'run-lift-yard', name: 'Run & Lift Yard', city: 'Đà Nẵng', district: 'Sơn Trà', owner_key: 'owner-run-lift', type: 'gym', linked: ['coach-huy', 'coach-hoai-an', 'coach-phuc'], positioning: 'mid' },
    { key: 'tam-sau-performance', name: 'Tầm Sâu Performance', city: 'TP. Hồ Chí Minh', district: 'Tân Bình', owner_key: 'owner-tamsau', type: 'gym', linked: ['coach-david', 'coach-huong', 'coach-quoc-khanh'], positioning: 'premium' },
] as const;

function buildCoachRecord(spec: typeof coachSpecs[number], index: number): MockCoachRecord {
    const arch = coachArchetypes[spec.archetype];
    const slug = generateSlug(spec.full_name);
    const name = shortName(spec.full_name);
    const cover = selectImage('coach_cover', index, arch.imageTag);
    const galleryImages = selectImages('coach_gallery', 5, index * 2, arch.imageTag);
    const avatar = selectImage('coach_avatar', index, arch.imageTag);
    const beforeAfter = selectImages('transformation', 2, index, arch.imageTag);
    const price = roundMoney(spec.basePrice);

    const testimonials = range(2).map((offset) => ({
        client_name: cycle(memberSpecs, index + offset).full_name,
        client_avatar: selectImage('member_avatar', index + offset),
        rating: 5,
        comment: offset === 0
            ? `${name} nói chuyện rất đời thường, chỉnh từng chi tiết nhỏ nên mình bám lịch được lâu hơn hẳn.`
            : `Điều mình thích nhất là ${name.toLowerCase()} không làm quá. Bài vừa sức nhưng tuần nào cũng thấy có tiến bộ.`,
        result_achieved: offset === 0 ? arch.outcome : `Giữ đều ${offset + 3} buổi/tuần trong 10 tuần`,
        is_featured: offset === 0,
    }));

    return {
        key: spec.key,
        user_type: 'trainer',
        full_name: spec.full_name,
        email: slugEmail(slug),
        slug,
        city: spec.city,
        district: spec.district,
        avatar_url: avatar,
        bio: `${name} theo đuổi cách làm việc rất thẳng: dễ hiểu, có lịch rõ và tập thứ gì cũng phải có lý do.` ,
        specialties: [...arch.specialties],
        base_price_monthly: price,
        is_verified: spec.verified,
        marketplace_membership_active: index < 10,
        experience_level: spec.years >= 7 ? 'advanced' : 'intermediate',
        headline: `${arch.specialties[0]} coach · ${arch.focus}`,
        bio_short: `${name} làm việc nhiều với ${arch.audience}. Mục tiêu là giúp bạn ${arch.outcome}.`,
        bio_long: `${name} không theo kiểu hô khẩu hiệu. Cách dạy của ${name.toLowerCase()} là bóc nhỏ từng việc: tuần này tập gì, ăn sao cho hợp lịch sống và khi nào nên nghỉ để người vẫn lên. Học viên tìm tới ${name.toLowerCase()} nhiều vì cần một người nói chuyện rõ ràng, không ép quá sức mà vẫn kéo được kết quả lâu dài.`,
        years_experience: spec.years,
        clients_trained: spec.clients,
        success_stories: spec.stories,
        profile_tagline: `Tập chắc, sống gọn và tiến bộ nhìn thấy được.` ,
        is_accepting_clients: spec.accepting,
        packages: [
            {
                name: `${arch.packageThemes[0]} 4 tuần`,
                description: `Dành cho người cần nhịp vào ổn định và được chỉnh form sát.`,
                duration_months: 1,
                sessions_per_week: 3,
                price,
                features: ['Lịch tập cá nhân', 'Check-in mỗi tuần', 'Chat hỏi bài trong tuần'],
                is_popular: false,
            },
            {
                name: `${arch.packageThemes[1]} 12 tuần`,
                description: `Đi sâu hơn về kỹ thuật, nhịp sống và tiến độ đo được.`,
                duration_months: 3,
                sessions_per_week: 4,
                price: roundMoney(price * 2.6),
                features: ['Theo dõi video form', 'Điều chỉnh bài theo lịch sống', 'Gợi ý ăn uống đủ dùng', 'Review mốc tiến độ'],
                is_popular: true,
            },
            {
                name: `${arch.packageThemes[2]} 24 tuần`,
                description: `Hợp với người muốn giữ kỷ luật lâu hơn và có một block rõ ràng.`,
                duration_months: 6,
                sessions_per_week: 4,
                price: roundMoney(price * 4.8),
                features: ['Ưu tiên phản hồi', '1 buổi gọi video mỗi tháng', 'Tối ưu khối lượng tập theo sức hồi phục'],
                is_popular: false,
            },
        ],
        gallery: galleryImages.map((image_url, galleryIndex) => ({
            image_url,
            caption: cycle([
                'Một buổi tập đúng nhịp, không cần màu mè nhưng rất có chất lượng.',
                'Khoảnh khắc chỉnh form trước khi tăng thêm độ khó.',
                'Buổi workshop nhỏ, ít người nhưng nói chuyện rất thật.',
                'Góc làm việc quen thuộc mỗi tuần.',
                'Ảnh lưu lại một block tập đáng nhớ.',
            ], galleryIndex + index),
            image_type: galleryIndex === 2 ? 'event' : galleryIndex === 3 ? 'certificate' : 'workout',
        })),
        testimonials,
        before_after: {
            client_name: cycle(athleteSpecs, index).full_name,
            before_url: beforeAfter[0],
            after_url: beforeAfter[1],
            story: `${name} theo cùng học viên trong ${12 + (index % 5) * 2} tuần. Không ép cân sốc, chỉ chỉnh đúng nhịp tập, giấc ngủ và cách tăng tải.`,
            duration_weeks: 12 + (index % 5) * 2,
        },
        programs: [
            {
                name: `${arch.specialties[0]} Foundation`,
                description: `Block ${8 + (index % 3) * 2} tuần dành cho người muốn ${arch.focus}.`,
                duration_weeks: 8 + (index % 3) * 2,
                difficulty: index % 3 === 0 ? 'beginner' : 'intermediate',
                equipment_needed: arch.specialties[0] === 'Yoga' ? ['Thảm tập', 'Yoga block'] : ['Dây mini band', 'Dumbbell cơ bản'],
                price_monthly: roundMoney(price * 0.85),
                pricing_type: 'monthly',
                training_format: index % 2 === 0 ? 'online' : 'hybrid',
                included_features: ['Lịch tập tuần', 'Hướng dẫn video', 'Checklist theo dõi'],
                training_goals: [...arch.goals],
                prerequisites: 'Chỉ cần có thể dành ra 3-4 buổi mỗi tuần.',
                cover_image_url: cover,
                max_clients: 24,
                current_clients: 8 + (index % 7),
            },
            {
                name: `${arch.packageThemes[1]} Workshop`,
                description: `Buổi đi thẳng vào kỹ thuật và những lỗi hay gặp nhất.`,
                duration_weeks: 4,
                difficulty: 'advanced',
                equipment_needed: ['Giày tập', 'Nước uống'],
                price_one_time: roundMoney(price * 0.9),
                pricing_type: 'lump_sum',
                training_format: index % 2 === 0 ? 'offline_group' : 'offline_1on1',
                included_features: ['Form audit', 'Video recap', 'Gợi ý bài tập theo nhà'],
                training_goals: arch.goals.slice(0, 2),
                cover_image_url: cover,
                max_clients: 12,
                current_clients: 3 + (index % 4),
            },
        ],
        highlights: [
            { title: 'Học viên đã theo', value: `${spec.clients}+`, icon_key: 'users' },
            { title: 'Kinh nghiệm', value: `${spec.years} năm`, icon_key: 'calendar' },
            { title: 'Ca tiến bộ rõ', value: `${spec.stories}`, icon_key: 'sparkles' },
            { title: 'Nhịp làm việc', value: spec.accepting ? 'Đang nhận học viên' : 'Đang kín lịch', icon_key: 'clock' },
        ],
        experiences: [
            {
                title: `${arch.specialties[0]} Coach`,
                organization: `${spec.city} Movement Lab`,
                location: spec.city,
                experience_type: 'work',
                start_date: `${2016 + (index % 5)}-01-01`,
                is_current: true,
                description: `Phụ trách các block tập tập trung vào ${arch.focus}.`,
            },
            {
                title: 'Workshop lead',
                organization: 'GYMERVIET Community',
                location: spec.city,
                experience_type: 'work',
                start_date: `${2019 + (index % 3)}-05-01`,
                description: 'Chạy workshop nhỏ và các buổi hỏi đáp cho người mới.',
            },
            {
                title: `${arch.specialties[0]} Certification`,
                organization: 'Coach Education Hub',
                experience_type: 'certification',
                start_date: `${2018 + (index % 4)}-08-01`,
                description: 'Hoàn thành block chuyên môn và thực hành huấn luyện.',
            },
            {
                title: 'Case study nổi bật',
                organization: 'Hồ sơ học viên',
                experience_type: 'achievement',
                start_date: `${2023 + (index % 2)}-03-01`,
                description: arch.outcome,
                achievements: ['Theo đủ block 12 tuần', 'Giữ được lịch sinh hoạt ổn định'],
            },
        ],
        skills: arch.specialties.map((skill, skillIndex) => ({
            name: skill,
            level: 86 + ((index + skillIndex) % 10),
            category: skillIndex === arch.specialties.length - 1 ? 'recovery' : 'fitness',
        })),
        social_links: {
            instagram: `${PROFILE_BASE}/u/${slug}`,
            website: `${PROFILE_BASE}/coach/${slug}`,
        },
        languages: index % 3 === 0 ? ['Tiếng Việt', 'English'] : ['Tiếng Việt'],
        cover_image_url: cover,
    };
}

function buildAthleteRecord(spec: typeof athleteSpecs[number], index: number): MockAthleteRecord {
    const arch = athleteArchetypes[spec.archetype];
    const slug = generateSlug(spec.full_name);
    const name = shortName(spec.full_name);
    const cover = selectImage('coach_cover', index + 4, arch.imageTag);
    const gallery = selectImages('athlete_gallery', 4, index * 2, arch.imageTag);
    const progress = selectImages('transformation', 2, index + 2, arch.imageTag);
    const avatar = selectImage('athlete_avatar', index, arch.imageTag);
    const experienceLevel = spec.experience;
    const basePrice = roundMoney(900000 + index * 25000);

    return {
        key: spec.key,
        user_type: 'athlete',
        full_name: spec.full_name,
        email: slugEmail(slug),
        slug,
        city: spec.city,
        district: spec.district,
        avatar_url: avatar,
        bio: `${name} dùng app như một người tập thật: xem lịch, nhắn tin, lưu món muốn mua và bám tiến độ theo từng block.`,
        specialties: [...arch.specialties],
        is_verified: index % 4 !== 0,
        experience_level: experienceLevel,
        headline: `${arch.specialties[0]} athlete · ${arch.focus}`,
        bio_short: `${name} đang theo hướng ${arch.focus}. Điểm mạnh là sự đều nhịp và biết lắng nghe cơ thể.`,
        bio_long: `${name} không phải kiểu lúc nào cũng “máu lửa”. Điều dễ thấy nhất là ${name.toLowerCase()} tập rất tỉnh, biết lúc nào nên tăng, lúc nào nên lùi để giữ đường dài. Hồ sơ này được dựng để nhìn ra rõ hành trình chứ không làm màu bằng những câu quá hùng hồn.`,
        years_experience: 3 + (index % 5),
        profile_tagline: `Đi đều, tập chắc và không bỏ cuộc vì một tuần hụt nhịp.`,
        gallery: gallery.map((image_url, galleryIndex) => ({
            image_url,
            caption: cycle([
                'Một buổi tập rất thật, không cần setup cầu kỳ.',
                'Hình lưu lại sau một block tập có nhiều thay đổi tốt.',
                'Ngày form vào tay hơn hẳn so với đầu mùa.',
                'Một góc quen thuộc trong tuần tập gần đây.',
            ], galleryIndex + index),
            image_type: galleryIndex === 1 ? 'event' : 'workout',
        })),
        progress_photos: progress.map((image_url, progressIndex) => ({
            image_url,
            caption: progressIndex === 0 ? 'Mốc đầu block' : 'Sau khi giữ đều 10 tuần',
            taken_at: progressIndex === 0 ? '2025-06-01' : '2025-08-15',
            weight_kg: 52 + index * 1.2 + progressIndex * 0.6,
        })),
        experiences: [
            {
                title: 'Vận động viên phong trào',
                organization: `${spec.city} Active Community`,
                location: spec.city,
                experience_type: 'work',
                start_date: `${2021 + (index % 3)}-01-01`,
                is_current: true,
                description: `Giữ lịch tập đều và tham gia các buổi cộng đồng theo hướng ${arch.focus}.`,
            },
            {
                title: arch.achievement,
                organization: `${spec.city} Open Series`,
                experience_type: 'achievement',
                start_date: `${2024}-11-01`,
                description: 'Một cột mốc nhỏ nhưng rất thật và đáng nhớ.',
            },
            {
                title: `${arch.specialties[0]} workshop`,
                organization: 'GYMERVIET Community',
                experience_type: 'certification',
                start_date: `${2024}-03-01`,
                description: 'Hoàn thành workshop nâng kỹ thuật và cách tự đánh giá form.',
            },
        ],
        achievements: [
            {
                achievement_title: arch.achievement,
                competition_name: `${spec.city} Active Open`,
                organizing_body: 'Cộng đồng vận động địa phương',
                achievement_level: index % 3 === 0 ? 'NATIONAL' : 'LOCAL',
                achievement_date: '2025-10-20',
                certificate_image_url: selectImage('coach_gallery', index + 6, arch.imageTag),
                medal_type: index % 4 === 0 ? 'SILVER' : 'PARTICIPATION',
                proof_url: `${PROFILE_BASE}/athlete/${slug}`,
                verification_notes: 'Đối chiếu qua ảnh thi đấu và hồ sơ cộng đồng.',
            },
        ],
        packages: [
            {
                name: 'Buổi chia sẻ kinh nghiệm',
                description: `Dành cho người muốn hỏi thật về cách ${name.toLowerCase()} giữ nhịp tập và thi đấu.`,
                duration_months: 1,
                sessions_per_week: 1,
                price: basePrice,
                features: ['1 buổi online 60 phút', 'Checklist chuẩn bị', 'Gợi ý tài nguyên tự học'],
                is_popular: true,
            },
            {
                name: 'Sparring / đồng hành 4 tuần',
                description: 'Hợp với người cần thêm động lực và nhịp trao đổi ngắn hàng tuần.',
                duration_months: 1,
                sessions_per_week: 2,
                price: roundMoney(basePrice * 1.6),
                features: ['2 buổi check-in/tuần', 'Gợi ý bài bổ trợ', 'Nhắc nhịp nghỉ hồi phục'],
                is_popular: false,
            },
        ],
        social_links: {
            instagram: `${PROFILE_BASE}/athlete/${slug}`,
            website: `${PROFILE_BASE}/athlete/${slug}`,
        },
        languages: index % 5 === 0 ? ['Tiếng Việt', 'English'] : ['Tiếng Việt'],
        cover_image_url: cover,
    };
}

function buildMemberRecord(spec: typeof memberSpecs[number], index: number): MockMemberRecord {
    const slug = generateSlug(spec.full_name);
    return {
        key: spec.key,
        user_type: 'user',
        full_name: spec.full_name,
        email: slugEmail(slug),
        slug,
        city: spec.city,
        district: spec.district,
        avatar_url: selectImage('member_avatar', index),
        bio: spec.bio,
        experience_level: index % 4 === 0 ? 'beginner' : 'intermediate',
        onboarding_goals: [spec.goal, index % 2 === 0 ? 'general_health' : 'mobility'],
        interests: [...spec.interests],
    };
}

function buildGymOwnerRecord(spec: typeof gymOwnerSpecs[number], index: number): MockGymOwnerRecord {
    const slug = generateSlug(spec.full_name);
    return {
        key: spec.key,
        user_type: 'gym_owner',
        full_name: spec.full_name,
        email: slugEmail(slug),
        slug,
        city: spec.city,
        district: spec.district,
        avatar_url: selectImage('member_avatar', index + 6),
        bio: spec.bio,
        gym_owner_status: 'approved',
        marketplace_membership_active: index < 5,
    };
}

function buildGymRecord(spec: typeof gymSpecs[number], index: number): MockGymRecord {
    const coverTag = spec.type === 'boxing-gym' ? 'boxing' : spec.type === 'yoga-studio' ? 'yoga' : spec.type === 'pilates-studio' ? 'pilates' : spec.type === 'recovery-club' ? 'recovery' : 'strength';
    const cover = selectImage('gym_cover', index, coverTag);
    const gallery = selectImages('gym_gallery', 5, index, coverTag);
    const logo = selectImage('shop_logo', index, coverTag);
    const neighborhood = `${spec.district}, ${spec.city}`;
    const venueTypeSlug = spec.type;
    const positioning = spec.positioning;

    const basePrice = positioning === 'luxury' ? 2500000 : positioning === 'premium' ? 1800000 : positioning === 'mid' ? 980000 : 550000;
    const priceFromAmount = roundMoney(basePrice);

    const reviewUsers = [cycle(memberSpecs, index), cycle(athleteSpecs, index)];

    return {
        key: spec.key,
        owner_key: spec.owner_key,
        name: spec.name,
        slug: generateSlug(spec.name),
        city: spec.city,
        district: spec.district,
        address: `${44 + index} ${spec.district === 'Quận 1' ? 'Lê Thánh Tôn' : spec.district === 'Quận 7' ? 'Nguyễn Thị Thập' : spec.district === 'Cầu Giấy' ? 'Trần Thái Tông' : 'Nguyễn Văn Cừ'}, ${spec.district}, ${spec.city}`,
        tagline: positioning === 'budget' ? 'Dễ vào, dễ tập, không làm người mới ngợp.' : 'Không gian rõ ràng, dịch vụ chặt chẽ và đi thẳng vào nhu cầu tập thật.',
        description: `${spec.name} được dựng như một nơi người dùng thật có thể cân nhắc ngay: vào là thấy mức giá, biết khu phù hợp, biết hỏi ai và không phải đoán xem mình nên làm gì tiếp theo.`,
        logo_url: logo,
        cover_image_url: cover,
        founded_year: 2016 + (index % 8),
        total_area_sqm: 280 + index * 18,
        total_equipment_count: 42 + index * 3,
        highlights: positioning === 'luxury'
            ? ['Không gian sáng và sạch', 'Quầy tiếp đón rõ quy trình', 'Có khu recovery riêng']
            : ['Giá dễ hiểu', 'Trainer trực ở sàn tập', 'Không khí thân thiện với người mới'],
        social_links: {
            instagram: `${PROFILE_BASE}/gyms/${generateSlug(spec.name)}`,
            website: `${PROFILE_BASE}/gyms/${generateSlug(spec.name)}`,
            facebook: `${PROFILE_BASE}/community/${generateSlug(spec.name)}`,
        },
        is_verified: index % 5 !== 0,
        primary_venue_type_slug: venueTypeSlug,
        positioning_tier: positioning,
        beginner_friendly: spec.type !== 'strength-gym' || index % 2 === 0,
        women_friendly: spec.type === 'yoga-studio' || spec.type === 'pilates-studio' || spec.key.includes('her-motion') || index % 3 !== 0,
        family_friendly: spec.type === 'yoga-studio' || spec.type === 'recovery-club' || index % 4 === 0,
        athlete_friendly: spec.type === 'strength-gym' || spec.key.includes('performance') || spec.key.includes('run-lift'),
        recovery_focused: spec.type === 'recovery-club' || spec.type === 'pilates-studio',
        discovery_blurb: positioning === 'budget'
            ? 'Phù hợp người cần một chỗ tập gọn, dễ hỏi và không bị áp lực bởi quá nhiều lớp vỏ premium.'
            : 'Phù hợp người cần trải nghiệm rõ, sạch, có đủ thông tin để chốt nhanh ngay từ lần đầu xem.',
        hero_value_props: spec.type === 'boxing-gym'
            ? ['HLV chỉnh trực tiếp', 'Lớp kỹ thuật rõ nhịp', 'Có lớp cho người mới']
            : spec.type === 'recovery-club'
                ? ['Recovery rõ khu riêng', 'Đặt lịch dễ', 'Không gian yên hơn gym thường']
                : ['Giá dễ hiểu', 'Thiết bị đủ dùng', 'Có lộ trình cho người mới'],
        profile_completeness_score: 91 - (index % 6),
        response_sla_text: index % 2 === 0 ? 'Phản hồi trong 2 giờ làm việc' : 'Phản hồi trong ngày',
        default_primary_cta: spec.type === 'yoga-studio' || spec.type === 'pilates-studio' ? 'class_trial' : 'visit_booking',
        default_secondary_cta: spec.type === 'recovery-club' ? 'consultation' : 'membership',
        featured_weight: 20 - (index % 5),
        branch: {
            branch_name: `${spec.name} · ${spec.district}`,
            description: `Chi nhánh chính của ${spec.name}, ưu tiên người mới vẫn hiểu được lộ trình ngay từ buổi đầu.`,
            manager_name: cycle(gymOwnerSpecs, index).full_name,
            phone: `+84 90${(index + 100).toString().padStart(2, '0')} 12${(index + 30).toString().padStart(2, '0')} ${((index * 7) % 90 + 10).toString().padStart(2, '0')}`,
            email: shopEmail(generateSlug(spec.name)),
            latitude: 10.7 + index * 0.01,
            longitude: 106.6 + index * 0.01,
            neighborhood_label: neighborhood,
            parking_summary: positioning === 'budget' ? 'Có chỗ gửi xe máy ngay trước cửa.' : 'Có gửi xe máy và chỗ đậu ô tô theo khung giờ.',
            locker_summary: 'Tủ locker tự khóa, đủ dùng trong giờ cao điểm.',
            shower_summary: spec.type === 'recovery-club' ? 'Phòng tắm nóng lạnh, sạch và kín.' : 'Có khu tắm cơ bản, giữ sạch ổn định.',
            towel_service_summary: positioning === 'luxury' ? 'Khăn có sẵn trong gói hội viên.' : 'Khăn thuê thêm nếu cần.',
            crowd_level_summary: index % 2 === 0 ? 'Đông hơn vào 18:00-20:00, sáng khá dễ chịu.' : 'Trưa và cuối tối là dễ tập nhất.',
            best_visit_time_summary: index % 2 === 0 ? '07:00-09:00 hoặc sau 20:00.' : '09:30-11:30 và sau 19:30.',
            accessibility_summary: 'Thang máy hoặc lối vào phẳng, không phải leo quá nhiều bậc.',
            women_only_summary: spec.key.includes('her-motion') ? 'Một số khung giờ chỉ nhận nữ.' : undefined,
            child_friendly_summary: spec.type === 'yoga-studio' ? 'Có góc chờ nhỏ cho gia đình đi cùng.' : undefined,
            check_in_instructions: 'Báo tên ở quầy, gửi xe rồi nhân viên sẽ dẫn đi một vòng ngắn trước khi vào tập.',
            branch_tagline: 'Tới là hiểu mình nên bắt đầu ở đâu.',
            whatsapp_number: `+8490${(index + 410).toString().padStart(3, '0')}${(index + 19).toString().padStart(2, '0')}`,
            messenger_url: `${PROFILE_BASE}/messages?gym=${generateSlug(spec.name)}`,
            consultation_phone: `+84 93${(index + 210).toString().padStart(3, '0')}${(index + 11).toString().padStart(2, '0')}`,
            branch_status_badges: spec.positioning === 'budget' ? ['Dễ vào', 'Đông hội viên'] : ['Được chọn lọc', 'Phản hồi nhanh'],
            opening_hours: buildSchedule('06:00', '22:00', { open: '07:00', close: '21:00' }, { open: '07:30', close: '20:00' }),
        },
        taxonomy_slugs: [venueTypeSlug, positioning === 'budget' ? 'budget' : 'premium', spec.type.includes('studio') ? 'class-first' : 'membership-first', spec.type === 'recovery-club' ? 'recovery-first' : 'free-weight-focus', spec.type === 'yoga-studio' || spec.type === 'pilates-studio' ? 'women-friendly' : 'athlete-ready'],
        amenities: [
            { name: 'Gửi xe', note: 'Có bảo vệ và vé theo lượt.' },
            { name: 'Phòng thay đồ', note: 'Tách nam nữ, dọn sạch mỗi ca.' },
            { name: spec.type === 'recovery-club' ? 'Cold plunge' : 'Nước lọc', note: spec.type === 'recovery-club' ? 'Có lịch vệ sinh hằng ngày.' : 'Có bình nước ở sàn tập.' },
            { name: spec.type === 'yoga-studio' ? 'Yoga props' : 'Khu giãn cơ', note: spec.type === 'yoga-studio' ? 'Block, strap và bolster có sẵn.' : 'Có thảm, foam roller và bóng lacrosse.' },
        ],
        equipment: [
            { category: 'strength', name: 'Power rack', quantity: 4 + (index % 3), brand: 'Rogue' },
            { category: 'cardio', name: 'Máy chạy bộ', quantity: 6 + (index % 4), brand: 'Life Fitness' },
            { category: 'functional', name: spec.type === 'boxing-gym' ? 'Bao cát treo' : 'Sled kéo', quantity: 3 + (index % 2), brand: 'GYMERVIET' },
            { category: 'other', name: spec.type === 'pilates-studio' ? 'Reformer' : 'Dumbbell set', quantity: spec.type === 'pilates-studio' ? 8 : 20, brand: spec.type === 'pilates-studio' ? 'Merrithew' : 'Escape' },
        ],
        pricing: [
            {
                plan_name: 'Drop-in',
                price: roundMoney(priceFromAmount * 0.18),
                billing_cycle: 'per_day',
                description: 'Phù hợp khi bạn muốn ghé thử một buổi rồi quyết tiếp.',
                is_highlighted: false,
                order_number: 0,
                plan_type: 'drop_in',
                access_scope: 'single_branch',
                included_services: ['Sàn tập chính', 'Phòng thay đồ'],
                trial_available: true,
                trial_price: roundMoney(priceFromAmount * 0.12),
                validity_days: 1,
                highlighted_reason: 'Dễ thử trước khi chốt',
            },
            {
                plan_name: 'Membership tháng',
                price: priceFromAmount,
                billing_cycle: 'per_month',
                description: 'Gói dễ bắt đầu nhất, đủ để giữ nhịp đều hằng tuần.',
                is_highlighted: true,
                order_number: 1,
                plan_type: 'membership',
                access_scope: 'single_branch',
                included_services: ['Sàn tập', 'Lớp cơ bản', 'Tư vấn đầu buổi'],
                trial_available: true,
                trial_price: roundMoney(priceFromAmount * 0.12),
                joining_fee: spec.positioning === 'luxury' ? 300000 : 0,
                freeze_policy_summary: 'Được bảo lưu 1 lần/tháng nếu báo trước.',
                cancellation_policy_summary: 'Không hoàn tiền tháng đang dùng.',
                supports_multi_branch: false,
                highlighted_reason: 'Phổ biến nhất',
            },
            {
                plan_name: 'Membership quý',
                price: roundMoney(priceFromAmount * 2.65),
                billing_cycle: 'per_quarter',
                description: 'Hợp với người đã rõ lịch sống và muốn tiết kiệm hơn.',
                is_highlighted: false,
                order_number: 2,
                plan_type: 'membership',
                access_scope: spec.positioning === 'luxury' ? 'all_branches' : 'single_branch',
                included_services: ['Sàn tập', 'Lớp nhóm', spec.type === 'recovery-club' ? '1 buổi recovery định hướng' : '1 buổi orientation'],
                trial_available: false,
                freeze_policy_summary: 'Được bảo lưu tối đa 14 ngày/quý.',
                cancellation_policy_summary: 'Cần báo trước 7 ngày nếu muốn dừng sau chu kỳ.',
                supports_multi_branch: spec.positioning === 'luxury',
                highlighted_reason: 'Tiết kiệm hơn theo block',
            },
        ],
        zones: [
            { zone_type: spec.type === 'boxing-gym' ? 'boxing_zone' : 'strength_floor', name: 'Khu chính', description: 'Khu tập đông nhất và là nơi nhân viên hay đứng hỗ trợ.', capacity: 28, area_sqm: 120 + index * 3, booking_required: false, temperature_mode: 'ambient', sound_profile: 'energetic', natural_light_score: 3, is_signature_zone: true, sort_order: 0 },
            { zone_type: spec.type === 'yoga-studio' ? 'yoga_room' : spec.type === 'pilates-studio' ? 'pilates_reformer_room' : 'functional_zone', name: 'Khu lớp / bổ trợ', description: 'Phần dễ vào cho người mới hoặc người cần bài có hướng dẫn.', capacity: 16, area_sqm: 68 + index * 2, booking_required: spec.type.includes('studio'), temperature_mode: spec.type.includes('studio') ? 'cooled' : 'ambient', sound_profile: spec.type.includes('studio') ? 'instructor_led' : 'ambient_music', natural_light_score: 4, sort_order: 1 },
            { zone_type: spec.type === 'recovery-club' ? 'recovery_zone' : 'locker_zone', name: spec.type === 'recovery-club' ? 'Recovery room' : 'Locker & reset', description: spec.type === 'recovery-club' ? 'Khu hồi phục có quy trình đơn giản để ai mới cũng dùng được.' : 'Khu thay đồ và thả lỏng trước khi về.', capacity: 12, area_sqm: 40 + index, booking_required: spec.type === 'recovery-club', temperature_mode: spec.type === 'recovery-club' ? 'cooled' : 'ambient', sound_profile: 'silent', natural_light_score: 2, sort_order: 2 },
        ],
        gallery: gallery.map((image_url, galleryIndex) => ({
            image_url,
            caption: cycle([
                'Khu nhìn thoáng và khá dễ làm quen nếu mới tới lần đầu.',
                'Một góc thể hiện rất rõ tinh thần vận hành của nơi này.',
                'Ảnh thực tế trong giờ tập bình thường.',
                'Chi tiết nhỏ nhưng ai đi tập đều hay quan tâm.',
                'Không gian giữ được cảm giác sáng và sạch.',
            ], galleryIndex + index),
            image_type: galleryIndex === 0 ? 'interior' : galleryIndex === 2 ? 'equipment' : spec.type === 'boxing-gym' ? 'class' : 'other',
            media_role: galleryIndex === 0 ? 'hero' : galleryIndex === 1 ? 'open_gym' : galleryIndex === 2 ? 'equipment_detail' : galleryIndex === 3 ? 'class_in_action' : 'amenity',
            alt_text: `${spec.name} - ảnh ${galleryIndex + 1}`,
            is_hero: galleryIndex === 0,
            is_listing_thumb: galleryIndex === 0,
            is_featured: galleryIndex < 2,
            orientation: galleryIndex === 4 ? 'square' : 'landscape',
        })),
        program_templates: [
            {
                title: spec.type === 'boxing-gym' ? 'Boxing nền tảng' : spec.type === 'yoga-studio' ? 'Flow đầu ngày' : spec.type === 'pilates-studio' ? 'Core reset' : 'Strength base',
                program_type: spec.type === 'boxing-gym' ? 'boxing' : spec.type === 'yoga-studio' ? 'yoga' : spec.type === 'pilates-studio' ? 'pilates' : 'strength',
                level: 'beginner',
                description: 'Lớp dành cho người mới, nhịp rõ và không cần đoán mình phải làm gì tiếp theo.',
                duration_minutes: 50,
                capacity: 16,
                equipment_required: spec.type === 'yoga-studio' ? ['Thảm tập'] : ['Khăn và nước uống'],
                booking_mode: 'pre_booking',
                zone_name: spec.type === 'yoga-studio' ? 'Khu lớp / bổ trợ' : 'Khu chính',
                trainer_key: spec.linked[0],
                sessions: [
                    { starts_at: '2026-03-25T06:30:00+07:00', ends_at: '2026-03-25T07:20:00+07:00', seats_total: 16, seats_remaining: 5, waitlist_enabled: true },
                    { starts_at: '2026-03-27T18:30:00+07:00', ends_at: '2026-03-27T19:20:00+07:00', seats_total: 16, seats_remaining: 9 },
                ],
            },
            {
                title: spec.type === 'recovery-club' ? 'Recovery guided session' : 'Nhịp tập sau giờ làm',
                program_type: spec.type === 'recovery-club' ? 'recovery' : 'mobility',
                level: 'all',
                description: 'Một lớp mềm hơn để ai cũng có đường vào, kể cả khi vừa đi làm xong.',
                duration_minutes: 45,
                capacity: 12,
                booking_mode: 'member_only',
                zone_name: spec.type === 'recovery-club' ? 'Recovery room' : 'Khu lớp / bổ trợ',
                trainer_key: spec.linked[1],
                sessions: [
                    { starts_at: '2026-03-26T19:00:00+07:00', ends_at: '2026-03-26T19:45:00+07:00', seats_total: 12, seats_remaining: 4 },
                ],
            },
        ],
        lead_routes: [
            {
                inquiry_type: 'visit_booking',
                primary_channel: 'phone',
                fallback_channel: 'messenger',
                auto_prefill_message: `Mình muốn ghé ${spec.name} xem trực tiếp trong tuần này, cho mình xin khung giờ phù hợp nhé.`,
            },
            {
                inquiry_type: spec.type.includes('studio') ? 'class_trial' : 'membership',
                primary_channel: 'whatsapp',
                fallback_channel: 'phone',
                auto_prefill_message: `Mình đang xem ${spec.name}, cho mình hỏi gói nào hợp với người mới và lịch nào dễ bắt đầu nhất?`,
            },
        ],
        linked_trainer_keys: [...spec.linked],
        review_templates: reviewUsers.map((reviewer, reviewerIndex) => ({
            reviewer_key: reviewer.key,
            rating: reviewerIndex === 0 ? 5 : reviewerIndex % 2 === 0 ? 4 : 5,
            comment: reviewerIndex === 0
                ? 'Mình tới lần đầu mà không bị ngợp. Quầy lễ tân nói chuyện dễ chịu, giá cũng giải thích rất rõ.'
                : reviewerIndex === 1
                    ? 'Không gian sạch và đi tập giờ cao điểm vẫn còn đủ chỗ để làm bài chính.'
                    : reviewerIndex === 2
                        ? 'Điểm cộng là trainer ở sàn tập chịu chỉnh form chứ không đứng xa quan sát cho có.'
                        : 'Nếu app đưa đúng thông tin như ngoài đời thì người mới sẽ chốt nhanh hơn nhiều.',
            equipment_rating: 4 + (reviewerIndex % 2),
            cleanliness_rating: 4 + (reviewerIndex % 2),
            coaching_rating: 4 + ((reviewerIndex + 1) % 2),
            atmosphere_rating: reviewerIndex === 0 ? 5 : 4,
            value_rating: positioning === 'budget' ? 5 : 4,
            crowd_rating: reviewerIndex === 2 ? 3 : 4,
            visit_type: reviewerIndex === 0 ? 'trial' : reviewerIndex === 1 ? 'member' : reviewerIndex === 2 ? 'drop_in' : 'guest',
            is_verified_visit: reviewerIndex < 3,
            reply_text: 'Cảm ơn bạn đã góp ý rất cụ thể. Team đã note lại đúng phần bạn nhắc để giữ trải nghiệm ổn định hơn.',
        })),
    };
}

function buildShops(coaches: MockCoachRecord[], gymOwners: MockGymOwnerRecord[], members: MockMemberRecord[]): MockShopRecord[] {
    const coachShops = coaches.slice(0, 10).map((coach, index) => ({
        key: `shop-${coach.key}`,
        owner_key: coach.key,
        shop_name: `${shortName(coach.full_name)} ${cycle(['Studio', 'Lab', 'House', 'Systems'], index)}`,
        shop_slug: generateSlug(`${coach.slug}-shop`),
        shop_description: `${shortName(coach.full_name)} mở shop này để gom lại những món hoặc tài nguyên bản thân đang dùng thật trong công việc huấn luyện hằng ngày.`,
        shop_logo_url: selectImage('shop_logo', index),
        shop_cover_url: selectImage('shop_cover', index),
        business_type: 'coach' as const,
        contact_phone: `+84 90${(300 + index).toString().padStart(3, '0')} ${(`${50 + index}`).padStart(2, '0')} ${(`${20 + index}`).padStart(2, '0')}`,
        contact_email: shopEmail(`${coach.slug}-shop`),
        commission_rate: 8,
        is_verified: coach.is_verified,
        status: 'active' as const,
    }));

    const gymShops = gymOwners.slice(0, 5).map((owner, index) => ({
        key: `shop-${owner.key}`,
        owner_key: owner.key,
        shop_name: `${shortName(owner.full_name)} Pro Shop`,
        shop_slug: generateSlug(`${owner.slug}-pro-shop`),
        shop_description: 'Những món bán chạy nhất cho hội viên: dễ dùng, dễ mua lại và không cần đoán nhiều trước khi chốt.',
        shop_logo_url: selectImage('shop_logo', index + 5),
        shop_cover_url: selectImage('shop_cover', index + 5),
        business_type: 'gym' as const,
        contact_phone: `+84 93${(410 + index).toString().padStart(3, '0')} ${(`${30 + index}`).padStart(2, '0')} ${(`${60 + index}`).padStart(2, '0')}`,
        contact_email: shopEmail(`${owner.slug}-pro-shop`),
        commission_rate: 10,
        is_verified: true,
        status: 'active' as const,
    }));

    const memberShops = members.slice(0, 5).map((member, index) => ({
        key: `shop-${member.key}`,
        owner_key: member.key,
        shop_name: `${shortName(member.full_name)} Daily Fit`,
        shop_slug: generateSlug(`${member.slug}-daily-fit`),
        shop_description: 'Shop nhỏ của người dùng thật: các món dễ dùng mỗi ngày và có lý do rõ ràng để mua lại.',
        shop_logo_url: selectImage('shop_logo', index + 2),
        shop_cover_url: selectImage('shop_cover', index + 2),
        business_type: 'individual' as const,
        contact_phone: `+84 94${(210 + index).toString().padStart(3, '0')} ${(`${70 + index}`).padStart(2, '0')} ${(`${80 + index}`).padStart(2, '0')}`,
        contact_email: shopEmail(`${member.slug}-daily-fit`),
        commission_rate: 12,
        is_verified: index % 2 === 0,
        status: 'active' as const,
    }));

    return [...coachShops, ...gymShops, ...memberShops];
}

function buildCoachProductSet(shop: MockShopRecord, coach: MockCoachRecord, index: number): MockProductRecord[] {
    const name = shortName(coach.full_name);
    const primarySpecialty = coach.specialties[0]?.toLowerCase() ?? '';
    const archTag: string = primarySpecialty.includes('pilates')
        ? 'pilates'
        : primarySpecialty.includes('yoga')
            ? 'yoga'
            : primarySpecialty.includes('boxing')
                ? 'boxing'
                : primarySpecialty.includes('calisthenics')
                    ? 'bodyweight'
                    : primarySpecialty.includes('mobility')
                        ? 'recovery'
                        : primarySpecialty.includes('hybrid') || primarySpecialty.includes('conditioning')
                            ? 'conditioning'
                            : primarySpecialty.includes('powerlifting') || primarySpecialty.includes('strength') || primarySpecialty.includes('hypertrophy')
                                ? 'strength'
                                : 'combat';
    const base = roundMoney(coach.base_price_monthly * 0.42);

    const product1Slug = generateSlug(`${coach.slug} foundation-block`);
    const product2Slug = generateSlug(`${coach.slug} meal-reset-guide`);
    const product3Slug = generateSlug(`${coach.slug} 1-1-audit`);
    const product4Slug = generateSlug(`${coach.slug} training-toolkit`);
    const product5Slug = generateSlug(`${coach.slug} studio-merch`);

    return [
        {
            key: `${shop.key}-01`,
            shop_key: shop.key,
            seller_key: coach.key,
            category_slug: 'training-programs',
            title: `${name} Foundation Block`,
            slug: product1Slug,
            description: `Lộ trình online kiểu ${name.toLowerCase()}: vào thẳng việc, bài nào cũng có mục đích và người mới vẫn bám được.`,
            product_type: 'digital',
            price: base,
            compare_at_price: roundMoney(base * 1.35),
            currency: 'VND',
            stock_quantity: null,
            track_inventory: false,
            sku: `DEMO-V2-${index + 1}-DIGI-01`,
            digital_file_url: `${DOWNLOAD_BASE}/${product1Slug}.zip`,
            preview_content: 'Nhận PDF, video form cơ bản và checklist theo tuần.',
            thumbnail_url: selectImage('product_digital', index, archTag),
            gallery: selectImages('product_digital', 3, index, archTag),
            attributes: {
                Coach: coach.full_name,
                'Mục tiêu': coach.specialties[0],
                'Thời lượng': '8 tuần',
                'Tần suất': '4 buổi / tuần',
                'Định dạng': 'PDF + video + checklist',
            },
            tags: [coach.specialties[0].toLowerCase(), 'digital', 'foundation'],
            featured_weight: 80 - index,
            variants: [
                {
                    variant_label: 'Lite',
                    variant_attributes: { support: 'Tự học', access: 'Trọn đời' },
                    price: base,
                    compare_at_price: roundMoney(base * 1.2),
                    stock_quantity: null,
                    sku: `DEMO-V2-${index + 1}-DIGI-01-L`,
                    image_url: selectImage('product_digital', index + 1, archTag),
                    is_active: true,
                    sort_order: 0,
                },
                {
                    variant_label: 'Standard',
                    variant_attributes: { support: '2 lần review form', access: 'Trọn đời' },
                    price: roundMoney(base * 1.35),
                    compare_at_price: roundMoney(base * 1.55),
                    stock_quantity: null,
                    sku: `DEMO-V2-${index + 1}-DIGI-01-S`,
                    image_url: selectImage('product_digital', index + 2, archTag),
                    is_active: true,
                    sort_order: 1,
                },
            ],
            training_package: {
                goal: archTag === 'recovery' ? 'rehabilitation' : archTag === 'strength' ? 'muscle_gain' : archTag === 'conditioning' ? 'endurance' : 'general_fitness',
                level: index % 3 === 0 ? 'beginner' : 'intermediate',
                duration_weeks: 8,
                sessions_per_week: 4,
                equipment_required: archTag === 'yoga' ? ['Thảm tập', 'Yoga block'] : ['Mini band', 'Dumbbell cơ bản'],
                includes_nutrition: archTag === 'strength' || archTag === 'conditioning',
                includes_video: true,
                preview_weeks: 1,
                program_structure: buildProgramStructure(coach.specialties[0], index),
                nutrition_guide: { note: 'Đi theo nguyên tắc ăn đủ và theo lịch sống, không ép kiểu quá cực đoan.' },
            },
        },
        {
            key: `${shop.key}-02`,
            shop_key: shop.key,
            seller_key: coach.key,
            category_slug: 'meal-guides',
            title: `${name} Reset Guide`,
            slug: product2Slug,
            description: 'Một bộ guide ngắn gọn cho người muốn dọn lại lịch ăn, giờ ngủ và cách hồi phục mà không bị quá tải thông tin.',
            product_type: 'digital',
            price: roundMoney(base * 0.65),
            compare_at_price: roundMoney(base * 0.9),
            currency: 'VND',
            stock_quantity: null,
            track_inventory: false,
            sku: `DEMO-V2-${index + 1}-DIGI-02`,
            digital_file_url: `${DOWNLOAD_BASE}/${product2Slug}.pdf`,
            preview_content: 'Gồm checklist ăn uống, gợi ý grocery list và mẫu check-in 10 phút.',
            thumbnail_url: selectImage('product_digital', index + 3, archTag),
            gallery: selectImages('product_digital', 3, index + 1, archTag),
            attributes: {
                Format: 'PDF',
                'Phù hợp': 'Người bận rộn cần một bộ hướng dẫn gọn',
                Preview: 'Có mẫu một ngày ăn và khung giờ ngủ tham khảo',
            },
            tags: ['digital', 'guide', 'reset'],
            featured_weight: 60 - index,
            variants: [
                {
                    variant_label: 'PDF',
                    variant_attributes: { format: 'PDF' },
                    price: roundMoney(base * 0.65),
                    compare_at_price: roundMoney(base * 0.9),
                    stock_quantity: null,
                    sku: `DEMO-V2-${index + 1}-DIGI-02-P`,
                    image_url: selectImage('product_digital', index + 4, archTag),
                    is_active: true,
                    sort_order: 0,
                },
            ],
        },
        {
            key: `${shop.key}-03`,
            shop_key: shop.key,
            seller_key: coach.key,
            category_slug: 'coach-consultation',
            title: `${name} 1-1 Audit`,
            slug: product3Slug,
            description: 'Buổi gọi 1-1 để xem lại form, lịch sống và tìm ra chỗ đang làm bạn kẹt tiến độ.',
            product_type: 'service',
            price: roundMoney(coach.base_price_monthly * 0.58),
            compare_at_price: roundMoney(coach.base_price_monthly * 0.72),
            currency: 'VND',
            stock_quantity: null,
            track_inventory: false,
            sku: `DEMO-V2-${index + 1}-SERV-01`,
            digital_file_url: null,
            preview_content: null,
            thumbnail_url: selectImage('product_service', index, archTag),
            gallery: selectImages('product_service', 3, index, archTag),
            attributes: {
                Format: 'Google Meet / Zoom',
                'Phù hợp': 'Người muốn gỡ đúng nút thắt trước khi mua block dài',
                'Phạm vi': 'Online toàn quốc',
            },
            tags: ['service', 'consultation', 'coach-audit'],
            featured_weight: 72 - index,
            variants: [
                {
                    variant_label: '60 phút',
                    variant_attributes: { support: 'Gọi video', recap: '1 file note tóm tắt' },
                    price: roundMoney(coach.base_price_monthly * 0.58),
                    compare_at_price: roundMoney(coach.base_price_monthly * 0.72),
                    stock_quantity: null,
                    sku: `DEMO-V2-${index + 1}-SERV-01-60`,
                    image_url: selectImage('product_service', index + 1, archTag),
                    is_active: true,
                    sort_order: 0,
                },
                {
                    variant_label: '90 phút + follow-up',
                    variant_attributes: { support: 'Gọi video + tin nhắn follow-up', recap: 'Checklist cá nhân' },
                    price: roundMoney(coach.base_price_monthly * 0.8),
                    compare_at_price: roundMoney(coach.base_price_monthly * 0.95),
                    stock_quantity: null,
                    sku: `DEMO-V2-${index + 1}-SERV-01-90`,
                    image_url: selectImage('product_service', index + 2, archTag),
                    is_active: true,
                    sort_order: 1,
                },
            ],
        },
        {
            key: `${shop.key}-04`,
            shop_key: shop.key,
            seller_key: coach.key,
            category_slug: archTag === 'recovery' || archTag === 'yoga' ? 'mobility-tools' : archTag === 'combat' ? 'combat-gear' : 'gym-gear',
            title: `${name} Training Toolkit`,
            slug: product4Slug,
            description: 'Bộ đồ cơ bản mà shop này thấy người mới dùng thật sự lâu chứ không mua xong để đó.',
            product_type: 'physical',
            price: roundMoney(base * 0.95),
            compare_at_price: roundMoney(base * 1.15),
            currency: 'VND',
            stock_quantity: 28 + index,
            track_inventory: true,
            sku: `DEMO-V2-${index + 1}-PHY-01`,
            digital_file_url: null,
            preview_content: null,
            thumbnail_url: selectImage('product_physical', index, archTag),
            gallery: selectImages('product_physical', 4, index, archTag),
            attributes: {
                'Khu vực giao': 'Toàn quốc',
                'Phù hợp': 'Người mới hoặc người đang cần một bộ gọn để tập đều',
                Chất_lieu: archTag === 'combat' ? 'Da PU + foam nhiều lớp' : 'Vải co giãn + cao su bền',
            },
            tags: ['physical', 'toolkit', archTag],
            featured_weight: 56 - index,
            variants: [
                {
                    variant_label: 'Bản cơ bản',
                    variant_attributes: { pack: 'Core', color: 'Đen' },
                    price: roundMoney(base * 0.95),
                    compare_at_price: roundMoney(base * 1.1),
                    stock_quantity: 18 + index,
                    sku: `DEMO-V2-${index + 1}-PHY-01-C`,
                    image_url: selectImage('product_physical', index + 1, archTag),
                    is_active: true,
                    sort_order: 0,
                },
                {
                    variant_label: 'Bản đầy đủ',
                    variant_attributes: { pack: 'Full', color: 'Xám kẽm' },
                    price: roundMoney(base * 1.25),
                    compare_at_price: roundMoney(base * 1.45),
                    stock_quantity: 12 + index,
                    sku: `DEMO-V2-${index + 1}-PHY-01-F`,
                    image_url: selectImage('product_physical', index + 2, archTag),
                    is_active: true,
                    sort_order: 1,
                },
            ],
        },
        {
            key: `${shop.key}-05`,
            shop_key: shop.key,
            seller_key: coach.key,
            category_slug: 'gym-merch',
            title: `${name} Studio Merch`,
            slug: product5Slug,
            description: 'Merch nhẹ nhàng, mặc đi tập được và không nhìn như đồ phát sự kiện.',
            product_type: 'physical',
            price: roundMoney(base * 0.75),
            compare_at_price: roundMoney(base * 0.95),
            currency: 'VND',
            stock_quantity: 35 + index,
            track_inventory: true,
            sku: `DEMO-V2-${index + 1}-PHY-02`,
            digital_file_url: null,
            preview_content: null,
            thumbnail_url: selectImage('product_physical', index + 5),
            gallery: selectImages('product_physical', 4, index + 4),
            attributes: {
                'Khu vực giao': 'Toàn quốc',
                Fit: 'Regular',
                'Phù hợp': 'Mặc đi tập hoặc mặc thường ngày',
            },
            tags: ['merch', 'physical', 'apparel'],
            featured_weight: 40 - index,
            variants: [
                {
                    variant_label: 'Size S-M',
                    variant_attributes: { size: 'S-M', color: 'Trắng kem' },
                    price: roundMoney(base * 0.75),
                    compare_at_price: roundMoney(base * 0.95),
                    stock_quantity: 18 + index,
                    sku: `DEMO-V2-${index + 1}-PHY-02-SM`,
                    image_url: selectImage('product_physical', index + 6),
                    is_active: true,
                    sort_order: 0,
                },
                {
                    variant_label: 'Size L-XL',
                    variant_attributes: { size: 'L-XL', color: 'Xám nhạt' },
                    price: roundMoney(base * 0.8),
                    compare_at_price: roundMoney(base),
                    stock_quantity: 14 + index,
                    sku: `DEMO-V2-${index + 1}-PHY-02-LX`,
                    image_url: selectImage('product_physical', index + 7),
                    is_active: true,
                    sort_order: 1,
                },
            ],
        },
    ];
}

function buildGymProductSet(shop: MockShopRecord, owner: MockGymOwnerRecord, index: number): MockProductRecord[] {
    const name = shortName(owner.full_name);
    const titles = ['Khăn tập nhanh khô', 'Shaker thép', 'Foam roller mini', 'Áo tập studio', 'Túi gear cuối tuần'];
    return titles.map((title, itemIndex) => ({
        key: `${shop.key}-${String(itemIndex + 1).padStart(2, '0')}`,
        shop_key: shop.key,
        seller_key: owner.key,
        category_slug: itemIndex === 2 ? 'recovery-tools' : itemIndex === 3 ? 'gym-merch' : 'gym-gear',
        title: `${name} ${title}`,
        slug: generateSlug(`${shop.shop_slug}-${title}`),
        description: 'Món bán đều nhất ở quầy vì đơn giản, bền và ai đi tập thường xuyên cũng dùng được.',
        product_type: 'physical',
        price: roundMoney(220000 + index * 15000 + itemIndex * 80000),
        compare_at_price: roundMoney(290000 + index * 15000 + itemIndex * 85000),
        currency: 'VND',
        stock_quantity: 32 + itemIndex * 6,
        track_inventory: true,
        sku: `DEMO-V2-GYM-${index + 1}-${itemIndex + 1}`,
        digital_file_url: null,
        preview_content: null,
        thumbnail_url: selectImage('product_physical', index + itemIndex + 2),
        gallery: selectImages('product_physical', 4, index + itemIndex + 1),
        attributes: {
            'Khu vực giao': 'Toàn quốc',
            'Phù hợp': 'Hội viên cần món dễ dùng mỗi ngày',
            Màu: itemIndex % 2 === 0 ? 'Đen nhám' : 'Trắng kem',
        },
        tags: ['gym', 'physical', 'daily-use'],
        featured_weight: 35 - itemIndex,
        variants: [
                {
                    variant_label: 'Bản tiêu chuẩn',
                    variant_attributes: { color: 'Đen nhám', bonus: '' },
                    price: roundMoney(220000 + index * 15000 + itemIndex * 80000),
                    compare_at_price: roundMoney(290000 + index * 15000 + itemIndex * 85000),
                    stock_quantity: 18 + itemIndex * 3,
                sku: `DEMO-V2-GYM-${index + 1}-${itemIndex + 1}-STD`,
                image_url: selectImage('product_physical', index + itemIndex + 3),
                is_active: true,
                sort_order: 0,
            },
            {
                variant_label: 'Bản bundle',
                variant_attributes: { color: 'Xám sáng', bonus: 'Sticker pack' },
                price: roundMoney((220000 + index * 15000 + itemIndex * 80000) * 1.18),
                compare_at_price: roundMoney((290000 + index * 15000 + itemIndex * 85000) * 1.1),
                stock_quantity: 11 + itemIndex * 2,
                sku: `DEMO-V2-GYM-${index + 1}-${itemIndex + 1}-BDL`,
                image_url: selectImage('product_physical', index + itemIndex + 4),
                is_active: true,
                sort_order: 1,
            },
        ],
    }));
}

function buildMemberProductSet(shop: MockShopRecord, member: MockMemberRecord, index: number): MockProductRecord[] {
    const name = shortName(member.full_name);
    const titles = ['Lunch box chia ngăn', 'Bộ dây mini band', 'Bình nước mang đi tập', 'Túi tote đi studio', 'Snack box tiện tủ lạnh'];
    const categories = ['gym-gear', 'mobility-tools', 'gym-gear', 'gym-merch', 'supplements'] as const;
    return titles.map((title, itemIndex) => ({
        key: `${shop.key}-${String(itemIndex + 1).padStart(2, '0')}`,
        shop_key: shop.key,
        seller_key: member.key,
        category_slug: categories[itemIndex],
        title: `${name} ${title}`,
        slug: generateSlug(`${shop.shop_slug}-${title}`),
        description: 'Một món rất đời thường, hợp với kiểu người tập muốn giữ nhịp sống ổn mà không phải mua đồ quá ngợp.',
        product_type: 'physical',
        price: roundMoney(160000 + index * 12000 + itemIndex * 55000),
        compare_at_price: roundMoney(220000 + index * 12000 + itemIndex * 65000),
        currency: 'VND',
        stock_quantity: 22 + itemIndex * 5,
        track_inventory: true,
        sku: `DEMO-V2-MEM-${index + 1}-${itemIndex + 1}`,
        digital_file_url: null,
        preview_content: null,
        thumbnail_url: selectImage('product_physical', index + itemIndex + 6),
        gallery: selectImages('product_physical', 4, index + itemIndex + 5),
        attributes: {
            'Khu vực giao': 'Toàn quốc',
            'Phù hợp': 'Người tập bận rộn cần món dùng mỗi ngày',
            Ghi_chu: itemIndex === 4 ? 'Bảo quản ngăn mát sau khi mở' : 'Dễ cất trong balo hoặc cốp xe',
        },
        tags: ['daily', 'physical', member.interests[0]],
        featured_weight: 28 - itemIndex,
        variants: [
            {
                variant_label: 'Bản 1 món',
                variant_attributes: { size: 'Tiêu chuẩn' },
                price: roundMoney(160000 + index * 12000 + itemIndex * 55000),
                compare_at_price: roundMoney(220000 + index * 12000 + itemIndex * 65000),
                stock_quantity: 14 + itemIndex * 2,
                sku: `DEMO-V2-MEM-${index + 1}-${itemIndex + 1}-STD`,
                image_url: selectImage('product_physical', index + itemIndex + 7),
                is_active: true,
                sort_order: 0,
            },
        ],
    }));
}

function buildProducts(shops: MockShopRecord[], coaches: MockCoachRecord[], gymOwners: MockGymOwnerRecord[], members: MockMemberRecord[]): MockProductRecord[] {
    const coachMap = new Map(coaches.map((item) => [item.key, item]));
    const gymOwnerMap = new Map(gymOwners.map((item) => [item.key, item]));
    const memberMap = new Map(members.map((item) => [item.key, item]));

    return shops.flatMap((shop, index) => {
        const coach = coachMap.get(shop.owner_key);
        if (coach) return buildCoachProductSet(shop, coach, index);
        const gymOwner = gymOwnerMap.get(shop.owner_key);
        if (gymOwner) return buildGymProductSet(shop, gymOwner, index);
        const member = memberMap.get(shop.owner_key);
        if (member) return buildMemberProductSet(shop, member, index);
        return [];
    });
}

function buildMessageThreads(coaches: MockCoachRecord[], athletes: MockAthleteRecord[], members: MockMemberRecord[], shops: MockShopRecord[]): MockMessageThread[] {
    const coachThreads = range(20).map((index) => {
        const member = cycle(members, index);
        const coach = cycle(coaches, index);
        return {
            key: `thread-coach-${index + 1}`,
            participants: [member.key, coach.key] as [string, string],
            messages: [
                {
                    sender_key: member.key,
                    content: `Chào ${shortName(coach.full_name)}, mình đang xem hồ sơ và muốn hỏi trước là lịch tối trong tuần còn chỗ không?`,
                    is_read: true,
                    created_at: `2026-03-${String((index % 9) + 1).padStart(2, '0')}T19:10:00+07:00`,
                },
                {
                    sender_key: coach.key,
                    content: 'Chào bạn, mình còn 2 khung tối. Nếu bạn gửi nhanh mục tiêu hiện tại thì mình gợi ý buổi đầu dễ hơn.',
                    is_read: true,
                    created_at: `2026-03-${String((index % 9) + 1).padStart(2, '0')}T19:22:00+07:00`,
                },
                {
                    sender_key: member.key,
                    content: 'Mình ưu tiên giảm mỡ nhưng không muốn đẩy quá gắt vì đang làm full-time.',
                    is_read: true,
                    created_at: `2026-03-${String((index % 9) + 1).padStart(2, '0')}T19:28:00+07:00`,
                },
                {
                    sender_key: coach.key,
                    content: 'Ổn, vậy mình sẽ đi kiểu vừa sức trước. Bạn cứ giữ nhịp 3 buổi đều là kết quả sẽ tới.',
                    is_read: index % 3 !== 0,
                    created_at: `2026-03-${String((index % 9) + 1).padStart(2, '0')}T19:34:00+07:00`,
                },
            ],
        };
    });

    const sellerThreads = range(20).map((index) => {
        const athlete = cycle(athletes, index);
        const shop = cycle(shops, index);
        return {
            key: `thread-shop-${index + 1}`,
            participants: [athlete.key, shop.owner_key] as [string, string],
            messages: [
                {
                    sender_key: athlete.key,
                    content: `Shop ơi, món ${index % 2 === 0 ? 'này' : 'kit này'} có phù hợp người mới không hay phải có nền trước?`,
                    is_read: true,
                    created_at: `2026-03-${String((index % 9) + 10).padStart(2, '0')}T10:05:00+07:00`,
                },
                {
                    sender_key: shop.owner_key,
                    content: 'Dùng được cho người mới nhé. Nếu bạn mới bắt đầu thì nên chọn bản tiêu chuẩn trước để đỡ phí.',
                    is_read: true,
                    created_at: `2026-03-${String((index % 9) + 10).padStart(2, '0')}T10:14:00+07:00`,
                },
                {
                    sender_key: athlete.key,
                    content: 'Mình ở tỉnh, giao ra ngoài thành phố lớn có lâu quá không?',
                    is_read: true,
                    created_at: `2026-03-${String((index % 9) + 10).padStart(2, '0')}T10:20:00+07:00`,
                },
                {
                    sender_key: shop.owner_key,
                    content: 'Nếu là hàng vật lý thì thường 2-4 ngày, còn digital thì nhận ngay sau thanh toán.',
                    is_read: index % 4 !== 0,
                    created_at: `2026-03-${String((index % 9) + 10).padStart(2, '0')}T10:27:00+07:00`,
                },
            ],
        };
    });

    return [...coachThreads, ...sellerThreads];
}

function buildProductOrders(products: MockProductRecord[], members: MockMemberRecord[], athletes: MockAthleteRecord[]): MockProductOrderRecord[] {
    const buyers = [...members.slice(0, 18), ...athletes.slice(0, 18)];
    return range(36).map((index) => {
        const buyer = buyers[index];
        const product = cycle(products, index * 2 + 3);
        const firstVariant = product.variants[0];
        const physical = product.product_type === 'physical';
        const delivered = index % 6 !== 0;
        const refunded = index % 11 === 0;
        const status = refunded ? 'refunded' : !delivered ? 'processing' : 'delivered';
        const payment_status = refunded ? 'refunded' : index % 7 === 0 ? 'pending' : 'paid';
        const quantity = product.product_type === 'physical' && index % 5 === 0 ? 2 : 1;
        const shippingFee = physical ? 30000 + (index % 4) * 10000 : 0;
        const note = physical ? 'Gọi trước khi giao giúp mình vào giờ nghỉ trưa.' : 'Nhận hàng online là được.';

        return {
            key: `order-${index + 1}`,
            buyer_key: buyer.key,
            order_number: `GV-DEMO-V2-${String(index + 1).padStart(4, '0')}`,
            status,
            payment_method: cycle(['bank_transfer', 'momo', 'vnpay', 'cod'] as const, index),
            payment_status,
            shipping_fee: shippingFee,
            discount_amount: index % 8 === 0 ? 40000 : 0,
            note,
            tracking_number: physical && delivered ? `TRACK${String(index + 1).padStart(6, '0')}` : null,
            shipping_address: physical
                ? {
                    full_name: buyer.full_name,
                    phone: `+84 9${(10000000 + index * 119).toString().slice(0, 8)}`,
                    address: `${20 + index} Đường ${buyer.district}`,
                    district: buyer.district,
                    city: buyer.city,
                    province: buyer.city,
                    note: 'Nhận ngoài giờ hành chính được.',
                }
                : null,
            items: [
                {
                    product_key: product.key,
                    variant_sku: firstVariant?.sku,
                    quantity,
                    digital_download_url: product.product_type === 'digital' ? product.digital_file_url : null,
                    digital_download_count: product.product_type === 'digital' ? index % 2 : undefined,
                    digital_download_limit: product.product_type === 'digital' ? 5 : undefined,
                },
            ],
        };
    });
}

function buildWishlists(products: MockProductRecord[], members: MockMemberRecord[], athletes: MockAthleteRecord[]): MockWishlistRecord[] {
    const users = [...members, ...athletes];
    const seen = new Set<string>();
    const result: MockWishlistRecord[] = [];

    range(120).forEach((index) => {
        if (result.length >= 80) return;
        const user = cycle(users, index);
        const product = cycle(products, index * 3 + 4);
        const key = `${user.key}:${product.key}`;
        if (seen.has(key)) return;
        seen.add(key);
        result.push({ user_key: user.key, product_key: product.key });
    });

    return result;
}

function buildProductReviews(products: MockProductRecord[], orders: MockProductOrderRecord[], members: MockMemberRecord[], athletes: MockAthleteRecord[]): MockProductReviewRecord[] {
    const seen = new Set<string>();
    const verified: MockProductReviewRecord[] = [];

    orders.forEach((order, index) => {
        const productKey = order.items[0]?.product_key;
        if (!productKey) return;
        const key = `${order.buyer_key}:${productKey}`;
        if (seen.has(key) || verified.length >= 36) return;
        seen.add(key);
        verified.push({
            user_key: order.buyer_key,
            product_key: productKey,
            rating: index % 7 === 0 ? 4 : 5,
            comment: index % 2 === 0
                ? 'Đúng kiểu mình cần: mô tả thật, dùng tới đâu biết tới đó, không bị màu mè quá đà.'
                : 'Shop trả lời nhanh và hàng hoặc file nhận đúng như phần mô tả trên app.',
            quality_rating: 4 + (index % 2),
            value_rating: 4 + (index % 2),
            delivery_rating: 4,
            is_verified_purchase: true,
            reply_text: 'Cảm ơn bạn đã mua và để lại nhận xét rất cụ thể. Team giữ cách mô tả thật cũng vì những feedback như thế này.',
        });
    });

    const extrasPool = [...members, ...athletes];
    const extras: MockProductReviewRecord[] = [];
    range(200).forEach((index) => {
        if (verified.length + extras.length >= 60) return;
        const user = cycle(extrasPool, index);
        const product = cycle(products, index * 5 + 7);
        const key = `${user.key}:${product.key}`;
        if (seen.has(key)) return;
        seen.add(key);
        extras.push({
            user_key: user.key,
            product_key: product.key,
            rating: index % 4 === 0 ? 4 : 5,
            comment: index % 3 === 0
                ? 'Mình chưa mua block dài nhưng cách shop nói chuyện và mô tả khá thật, dễ tin hơn nhiều chỗ khác.'
                : 'Dễ hiểu, giá không bị lắt léo và hình ảnh bám khá sát món thực tế.',
            quality_rating: 4,
            value_rating: 4 + (index % 2),
            delivery_rating: product.product_type === 'physical' ? 4 : 5,
            is_verified_purchase: false,
        });
    });

    return [...verified, ...extras];
}

function buildCommunityGallery(coaches: MockCoachRecord[], athletes: MockAthleteRecord[]): MockGalleryRecord[] {
    const linked = [...coaches.slice(0, 10), ...athletes.slice(0, 10)];
    return linked.map((person, index) => ({
        key: `community-${index + 1}`,
        image_url: index % 2 === 0
            ? person.gallery[0]?.image_url ?? selectImage('community_gallery', index)
            : selectImage('community_gallery', index),
        caption: index % 2 === 0
            ? `Một khoảnh khắc rất đúng tinh thần ${shortName(person.full_name)}: tập thật, nói thật và giữ nhịp đều.`
            : `Ảnh cộng đồng được chọn vì nhìn vào là biết ngay đây là một app về tập luyện và wellness, không phải ảnh stock vô hồn.`,
        category: index % 5 === 0 ? 'event' : index % 3 === 0 ? 'portrait' : 'workout',
        linked_user_key: person.key,
        source: index % 2 === 0 ? 'trainer_gallery' : 'admin_upload',
        is_featured: index < 8,
        order_number: index,
    }));
}

export function buildMockDataset(): MockDataset {
    const coaches = coachSpecs.map((spec, index) => buildCoachRecord(spec, index));
    const athletes = athleteSpecs.map((spec, index) => buildAthleteRecord(spec, index));
    const members = memberSpecs.map((spec, index) => buildMemberRecord(spec, index));
    const gymOwners = gymOwnerSpecs.map((spec, index) => buildGymOwnerRecord(spec, index));
    const gyms = gymSpecs.map((spec, index) => buildGymRecord(spec, index));
    const shops = buildShops(coaches, gymOwners, members);
    const products = buildProducts(shops, coaches, gymOwners, members);
    const messageThreads = buildMessageThreads(coaches, athletes, members, shops);
    const productOrders = buildProductOrders(products, members, athletes);
    const wishlists = buildWishlists(products, members, athletes);
    const productReviews = buildProductReviews(products, productOrders, members, athletes);
    const communityGallery = buildCommunityGallery(coaches, athletes);

    return {
        coaches,
        athletes,
        members,
        gymOwners,
        gyms,
        shops,
        products,
        communityGallery,
        messageThreads,
        productOrders,
        wishlists,
        productReviews,
    };
}
