/**
 * GYMERVIET - Demo Profiles Seed Script
 * Tạo 9 profile mẫu: 3 Trainer + 3 Athlete + 3 Admin
 * Run: cd backend && npx ts-node src/seeds/demoProfiles.ts
 */

import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Program } from '../entities/Program';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Demo@123456';

// ============================================================
// TRAINERS (3 profiles)
// ============================================================
const trainers = [
    {
        email: 'nguyen.tuan.trainer@demo.gymerviet.com',
        full_name: 'Nguyễn Tuấn Anh',
        user_type: 'trainer' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenTuanAnh&backgroundColor=b6e3f4&skinColor=f8d25c',
        bio: 'Strength Coach với 8 năm kinh nghiệm. Cựu VĐV Powerlifting quốc gia. Đã giúp hơn 200+ học viên đạt thành tích tốt nhất của họ. Chuyên về Hypertrophy, Strength Training và Body Recomposition. Chứng chỉ: NSCA-CSCS, NASM-CPT.',
        specialties: ['Powerlifting', 'Strength Training', 'Bodybuilding', 'Body Recomposition'],
        base_price_monthly: 1500000,
        is_verified: true,
    },
    {
        email: 'linh.yoga.trainer@demo.gymerviet.com',
        full_name: 'Trần Thị Minh Linh',
        user_type: 'trainer' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiMinhLinh&backgroundColor=d1f5d3&skinColor=f8d25c',
        bio: 'Yoga & Pilates Instructor với 6 năm giảng dạy. Tốt nghiệp RYT-500 tại Rishikesh, Ấn Độ. Chuyên về Vinyasa, Hatha Yoga, Pilates cải thiện tư thế và giảm đau lưng. Đã dạy cho 150+ học viên từ 18-65 tuổi.',
        specialties: ['Yoga', 'Pilates', 'Flexibility', 'Meditation', 'Core Strength'],
        base_price_monthly: 1200000,
        is_verified: true,
    },
    {
        email: 'hung.boxing.trainer@demo.gymerviet.com',
        full_name: 'Lê Văn Hùng',
        user_type: 'trainer' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanHung&backgroundColor=ffd3b6&skinColor=ae5d29',
        bio: 'Boxing & MMA Coach, cựu VĐV Boxing nghiệp dư hạng 69kg. 10 năm kinh nghiệm huấn luyện. Chuyên đào tạo từ kỹ thuật cơ bản đến thi đấu chuyên nghiệp. Kết hợp Muay Thai và Boxing để tăng hiệu quả tập luyện.',
        specialties: ['Boxing', 'Muay Thai', 'MMA', 'HIIT', 'Cardio', 'Self Defense'],
        base_price_monthly: 2000000,
        is_verified: true,
    },
];

// ============================================================
// ATHLETES (3 profiles)
// ============================================================
const athletes = [
    {
        email: 'hoa.runner.athlete@demo.gymerviet.com',
        full_name: 'Phạm Thị Hoa',
        user_type: 'athlete' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThiHoa&backgroundColor=c0f0e8&skinColor=f8d25c',
        bio: 'Runner nghiệp dư, đam mê chạy bộ từ 3 năm. Đã hoàn thành nhiều Half Marathon. Mục tiêu: chạy Full Marathon đầu tiên trong năm 2026. Đang tìm HLV để cải thiện kỹ thuật chạy và phòng chống chấn thương.',
        height_cm: 160,
        current_weight_kg: 52,
        experience_level: 'intermediate' as const,
    },
    {
        email: 'minh.beginner.athlete@demo.gymerviet.com',
        full_name: 'Vũ Minh Quân',
        user_type: 'athlete' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VuMinhQuan&backgroundColor=e8d5f5&skinColor=f8d25c',
        bio: 'Nhân viên văn phòng 27 tuổi, mới bắt đầu tập gym được 2 tháng. Muốn tăng cơ, giảm mỡ tích lũy từ thời ngồi văn phòng. Cần sự hướng dẫn bài bản để tránh chấn thương và đạt kết quả nhanh nhất.',
        height_cm: 172,
        current_weight_kg: 78,
        experience_level: 'beginner' as const,
    },
    {
        email: 'son.advanced.athlete@demo.gymerviet.com',
        full_name: 'Đinh Quốc Sơn',
        user_type: 'athlete' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DinhQuocSon&backgroundColor=ffd3d3&skinColor=ae5d29',
        bio: 'Tập gym được 5 năm, đã đạt Squat 120kg / Bench 90kg / Deadlift 150kg. Mục tiêu: thi đấu Powerlifting nghiệp dư vào cuối năm. Đang tìm HLV chuyên về sức mạnh để tối ưu kỹ thuật và chu kỳ tập.',
        height_cm: 175,
        current_weight_kg: 83,
        experience_level: 'advanced' as const,
    },
];

