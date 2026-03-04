import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { GymCenter } from '../entities/GymCenter';
import { GymBranch } from '../entities/GymBranch';
import { GymAmenity } from '../entities/GymAmenity';
import { GymEquipment } from '../entities/GymEquipment';
import { GymPricing } from '../entities/GymPricing';
import { GymGallery } from '../entities/GymGallery';
import { Program } from '../entities/Program';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Demo@123456';

export async function seedRemote() {
    console.log('🚀 Starting Comprehensive Demo Data Seed (Fixed relations)...');
    try {
        if (!AppDataSource.isInitialized) await AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(User);
        const gymRepo = AppDataSource.getRepository(GymCenter);
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const amenityRepo = AppDataSource.getRepository(GymAmenity);
        const equipmentRepo = AppDataSource.getRepository(GymEquipment);
        const pricingRepo = AppDataSource.getRepository(GymPricing);
        const galleryRepo = AppDataSource.getRepository(GymGallery);
        const programRepo = AppDataSource.getRepository(Program);

        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

        // 1. Create Coaches
        const coachesData = [
            {
                email: 'hoang.cali@demo.com',
                full_name: 'Phan Minh Hoàng',
                user_type: 'trainer' as const,
                avatar_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400',
                headline: 'Street Workout & Calisthenics Pro',
                bio_short: 'Chuyên gia trọng lượng cơ thể với 7 năm tập luyện.',
                bio_long: 'Hoàng bắt đầu từ vỉa hè công viên và giờ là Master Coach tại GYMERVIET. Chuyên về thăng bằng tay, sức mạnh tương đối và phục hồi chuyển động.',
                specialties: ['Calisthenics', 'Bodyweight', 'Mobility'],
                years_experience: 7,
                clients_trained: 150,
                success_stories: 45,
                certifications_json: JSON.stringify([{ name: 'ICS Level 2', issuer: 'International Calisthenics', year: 2021, url: '' }]),
                is_verified: true,
            },
            {
                email: 'thuy.linh@demo.com',
                full_name: 'Lê Thuỳ Linh',
                user_type: 'trainer' as const,
                avatar_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400',
                headline: 'Pilates Specialist & Fat Loss Expert',
                bio_short: 'Giúp bạn có vóc dáng thon gọn và dẻo dai.',
                bio_long: 'Linh tốt nghiệp ngành Khoa học Thể thao. Phương pháp của cô tập trung vào dinh dưỡng linh hoạt và các bài tập Pilates cải thiện tư thế.',
                specialties: ['Pilates', 'Weight Loss', 'Nutrition'],
                years_experience: 5,
                clients_trained: 300,
                success_stories: 80,
                is_verified: true,
            },
            {
                email: 'david.ng@demo.com',
                full_name: 'David Nguyễn',
                user_type: 'trainer' as const,
                avatar_url: 'https://images.unsplash.com/photo-149175235542e-00bd77c60553?auto=format&fit=crop&q=80&w=400',
                headline: 'Bodybuilding Competition Prep Coach',
                bio_short: 'Huấn luyện viên chuẩn bị thi đấu Mens Physique.',
                bio_long: 'Với kinh nghiệm đứng trên sàn đấu quốc gia, David biết chính xác điều gì cần để đạt được tỉ lệ mỡ 5% mà vẫn giữ được khối lượng cơ bắp.',
                specialties: ['Bodybuilding', 'Contest Prep', 'Hypertrophy'],
                years_experience: 10,
                clients_trained: 100,
                success_stories: 30,
                is_verified: true,
            },
            {
                email: 'nam.power@demo.com',
                full_name: 'Trần Văn Nam',
                user_type: 'trainer' as const,
                avatar_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400',
                headline: 'Elite Powerlifting Coach',
                bio_short: 'Chỉ quan tâm đến một điều: Sức mạnh tuyệt đối.',
                bio_long: 'Kỷ lục gia Squat 250kg. Nam chuyên đào tạo cho những người muốn phá vỡ giới hạn bản thân thông qua 3 bài tập cơ bản.',
                specialties: ['Powerlifting', 'Strength', 'Periodization'],
                years_experience: 8,
                clients_trained: 200,
                success_stories: 60,
                is_verified: true,
            },
            {
                email: 'nhi.zency@demo.com',
                full_name: 'Nguyễn Diệu Nhi',
                user_type: 'trainer' as const,
                avatar_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
                headline: 'Yoga for Beginners & Meditation',
                bio_short: 'Tìm lại sự cân bằng giữa thân và tâm.',
                bio_long: 'Nhi tin rằng tập luyện không chỉ là hành xác, mà là hít thở. Cô giúp dân văn phòng thoát khỏi tình trạng stress kinh niên.',
                specialties: ['Hatha Yoga', 'Meditation', 'Stress Relief'],
                years_experience: 4,
                clients_trained: 400,
                success_stories: 120,
                is_verified: true,
            }
        ];

        console.log('--- Creating Coaches ---');
        for (const c of coachesData) {
            let coach = await userRepo.findOneBy({ email: c.email });
            if (!coach) {
                coach = userRepo.create({ ...c, password: hashedPassword, is_verified: true });
                coach = await userRepo.save(coach);
                console.log(`✅ Created Coach: ${c.full_name}`);

                const program = programRepo.create({
                    trainer_id: coach.id,
                    name: `Gói tập 12 tuần: ${c.specialties[0]}`,
                    description: `Chương trình chuyên sâu về ${c.specialties.join(', ')} mang lại kết quả bền vững.`,
                    difficulty: 'intermediate',
                    price_monthly: 1200000 + (Math.random() * 800000),
                    is_published: true,
                    training_format: 'online',
                    duration_weeks: 12,
                    training_goals: [c.specialties[0], 'Tăng sức bền'],
                    included_features: ['Lịch tập cá nhân', 'Dinh dưỡng mẫu', 'Hỗ trợ 24/7']
                });
                await programRepo.save(program);
            }
        }

        // 2. Create Athletes
        const athletesData = [
            { email: 'tuan.vp@demo.com', full_name: 'Vũ Anh Tuấn', bio: 'Nhân viên IT ngồi nhiều, muốn giảm mỡ bụng.' },
            { email: 'ngoc.run@demo.com', full_name: 'Nguyễn Bảo Ngọc', bio: 'Sinh viên, mê chạy bộ marathon.' },
            { email: 'tam.cut@demo.com', full_name: 'Trần Minh Tâm', bio: 'Cựu vận động viên điền kinh.' },
            { email: 'an.yoga@demo.com', full_name: 'Lê Hoài An', bio: 'Người yêu thích lối sống lành mạnh.' },
            { email: 'hau.gym@demo.com', full_name: 'Đào Văn Hậu', bio: 'Tập gym để thay đổi ngoại hình.' }
        ];

        console.log('--- Creating Athletes ---');
        for (const a of athletesData) {
            let athlete = await userRepo.findOneBy({ email: a.email });
            if (!athlete) {
                athlete = userRepo.create({
                    ...a,
                    password: hashedPassword,
                    user_type: 'athlete',
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.full_name}&backgroundColor=b6e3f4`,
                    is_verified: true
                });
                await userRepo.save(athlete);
                console.log(`✅ Created Athlete: ${a.full_name}`);
            }
        }

        // 3. Create Gym Owners & Gyms
        const gymsData = [
            {
                owner: { email: 'tien.gym@demo.com', full_name: 'Vương Đình Tiến' },
                gym: {
                    name: 'Elite Fitness & Yoga Center',
                    tagline: 'Đẳng cấp thể hình 5 sao',
                    description: 'Phòng tập cao cấp với các trang thiết bị nhập khẩu từ Ý, khu vực xông hơi và hồ bơi vô cực.',
                    cover_image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1200'
                },
                branch: { address: 'Số 10 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', city: 'Hà Nội', district: 'Hoàn Kiếm' },
                amenities: ['Pool', 'Sauna', 'Towel Service', 'Locker Room'],
                equipment: ['Technogym Selection', 'Olympic Platforms'],
                pricing: { plan_name: 'Thẻ Kim Cương (1 Năm)', price: 15000000, billing_cycle: 'per_year' }
            },
            {
                owner: { email: 'hieu.box@demo.com', full_name: 'Bùi Công Hiếu' },
                gym: {
                    name: 'The Warehouse Boxing & MMA',
                    tagline: 'Bản lĩnh chiến binh',
                    description: 'Phòng tập thuần striking và grappling. Không gian thô mộc, tinh thần thép.',
                    cover_image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=1200'
                },
                branch: { address: '23 Cao Thắng, Quận 3, TP. Hồ Chí Minh', city: 'TP. Hồ Chí Minh', district: 'Quận 3' },
                amenities: ['Boxing Ring', 'Heavy Bags', 'Showers'],
                equipment: ['Winning Gloves', 'Fairtex Pads'],
                pricing: { plan_name: 'Gói Hội Viên MMA (Tháng)', price: 2500000, billing_cycle: 'per_month' }
            },
            {
                owner: { email: 'thao.lotus@demo.com', full_name: 'Lý Ngọc Thảo' },
                gym: {
                    name: 'Lotus Zen Yoga Studio',
                    tagline: 'Khởi đầu bình an',
                    description: 'Không gian tĩnh lặng giữa lòng thành phố cho những tâm hồn yêu Yoga.',
                    cover_image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?auto=format&fit=crop&q=80&w=1200'
                },
                branch: { address: '88 Nguyễn Đình Chiểu, Quận 1, TP. Hồ Chí Minh', city: 'TP. Hồ Chí Minh', district: 'Quận 1' },
                amenities: ['Eco Mats', 'Herbal Tea', 'Organic Candles'],
                equipment: ['Bolsters', 'Yoga Blocks'],
                pricing: { plan_name: 'Unlimited Yoga (3 Tháng)', price: 4500000, billing_cycle: 'per_quarter' }
            },
            {
                owner: { email: 'anh.iron@demo.com', full_name: 'Ngô Duy Anh' },
                gym: {
                    name: 'Iron Paradise Hardcore Gym',
                    tagline: 'Xây dựng cơ bắp thật sự',
                    description: 'Phòng tập dành cho những người nâng vật nặng. Không máy lạnh, chỉ có mồ hôi và sắt.',
                    cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200'
                },
                branch: { address: 'Khu dân cư Trung Sơn, Bình Chánh, TP. Hồ Chí Minh', city: 'TP. Hồ Chí Minh', district: 'Bình Chánh' },
                amenities: ['Chalk Permitted', 'Loud Music'],
                equipment: ['Eleiko Bars', 'Dumbbells to 80kg'],
                pricing: { plan_name: 'Gói Hardcore (Năm)', price: 6000000, billing_cycle: 'per_year' }
            },
            {
                owner: { email: 'hanh.sky@demo.com', full_name: 'Trương Mỹ Hạnh' },
                gym: {
                    name: 'Skyline Fitness Lounge',
                    tagline: 'View toàn thành phố',
                    description: 'Vừa tập luyện vừa ngắm nhìn hoàng hôn trên tầng 40.',
                    cover_image_url: 'https://images.unsplash.com/photo-1571902258032-78a167d6742c?auto=format&fit=crop&q=80&w=1200'
                },
                branch: { address: 'Tòa nhà Landmark 81, Bình Thạnh, TP. Hồ Chí Minh', city: 'TP. Hồ Chí Minh', district: 'Bình Thạnh' },
                amenities: ['Juice Bar', 'Rooftop View', 'Modern Lockers'],
                equipment: ['LifeFitness Cardio', 'Virtual Reality Cycling'],
                pricing: { plan_name: 'Thẻ Skyline Monthly', price: 3000000, billing_cycle: 'per_month' }
            }
        ];

        console.log('--- Creating Gym Owners ---');
        for (const data of gymsData) {
            let owner = await userRepo.findOneBy({ email: data.owner.email });
            if (!owner) {
                owner = userRepo.create({
                    ...data.owner,
                    password: hashedPassword,
                    user_type: 'gym_owner',
                    gym_owner_status: 'approved',
                    is_verified: true
                });
                owner = await userRepo.save(owner);
                console.log(`✅ Created Gym Owner: ${data.owner.full_name}`);

                const slug = data.gym.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
                let center = gymRepo.create({
                    ...data.gym,
                    owner_id: owner.id,
                    slug,
                    is_verified: true,
                    is_active: true
                });
                center = await gymRepo.save(center);
                console.log(`🏛️ Created Gym Center: ${center.name}`);

                let branch = branchRepo.create({
                    gym_center_id: center.id,
                    branch_name: 'Trụ sở chính',
                    ...data.branch,
                    is_active: true
                });
                branch = await branchRepo.save(branch);

                for (const am of data.amenities) {
                    await amenityRepo.save(amenityRepo.create({ branch_id: branch.id, name: am }));
                }

                for (const eq of data.equipment) {
                    await equipmentRepo.save(equipmentRepo.create({ branch_id: branch.id, name: eq, category: 'other' }));
                }

                await pricingRepo.save(pricingRepo.create({
                    branch_id: branch.id,
                    plan_name: data.pricing.plan_name,
                    description: 'Truy cập đầy đủ dịch vụ',
                    price: data.pricing.price as any,
                    billing_cycle: data.pricing.billing_cycle as any
                }));

                await galleryRepo.save(galleryRepo.create({
                    branch_id: branch.id,
                    image_url: center.cover_image_url!,
                    caption: 'Toàn cảnh phòng tập'
                }));
            }
        }

        console.log('\n✨ COMPREHENSIVE SEED COMPLETE! ✨');
        console.log('Password for all accounts: Demo@123456');

    } catch (error) {
        console.error('❌ Seed failed:', error);
    }
}