// ============================================================
// ADMINS (3 profiles - dùng để quản lý hệ thống)
// ============================================================
const admins = [
    {
        email: 'admin@gymerviet.com',
        full_name: 'GYMERVIET Admin',
        user_type: 'admin' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GymervietAdmin&backgroundColor=b6e3f4',
        bio: 'Tài khoản quản trị viên hệ thống GYMERVIET.',
        is_verified: true,
    },
    {
        email: 'support@gymerviet.com',
        full_name: 'GYMERVIET Support',
        user_type: 'admin' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GymervietSupport&backgroundColor=d1f5d3',
        bio: 'Tài khoản hỗ trợ người dùng GYMERVIET. Phản hồi trong vòng 24 giờ làm việc.',
        is_verified: true,
    },
    {
        email: 'content@gymerviet.com',
        full_name: 'GYMERVIET Content',
        user_type: 'admin' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GymervietContent&backgroundColor=ffd3b6',
        bio: 'Tài khoản quản lý nội dung và kiểm duyệt profile GYMERVIET.',
        is_verified: true,
    },
];

// ============================================================
// PROGRAMS cho Trainers
// ============================================================
type PricingType = 'monthly' | 'lump_sum' | 'per_session';

const trainerPrograms: Record<string, Array<{
    name: string;
    description: string;
    duration_weeks: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price_monthly?: number;
    price_one_time?: number;
    price_per_session?: number;
    pricing_type: PricingType;
    training_format: 'online' | 'offline_1on1' | 'offline_group' | 'hybrid';
    max_clients: number;
    training_goals: string[];
    included_features: string[];
}>> = {
    'nguyen.tuan.trainer@demo.gymerviet.com': [
        {
            name: 'Strength Foundation - 12 Tuần Nền Tảng Sức Mạnh',
            description: 'Chương trình 12 tuần dành cho người mới bắt đầu hoặc muốn xây dựng lại nền tảng sức mạnh. Tập trung vào Big 3 (Squat, Bench, Deadlift) với kỹ thuật đúng chuẩn, giúp tăng sức mạnh 30-50% trong 3 tháng.',
            duration_weeks: 12,
            difficulty: 'beginner',
            pricing_type: 'monthly',
            price_monthly: 1500000,
            training_format: 'online',
            max_clients: 20,
            training_goals: ['Tăng sức mạnh', 'Học kỹ thuật cơ bản', 'Phòng chống chấn thương'],
            included_features: ['Lịch tập 3 buổi/tuần', 'Video hướng dẫn kỹ thuật', 'Form check hàng tuần', 'Chat hỗ trợ 24/7', 'Điều chỉnh theo tiến độ'],
        },
        {
            name: 'Hypertrophy Pro - Tăng Cơ Khối Lượng',
            description: 'Chương trình chuyên biệt cho người muốn tăng cơ hiệu quả. Sử dụng phương pháp PPL (Push/Pull/Legs) kết hợp Progressive Overload có tính toán khoa học. Cam kết tăng 3-5kg cơ sau 16 tuần.',
            duration_weeks: 16,
            difficulty: 'intermediate',
            pricing_type: 'monthly',
            price_monthly: 2000000,
            training_format: 'hybrid',
            max_clients: 15,
            training_goals: ['Tăng cơ bắp', 'Body recomposition', 'Cải thiện thể hình'],
            included_features: ['6 buổi/tuần có lịch chi tiết', 'Kế hoạch dinh dưỡng', 'Body scan hàng tháng', '1 buổi PT offline/tháng', 'Theo dõi tiến độ realtime'],
        },
        {
            name: 'Powerlifting Prep - Chuẩn Bị Thi Đấu',
            description: 'Chương trình chuyên sâu cho VĐV muốn tham gia thi đấu Powerlifting. Bao gồm peak phase, taper và chiến lược attempt day. Phù hợp cho người đã có nền tảng sức mạnh tốt.',
            duration_weeks: 20,
            difficulty: 'advanced',
            pricing_type: 'lump_sum',
            price_one_time: 8000000,
            training_format: 'offline_1on1',
            max_clients: 5,
            training_goals: ['Thi đấu Powerlifting', 'Maximize total', 'Peak performance'],
            included_features: ['Coach 100% 1-on-1', 'Meet preparation strategy', 'Video analysis từng set', 'Nutrition periodization', 'Mental coaching', 'Attempt selection ngày thi'],
        },
    ],
    'linh.yoga.trainer@demo.gymerviet.com': [
        {
            name: 'Morning Flow - Yoga Buổi Sáng 30 Ngày',
            description: 'Thách thức yoga 30 ngày cho người mới bắt đầu. Mỗi buổi sáng 30-45 phút với chuỗi động tác Vinyasa nhẹ nhàng, giúp tỉnh táo tinh thần, cải thiện linh hoạt và bắt đầu ngày làm việc đầy năng lượng.',
            duration_weeks: 4,
            difficulty: 'beginner',
            pricing_type: 'lump_sum',
            price_one_time: 800000,
            training_format: 'online',
            max_clients: 50,
            training_goals: ['Giảm stress', 'Tăng linh hoạt', 'Cải thiện tâm trạng buổi sáng'],
            included_features: ['30 video buổi tập (30-45 phút)', 'Hướng dẫn thở đúng cách', 'Modifications cho người chấn thương', 'Community group chat', 'Truy cập mãi mãi'],
        },
        {
            name: 'Core & Posture - Trị Đau Lưng, Cải Thiện Tư Thế',
            description: 'Chương trình kết hợp Yoga và Pilates, thiết kế đặc biệt cho dân văn phòng bị đau lưng, đau cổ vai gáy. Tập trung vào core stability và mobility, đã giúp 90% học viên giảm đau trong 4 tuần đầu.',
            duration_weeks: 8,
            difficulty: 'beginner',
            pricing_type: 'monthly',
            price_monthly: 1200000,
            training_format: 'online',
            max_clients: 25,
            training_goals: ['Giảm đau lưng', 'Cải thiện tư thế', 'Tăng sức mạnh core'],
            included_features: ['3 buổi/tuần linh hoạt giờ giấc', 'Video follow-along', 'Bài tập stretching tại bàn làm việc', 'Tư vấn ergonomics', 'Check-in tiến độ hàng tuần'],
        },
        {
            name: 'Advanced Yoga - Nâng Cao & Acro Yoga',
            description: 'Chương trình chuyên sâu cho người đã tập yoga 2+ năm, muốn chinh phục các tư thế nâng cao: Handstand, Forearm Stand, Full Backbend, và các chuỗi Ashtanga. Kết hợp partner work (Acro Yoga).',
            duration_weeks: 12,
            difficulty: 'advanced',
            pricing_type: 'per_session',
            price_per_session: 350000,
            training_format: 'offline_1on1',
            max_clients: 8,
            training_goals: ['Handstand', 'Backbend nâng cao', 'Acro Yoga cơ bản', 'Nâng cao flexibility'],
            included_features: ['1-on-1 hoặc nhóm nhỏ 2 người', 'Video phân tích tư thế', 'Lộ trình cá nhân hóa', 'Dropback & walkover coaching', 'Khóa học lifetime access'],
        },
    ],
    'hung.boxing.trainer@demo.gymerviet.com': [
        {
            name: 'Boxing Fundamentals - Học Boxing Từ Đầu',
            description: 'Khóa học boxing toàn diện từ cơ bản đến nền tảng. Học stance, footwork, jab-cross-hook-uppercut, defense, và shadowboxing. Không cần kinh nghiệm trước. Kết hợp cardio đốt cháy chất béo cực hiệu quả.',
            duration_weeks: 8,
            difficulty: 'beginner',
            pricing_type: 'monthly',
            price_monthly: 1800000,
            training_format: 'offline_group',
            max_clients: 12,
            training_goals: ['Tự vệ cơ bản', 'Cardio & đốt mỡ', 'Kỷ luật tinh thần'],
            included_features: ['3 buổi/tuần tại gym', 'Cho mượn găng tập', 'Shadowboxing routine', 'Pad work với Coach', 'Video kỹ thuật'],
        },
        {
            name: 'HIIT Boxing - Đốt Mỡ Cực Mạnh',
            description: 'Kết hợp Boxing và HIIT để tối đa hóa đốt cháy calo — tiêu thụ 600-800 kcal/buổi. Phù hợp cho người muốn giảm cân nhanh, tăng cardio trong khi học kỹ năng tự vệ thực chiến.',
            duration_weeks: 6,
            difficulty: 'intermediate',
            pricing_type: 'per_session',
            price_per_session: 400000,
            training_format: 'offline_group',
            max_clients: 15,
            training_goals: ['Giảm cân', 'Tăng cardio', 'Học boxing', 'Stress relief'],
            included_features: ['Lịch linh hoạt 5 buổi/tuần', 'Equipment được cung cấp', 'Heart rate tracking', 'Nutrition tips', 'Progress photos hàng tháng'],
        },
        {
            name: 'MMA Elite - Chiến Binh Thực Thụ',
            description: 'Chương trình toàn diện kết hợp Boxing, Muay Thai, Wrestling, và Brazilian Jiu-Jitsu. Dành cho người nghiêm túc muốn tập MMA hoặc thi đấu amateur. Huấn luyện theo tiêu chuẩn chuyên nghiệp.',
            duration_weeks: 24,
            difficulty: 'advanced',
            pricing_type: 'monthly',
            price_monthly: 3500000,
            training_format: 'offline_1on1',
            max_clients: 6,
            training_goals: ['Thi đấu MMA amateur', 'Kỹ năng striking', 'Ground game', 'Peak conditioning'],
            included_features: ['5 buổi/tuần 2h/buổi', 'Sparring có kiểm soát', 'Video fight analysis', 'Competition preparation', 'Diet & weight cut advice', 'Mental toughness coaching'],
        },
    ],
};

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seed() {
    console.log('🌱 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected!\n');

    const userRepo = AppDataSource.getRepository(User);
    const programRepo = AppDataSource.getRepository(Program);

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    const createdTrainerEmails: string[] = [];

    // ─── Insert Trainers ───
    console.log('👔 Creating Trainers...');
    for (const t of trainers) {
        const existing = await userRepo.findOneBy({ email: t.email });
        if (existing) {
            console.log(`  ⚠️  Trainer ${t.full_name} already exists, skipping.`);
            createdTrainerEmails.push(t.email);
            continue;
        }
        const user = userRepo.create({ ...t, password: hashedPassword });
        await userRepo.save(user);
        createdTrainerEmails.push(t.email);
        console.log(`  ✅ Created trainer: ${t.full_name} (${t.email})`);
    }

    // ─── Insert Trainer Programs ───
    console.log('\n📋 Creating Programs...');
    for (const email of createdTrainerEmails) {
        const trainer = await userRepo.findOneBy({ email });
        if (!trainer) continue;

        const programs = trainerPrograms[email];
        if (!programs) continue;

        for (const p of programs) {
            const prog = programRepo.create({
                ...p,
                trainer_id: trainer.id,
                is_published: true,
                equipment_needed: ['Thiết bị tại gym'],
            });
            await programRepo.save(prog);
            console.log(`  ✅ Created program "${p.name}" for ${trainer.full_name}`);
        }
    }

    // ─── Insert Athletes ───
    console.log('\n🏃 Creating Athletes...');
    for (const a of athletes) {
        const existing = await userRepo.findOneBy({ email: a.email });
        if (existing) {
            console.log(`  ⚠️  Athlete ${a.full_name} already exists, skipping.`);
            continue;
        }
        const user = userRepo.create({ ...a, password: hashedPassword, is_verified: false });
        await userRepo.save(user);
        console.log(`  ✅ Created athlete: ${a.full_name} (${a.email})`);
    }

    // ─── Insert Admins ───
    console.log('\n🔐 Creating Admins...');
    for (const ad of admins) {
        const existing = await userRepo.findOneBy({ email: ad.email });
        if (existing) {
            console.log(`  ⚠️  Admin ${ad.full_name} already exists, skipping.`);
            continue;
        }
        const user = userRepo.create({ ...ad, password: hashedPassword, base_price_monthly: null, specialties: null });
        await userRepo.save(user);
        console.log(`  ✅ Created admin: ${ad.full_name} (${ad.email})`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('\n📊 Summary:');
    console.log(`  👔 Trainers: ${trainers.length} (each with 3 programs)`);
    console.log(`  🏃 Athletes: ${athletes.length}`);
    console.log(`  🔐 Admins: ${admins.length}`);
    console.log(`  📋 Total programs: ${trainers.length * 3}`);
    console.log('\n🔑 Demo password for all accounts: Demo@123456');

    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
