import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { TrainerProfile } from '../entities/TrainerProfile';
import { TrainerExperience } from '../entities/TrainerExperience';
import { TrainerSkill } from '../entities/TrainerSkill';
import { TrainerPackage } from '../entities/TrainerPackage';
import { TrainerProfileHighlight } from '../entities/TrainerProfileHighlight';
import { TrainerGallery } from '../entities/TrainerGallery';
import { Testimonial } from '../entities/Testimonial';
import { BeforeAfterPhoto } from '../entities/BeforeAfterPhoto';
import { Program } from '../entities/Program';
import { GymCenter } from '../entities/GymCenter';
import { GymBranch } from '../entities/GymBranch';
import { GymAmenity } from '../entities/GymAmenity';
import { GymEquipment } from '../entities/GymEquipment';
import { GymPricing } from '../entities/GymPricing';
import { GymGallery } from '../entities/GymGallery';
import { CommunityGallery } from '../entities/CommunityGallery';
import bcrypt from 'bcryptjs';

const PASS = 'Demo@123456';

// ── Coach data ──────────────────────────────────────────────────────────────
const COACHES = [
  {
    email: 'hoang.cali@demo.com',
    full_name: 'Phan Minh Hoàng',
    slug: 'phan-minh-hoang',
    avatar_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
    bio: 'Chuyên gia Calisthenics & Street Workout với 7 năm kinh nghiệm. Master Coach tại GYMERVIET.',
    specialties: ['Calisthenics', 'Bodyweight', 'Mobility', 'Street Workout'],
    base_price_monthly: 1500000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80',
      headline: 'Calisthenics Master Coach | Street Workout Pro',
      bio_short: 'Từ vỉa hè công viên đến Master Coach — Hoàng dạy bạn chinh phục trọng lượng cơ thể.',
      bio_long: 'Hoàng bắt đầu luyện tập tại các công viên công cộng từ năm 17 tuổi, tự học qua video và thực hành mỗi ngày. Phong cách huấn luyện của anh kết hợp kỹ thuật Street Workout chuẩn quốc tế với yoga mobility, giúp học viên không chỉ mạnh mà còn dẻo dai và phòng chống chấn thương tốt. Anh đã đào tạo hơn 150 học viên, từ người mới bắt đầu đến vận động viên thi đấu.',
      years_experience: 7,
      clients_trained: 150,
      success_stories: 45,
      certifications: [
        { name: 'International Calisthenics Level 2', issuer: 'ICS Global', year: 2021 },
        { name: 'FMS Level 1 — Functional Movement Screen', issuer: 'FMS', year: 2020 },
      ],
      awards: [{ name: 'Top 3 Street Workout Vietnam Open', organization: 'Vietnam Calisthenics Federation', year: 2022 }],
      social_links: { instagram: 'https://instagram.com/hoangcali', tiktok: 'https://tiktok.com/@hoangcali' },
      languages: ['Tiếng Việt', 'English'],
      location: 'Hà Nội',
      phone: '+84 912 345 001',
      timezone: 'Asia/Ho_Chi_Minh',
      theme_color: '#1a1a2e',
      is_accepting_clients: true,
      is_featured_profile: true,
      profile_tagline: 'Sức mạnh thật sự đến từ kiểm soát cơ thể',
      hero_badges: [
        { label: 'Verified Coach', icon_key: 'shield-check' },
        { label: 'ICS Certified', icon_key: 'award' },
      ],
      key_metrics: [
        { label: 'Học viên', value: '150+' },
        { label: 'Kinh nghiệm', value: '7 năm' },
        { label: 'Tỷ lệ thành công', value: '94%' },
      ],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'Master Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2020-01-01', is_current: true, description: 'Huấn luyện cá nhân và nhóm môn Calisthenics & Mobility.' },
      { title: 'Head Trainer', organization: 'Hanoi Street Workout Club', experience_type: 'work', start_date: '2017-06-01', end_date: '2019-12-31', description: 'Xây dựng giáo trình và đào tạo 50+ thành viên CLB.' },
      { title: 'Cử nhân Giáo dục Thể chất', organization: 'Đại học TDTT Bắc Ninh', experience_type: 'education', start_date: '2013-09-01', end_date: '2017-06-01' },
      { title: 'ICS Level 2 Certification', organization: 'International Calisthenics Skills', experience_type: 'certification', start_date: '2021-03-01' },
    ],
    skills: [
      { name: 'Calisthenics', level: 98, category: 'fitness' },
      { name: 'Tay chống tĩnh (Handstand)', level: 95, category: 'fitness' },
      { name: 'Mobility & Stretching', level: 88, category: 'fitness' },
      { name: 'Lập trình tập luyện', level: 85, category: 'fitness' },
      { name: 'Phục hồi chấn thương', level: 80, category: 'fitness' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 1500000, is_popular: false, features: ['Lịch tập 3 buổi/tuần', 'Chat hỗ trợ', 'Video hướng dẫn kỹ thuật'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 3900000, is_popular: true, features: ['Lịch tập 4 buổi/tuần', 'Form check hàng tuần', 'Kế hoạch dinh dưỡng', 'Chat hỗ trợ ưu tiên', 'Video phân tích] '] },
      { name: 'Cao Cấp', duration_months: 6, sessions_per_week: 5, price: 6600000, is_popular: false, features: ['Lịch tập 5 buổi/tuần', '2 buổi offline/tháng', 'Kế hoạch cá nhân hóa hoàn toàn', 'Hỗ trợ 24/7', 'Review video kỹ thuật'] },
    ],
    highlights: [
      { title: 'Học viên', value: '150+', icon_key: 'users' },
      { title: 'Kinh nghiệm', value: '7 năm', icon_key: 'calendar' },
      { title: 'Thành công', value: '94%', icon_key: 'trophy' },
      { title: 'Chứng chỉ', value: '2 QT', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Nguyễn Văn Hùng', rating: 5, comment: 'Sau 3 tháng với Hoàng, tôi đã làm được Muscle-up đầu tiên. Phương pháp dạy rất khoa học và kiên nhẫn.', result_achieved: 'Đạt Muscle-up sau 12 tuần', is_featured: true },
      { client_name: 'Trần Minh Đức', rating: 5, comment: 'Hoàng không chỉ dạy bài tập mà còn dạy cách hiểu cơ thể. Giờ tôi tập mà không còn sợ chấn thương nữa.', result_achieved: 'Không bị chấn thương sau 6 tháng tập' },
      { client_name: 'Lê Thị Mai', rating: 5, comment: 'Mình là nữ và hay e ngại khi tập Calisthenics, nhưng Hoàng rất supportive. Progression của mình rất nhanh.', result_achieved: 'Pull-up 5 reps từ 0' },
    ],
    beforeAfter: [
      { client_name: 'Trần Văn Bình', before_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', after_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80', story: 'Bình tập được 16 tuần, từ không pull-up nổi đến 10 reps liên tiếp.', duration_weeks: 16 },
    ],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', caption: 'Buổi tập Handstand tại công viên', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a34?w=800&q=80', caption: 'Front Lever progression', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80', caption: 'Workshop Calisthenics 2023', image_type: 'event' },
      { image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', caption: 'Chứng chỉ ICS Level 2', image_type: 'certificate' },
      { image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', caption: 'Lớp học Mobility buổi sáng', image_type: 'workout' },
    ],
    programs: [
      { name: 'Calisthenics Foundation 12 Tuần', description: 'Nền tảng Calisthenics từ đầu: kỹ thuật, sức mạnh, mobility.', duration_weeks: 12, difficulty: 'beginner', price_monthly: 1500000, pricing_type: 'monthly', training_format: 'online', max_clients: 20 },
      { name: 'Advanced Skills Workshop', description: 'Handstand, Planche, Front Lever cho người đã có nền.', duration_weeks: 8, difficulty: 'advanced', price_one_time: 4000000, pricing_type: 'lump_sum', training_format: 'offline_1on1', max_clients: 5 },
    ],
  },
  {
    email: 'linh.pilates@demo.com',
    full_name: 'Lê Thuỳ Linh',
    slug: 'le-thuy-linh',
    avatar_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80',
    bio: 'Pilates & Nutrition Specialist, 5 năm giúp phụ nữ có vóc dáng thon gọn và khỏe mạnh từ bên trong.',
    specialties: ['Pilates', 'Weight Loss', 'Nutrition', 'Core Strength'],
    base_price_monthly: 1200000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80',
      headline: 'Pilates Specialist & Fat Loss Expert',
      bio_short: 'Giúp bạn có vóc dáng thon gọn và dẻo dai với Pilates & dinh dưỡng linh hoạt.',
      bio_long: 'Linh tốt nghiệp ngành Khoa học Thể thao tại Đại học TDTT TP.HCM và hoàn thành chứng chỉ Pilates Comprehensive tại Balanced Body. Phương pháp độc đáo của cô kết hợp Pilates cải thiện tư thế với kế hoạch dinh dưỡng không kiêng khem, đã giúp 300+ học viên đạt kết quả bền vững. Đặc biệt chuyên về phục hồi sau sinh và điều trị đau lưng mãn tính.',
      years_experience: 5,
      clients_trained: 300,
      success_stories: 80,
      certifications: [
        { name: 'Pilates Comprehensive', issuer: 'Balanced Body', year: 2020 },
        { name: 'Precision Nutrition Level 1', issuer: 'Precision Nutrition', year: 2021 },
      ],
      awards: [{ name: 'Best Female Trainer GYMERVIET 2023', organization: 'GYMERVIET', year: 2023 }],
      social_links: { instagram: 'https://instagram.com/minhlinhpilates', facebook: 'https://facebook.com/minhlinhfit' },
      languages: ['Tiếng Việt'],
      location: 'TP. Hồ Chí Minh',
      phone: '+84 912 345 002',
      timezone: 'Asia/Ho_Chi_Minh',
      theme_color: '#1a1a2e',
      is_accepting_clients: true,
      is_featured_profile: true,
      profile_tagline: 'Không cần kiêng khem — cần đúng phương pháp',
      hero_badges: [
        { label: 'Verified Coach', icon_key: 'shield-check' },
        { label: 'Balanced Body Certified', icon_key: 'award' },
      ],
      key_metrics: [
        { label: 'Học viên', value: '300+' },
        { label: 'Kinh nghiệm', value: '5 năm' },
        { label: 'Tỷ lệ thành công', value: '91%' },
      ],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'Pilates & Nutrition Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2021-01-01', is_current: true },
      { title: 'Pilates Instructor', organization: 'The Yoga Place Saigon', experience_type: 'work', start_date: '2019-06-01', end_date: '2020-12-31' },
      { title: 'Cử nhân Khoa học Thể thao', organization: 'Đại học TDTT TP.HCM', experience_type: 'education', start_date: '2015-09-01', end_date: '2019-06-01' },
      { title: 'Precision Nutrition L1', organization: 'Precision Nutrition Inc', experience_type: 'certification', start_date: '2021-05-01' },
    ],
    skills: [
      { name: 'Pilates Mat & Reformer', level: 95, category: 'fitness' },
      { name: 'Lập kế hoạch dinh dưỡng', level: 90, category: 'nutrition' },
      { name: 'Core Stability', level: 92, category: 'fitness' },
      { name: 'Phục hồi sau sinh', level: 85, category: 'fitness' },
      { name: 'Giảm đau lưng', level: 88, category: 'fitness' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 1200000, is_popular: false, features: ['3 buổi Pilates/tuần', 'Hướng dẫn dinh dưỡng cơ bản', 'Chat hỗ trợ thường ngày'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 3200000, is_popular: true, features: ['4 buổi/tuần', 'Kế hoạch ăn uống cá nhân hóa', 'Body check hàng tháng', 'Tư vấn 1-1 hàng tuần'] },
      { name: 'Cao Cấp', duration_months: 6, sessions_per_week: 5, price: 5800000, is_popular: false, features: ['5 buổi/tuần', '1 buổi offline/tháng', 'Reformer class', 'Toàn bộ kế hoạch ăn uống', 'Hỗ trợ 24/7'] },
    ],
    highlights: [
      { title: 'Học viên', value: '300+', icon_key: 'users' },
      { title: 'Kinh nghiệm', value: '5 năm', icon_key: 'calendar' },
      { title: 'Thành công', value: '91%', icon_key: 'trophy' },
      { title: 'Chứng chỉ', value: '2 QT', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Phạm Thị Lan', rating: 5, comment: 'Sau 3 tháng với Linh, tôi giảm 8kg mà không cảm thấy đói hay khổ sở. Phương pháp rất khoa học.', result_achieved: 'Giảm 8kg trong 12 tuần', is_featured: true },
      { client_name: 'Nguyễn Thu Hà', rating: 5, comment: 'Đau lưng mãn tính của tôi biến mất sau 6 tuần tập Pilates với Linh. Tôi không ngờ lại hiệu quả thế.', result_achieved: 'Hết đau lưng sau 6 tuần' },
      { client_name: 'Vũ Thị Bích', rating: 5, comment: 'Linh rất chu đáo và quan tâm từng học viên. Vóc dáng của mình thay đổi hoàn toàn sau 4 tháng.', result_achieved: 'Giảm 6kg, vòng eo -8cm' },
    ],
    beforeAfter: [
      { client_name: 'Trần Thị Ngọc', before_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80', after_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80', story: 'Ngọc giảm 10kg sau 16 tuần kết hợp Pilates và kế hoạch dinh dưỡng.', duration_weeks: 16 },
    ],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80', caption: 'Lớp Pilates Mat buổi sáng', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', caption: 'Tập core với Ring', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1571902258032-78a167d6742c?w=800&q=80', caption: 'Workshop Pilates & Nutrition 2023', image_type: 'event' },
      { image_url: 'https://images.unsplash.com/photo-1603418807607-b9a4ef8b5f2c?w=800&q=80', caption: 'Balanced Body Certificate', image_type: 'certificate' },
    ],
    programs: [
      { name: 'Pilates 30 Ngày Đổi Dáng', description: '30 ngày thay đổi vóc dáng với Pilates và dinh dưỡng linh hoạt.', duration_weeks: 4, difficulty: 'beginner', price_one_time: 900000, pricing_type: 'lump_sum', training_format: 'online', max_clients: 30 },
      { name: 'Core & Posture Fix', description: 'Trị đau lưng, cải thiện tư thế cho dân văn phòng trong 8 tuần.', duration_weeks: 8, difficulty: 'beginner', price_monthly: 1200000, pricing_type: 'monthly', training_format: 'online', max_clients: 20 },
    ],
  },
  {
    email: 'david.ng@demo.com', full_name: 'David Nguyễn', slug: 'david-nguyen',
    avatar_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    bio: 'Bodybuilding & Contest Prep Coach, 10 năm kinh nghiệm thi đấu thể hình chuyên nghiệp.',
    specialties: ['Bodybuilding', 'Contest Prep', 'Hypertrophy', 'Muscle Building'],
    base_price_monthly: 2500000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
      headline: 'Bodybuilding Competition Prep Coach | 10 Năm Kinh Nghiệm',
      bio_short: 'Giúp bạn xây dựng thể hình lý tưởng — từ tăng cơ cơ bản đến chuẩn bị thi đấu.',
      bio_long: 'David từng đứng trên sân khấu thi đấu Mens Physique cấp quốc gia. Với 10 năm tập luyện và 5 năm huấn luyện, anh biết chính xác những bí quyết để đưa cơ thể đến đỉnh cao. Chuyên về peak week, carb cycling, và tối ưu hóa thể hình cho thi đấu lẫn ảnh chụp.',
      years_experience: 10, clients_trained: 100, success_stories: 30,
      certifications: [{ name: 'NSCA-CSCS', issuer: 'NSCA', year: 2019 }, { name: 'ACE-CPT', issuer: 'ACE', year: 2017 }],
      awards: [{ name: 'Top 5 Mens Physique U80kg — Vietnam Nationals', organization: 'VBFF', year: 2021 }],
      social_links: { instagram: 'https://instagram.com/davidnguyenfit', youtube: 'https://youtube.com/@davidnguyenfit' },
      languages: ['Tiếng Việt', 'English'], location: 'TP. Hồ Chí Minh', phone: '+84 912 345 003',
      timezone: 'Asia/Ho_Chi_Minh', theme_color: '#1a1a2e', is_accepting_clients: true, is_featured_profile: true,
      profile_tagline: 'Thi đấu hay không — bạn xứng đáng có thể hình tốt nhất',
      hero_badges: [{ label: 'Verified Coach', icon_key: 'shield-check' }, { label: 'NSCA Certified', icon_key: 'award' }],
      key_metrics: [{ label: 'Học viên', value: '100+' }, { label: 'Kinh nghiệm', value: '10 năm' }, { label: 'Thành công', value: '90%' }],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'Head Bodybuilding Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2019-01-01', is_current: true },
      { title: 'Personal Trainer', organization: 'California Fitness Saigon', experience_type: 'work', start_date: '2015-01-01', end_date: '2018-12-31' },
      { title: 'Cử nhân KHTT', organization: 'ĐH TDTT TP.HCM', experience_type: 'education', start_date: '2011-09-01', end_date: '2015-06-01' },
      { title: 'NSCA-CSCS', organization: 'National Strength & Conditioning Assoc', experience_type: 'certification', start_date: '2019-06-01' },
    ],
    skills: [
      { name: 'Hypertrophy Training', level: 97, category: 'fitness' },
      { name: 'Contest Prep', level: 95, category: 'fitness' },
      { name: 'Carb Cycling', level: 92, category: 'nutrition' },
      { name: 'Peak Week Protocol', level: 90, category: 'fitness' },
      { name: 'Body Recomposition', level: 88, category: 'fitness' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 2500000, is_popular: false, features: ['Lịch tập tăng cơ 3 buổi/tuần', 'Tư vấn dinh dưỡng cơ bản', 'Chat hỗ trợ'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 6500000, is_popular: true, features: ['4 buổi/tuần', 'Kế hoạch dinh dưỡng chi tiết', 'Carb cycling plan', 'Check-in hàng tuần'] },
      { name: 'Contest Prep', duration_months: 6, sessions_per_week: 5, price: 12000000, is_popular: false, features: ['5 buổi/tuần', 'Peak week protocol', 'Photo shoot prep', 'Hỗ trợ 24/7', '1-1 coaching offline'] },
    ],
    highlights: [
      { title: 'Học viên', value: '100+', icon_key: 'users' }, { title: 'Kinh nghiệm', value: '10 năm', icon_key: 'calendar' },
      { title: 'Thành công', value: '90%', icon_key: 'trophy' }, { title: 'Chứng chỉ', value: '2 QT', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Võ Thanh Tú', rating: 5, comment: 'David đưa tôi từ 18% xuống 10% body fat trong 12 tuần. Kiến thức dinh dưỡng của anh cực kỳ chuyên sâu.', result_achieved: 'Giảm từ 18% xuống 10% body fat', is_featured: true },
      { client_name: 'Lê Công Vinh', rating: 5, comment: 'Chuẩn bị thi đấu lần đầu với David thật sự thay đổi cuộc đời tôi. Đoạt giải Top 5 ngay lần đầu thi.', result_achieved: 'Top 5 giải tỉnh lần đầu thi đấu' },
      { client_name: 'Nguyễn Quốc Bảo', rating: 5, comment: 'Lịch tập và diet plan của David rất chi tiết và khoa học. Tôi tăng được 5kg cơ chất sau 4 tháng.', result_achieved: 'Tăng 5kg cơ trong 4 tháng' },
    ],
    beforeAfter: [
      { client_name: 'Trần Đại Dương', before_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80', after_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', story: 'Dương thi đấu lần đầu sau 20 tuần chuẩn bị với David, đạt Top 5 hạng 75kg.', duration_weeks: 20 },
    ],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', caption: 'Buổi tập Chest Day', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', caption: 'Back training', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', caption: 'Posing practice', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', caption: 'Competition day 2021', image_type: 'event' },
    ],
    programs: [
      { name: 'Hypertrophy 16 Tuần', description: 'Tập trung tăng cơ khối lượng theo phương pháp PPL khoa học.', duration_weeks: 16, difficulty: 'intermediate', price_monthly: 2500000, pricing_type: 'monthly', training_format: 'hybrid', max_clients: 15 },
      { name: 'Contest Prep 20 Tuần', description: 'Chuẩn bị thi đấu thể hình từ nền tảng đến peak week.', duration_weeks: 20, difficulty: 'advanced', price_one_time: 15000000, pricing_type: 'lump_sum', training_format: 'offline_1on1', max_clients: 5 },
    ],
  },
  {
    email: 'nam.power@demo.com', full_name: 'Trần Văn Nam', slug: 'tran-van-nam',
    avatar_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
    bio: 'Elite Powerlifting Coach, kỷ lục gia Squat 250kg miền Bắc. Chuyên sức mạnh tuyệt đối.',
    specialties: ['Powerlifting', 'Strength Training', 'Periodization', 'Olympic Lifting'],
    base_price_monthly: 2000000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80',
      headline: 'Elite Powerlifting Coach | Squat 250kg Record Holder',
      bio_short: 'Muốn mạnh thật sự? Nam biết con đường đến squat 200kg.',
      bio_long: 'Nam giữ kỷ lục Squat 250kg hạng 93kg miền Bắc năm 2019. Với 8 năm tập luyện powerlifting và 6 năm huấn luyện, anh đã đào tạo 200+ học viên, trong đó có 10 người đạt kỷ lục tỉnh/thành. Phương pháp huấn luyện của anh dựa trên khoa học Periodization hiện đại — mọi set, rep đều có lý do cụ thể.',
      years_experience: 8, clients_trained: 200, success_stories: 60,
      certifications: [{ name: 'NSCA-CSCS', issuer: 'NSCA', year: 2018 }, { name: 'USA Powerlifting Coach', issuer: 'USAPL', year: 2020 }],
      awards: [{ name: 'Kỷ lục Squat 250kg hạng 93kg miền Bắc', organization: 'Vietnam Powerlifting Federation', year: 2019 }],
      social_links: { instagram: 'https://instagram.com/nampower_vn', facebook: 'https://facebook.com/nampower' },
      languages: ['Tiếng Việt'], location: 'Hà Nội', phone: '+84 912 345 004',
      timezone: 'Asia/Ho_Chi_Minh', theme_color: '#1a1a2e', is_accepting_clients: true, is_featured_profile: false,
      profile_tagline: 'Chỉ quan tâm đến một điều: Sức mạnh tuyệt đối',
      hero_badges: [{ label: 'Verified Coach', icon_key: 'shield-check' }, { label: 'Record Holder', icon_key: 'trophy' }],
      key_metrics: [{ label: 'Học viên', value: '200+' }, { label: 'Kinh nghiệm', value: '8 năm' }, { label: 'Kỷ lục', value: 'Squat 250kg' }],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'Strength & Powerlifting Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2018-01-01', is_current: true },
      { title: 'Head Coach', organization: 'Hanoi Barbell Club', experience_type: 'work', start_date: '2015-01-01', end_date: '2017-12-31' },
      { title: 'Cử nhân GDTC', organization: 'Đại học TDTT Bắc Ninh', experience_type: 'education', start_date: '2011-09-01', end_date: '2015-06-01' },
      { title: 'Kỷ lục Squat 250kg — Miền Bắc', organization: 'Vietnam Powerlifting Federation', experience_type: 'achievement', start_date: '2019-11-01' },
    ],
    skills: [
      { name: 'Powerlifting (Big 3)', level: 99, category: 'fitness' },
      { name: 'Program Periodization', level: 96, category: 'fitness' },
      { name: 'Kỹ thuật Squat', level: 98, category: 'fitness' },
      { name: 'Kỹ thuật Deadlift', level: 97, category: 'fitness' },
      { name: 'Meet Day Strategy', level: 93, category: 'fitness' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 2000000, is_popular: false, features: ['Lịch tập Big 3', 'Kỹ thuật cơ bản', 'Chat hỗ trợ'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 5500000, is_popular: true, features: ['Periodization block 12 tuần', 'Video form check', 'Kế hoạch dinh dưỡng', 'Chat ưu tiên'] },
      { name: 'Thi Đấu', duration_months: 6, sessions_per_week: 5, price: 10000000, is_popular: false, features: ['Peak + Taper protocol', 'Meet prep coaching', '1-1 offline', 'Attempt selection', 'Hỗ trợ 24/7'] },
    ],
    highlights: [
      { title: 'Học viên', value: '200+', icon_key: 'users' }, { title: 'Kinh nghiệm', value: '8 năm', icon_key: 'calendar' },
      { title: 'Tốt nhất', value: 'Squat 250kg', icon_key: 'trophy' }, { title: 'Chứng chỉ', value: '2 QT', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Hoàng Đức Mạnh', rating: 5, comment: 'Nam đưa Squat của tôi từ 100kg lên 160kg trong 6 tháng. Kỹ thuật và chương trình của anh cực kỳ chính xác.', result_achieved: 'Tăng Squat từ 100 lên 160kg', is_featured: true },
      { client_name: 'Bùi Minh Tuấn', rating: 5, comment: 'Chuẩn bị thi đấu với Nam rất chuyên nghiệp. Tôi đạt Top 3 giải tỉnh ngay năm đầu thi.', result_achieved: 'Top 3 giải tỉnh năm đầu thi' },
    ],
    beforeAfter: [
      { client_name: 'Đinh Xuân Long', before_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80', after_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80', story: 'Long tăng tổng 3 bài từ 300kg lên 450kg sau 24 tuần.', duration_weeks: 24 },
    ],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', caption: 'Squat heavy set 220kg', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', caption: 'Deadlift training block', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', caption: 'Vietnam Powerlifting Meet 2022', image_type: 'event' },
    ],
    programs: [
      { name: 'Strength Base 12 Tuần', description: 'Xây dựng nền tảng sức mạnh với Big 3 — dành cho người mới.', duration_weeks: 12, difficulty: 'beginner', price_monthly: 2000000, pricing_type: 'monthly', training_format: 'online', max_clients: 15 },
      { name: 'Powerlifting Peaking 8 Tuần', description: 'Chuẩn bị thi đấu với block peak + taper chuyên nghiệp.', duration_weeks: 8, difficulty: 'advanced', price_one_time: 8000000, pricing_type: 'lump_sum', training_format: 'offline_1on1', max_clients: 5 },
    ],
  },
  {
    email: 'nhi.yoga@demo.com', full_name: 'Nguyễn Diệu Nhi', slug: 'nguyen-dieu-nhi',
    avatar_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    bio: 'Yoga & Meditation Instructor RYT-500, giúp bạn tìm lại cân bằng thân-tâm giữa cuộc sống hối hả.',
    specialties: ['Hatha Yoga', 'Vinyasa', 'Meditation', 'Stress Relief', 'Pranayama'],
    base_price_monthly: 1000000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=1200&q=80',
      headline: 'Yoga & Meditation Teacher RYT-500 | Tìm Lại Cân Bằng',
      bio_short: 'Tập luyện không chỉ là hành xác — là hít thở, là cân bằng.',
      bio_long: 'Nhi hoàn thành khóa RYT-500 tại Rishikesh, Ấn Độ sau 3 năm tu tập. Cô tin rằng mỗi người đều cần một hình thức thiền định phù hợp riêng. Học viên của cô đến từ dân văn phòng bị burnout đến vận động viên cần phục hồi. Nhi đã giúp 400+ người tìm lại trạng thái bình an trong cuộc sống hiện đại.',
      years_experience: 4, clients_trained: 400, success_stories: 120,
      certifications: [{ name: 'RYT-500 Yoga Alliance', issuer: 'Yoga Alliance', year: 2022 }, { name: 'Mindfulness-Based Stress Reduction', issuer: 'UMass Medical', year: 2023 }],
      awards: [{ name: 'Best Wellness Coach Q3/2023', organization: 'GYMERVIET', year: 2023 }],
      social_links: { instagram: 'https://instagram.com/nhiyoga_vn', tiktok: 'https://tiktok.com/@nhiyoga' },
      languages: ['Tiếng Việt', 'English'], location: 'TP. Hồ Chí Minh', phone: '+84 912 345 005',
      timezone: 'Asia/Ho_Chi_Minh', theme_color: '#1a1a2e', is_accepting_clients: true, is_featured_profile: true,
      profile_tagline: 'Tìm lại sự cân bằng giữa thân và tâm',
      hero_badges: [{ label: 'Verified Coach', icon_key: 'shield-check' }, { label: 'RYT-500', icon_key: 'award' }],
      key_metrics: [{ label: 'Học viên', value: '400+' }, { label: 'Kinh nghiệm', value: '4 năm' }, { label: 'Thành công', value: '96%' }],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'Yoga & Meditation Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2022-01-01', is_current: true },
      { title: 'Yoga Instructor', organization: 'Lotus Zen Yoga Studio', experience_type: 'work', start_date: '2020-01-01', end_date: '2021-12-31' },
      { title: 'RYT-500 Training', organization: 'Rishikesh Yoga Peeth, Ấn Độ', experience_type: 'education', start_date: '2021-06-01', end_date: '2022-01-01' },
      { title: 'MBSR Certification', organization: 'UMass Medical Center', experience_type: 'certification', start_date: '2023-03-01' },
    ],
    skills: [
      { name: 'Hatha & Vinyasa Yoga', level: 96, category: 'fitness' },
      { name: 'Thiền định (Meditation)', level: 94, category: 'mindset' },
      { name: 'Pranayama (Hơi thở)', level: 92, category: 'mindset' },
      { name: 'Yin Yoga', level: 90, category: 'fitness' },
      { name: 'Stress Management', level: 93, category: 'mindset' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 1000000, is_popular: false, features: ['3 buổi yoga/tuần', 'Guided meditation audio', 'Chat hỗ trợ'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 2700000, is_popular: true, features: ['4 buổi/tuần', 'Thiền định hướng dẫn', 'Bài tập thở cá nhân hóa', 'Tư vấn stress 1-1'] },
      { name: 'Cao Cấp', duration_months: 6, sessions_per_week: 5, price: 5000000, is_popular: false, features: ['5 buổi/tuần', '1 buổi retreat cuối tháng', 'Toàn bộ chương trình mindfulness', 'Hỗ trợ 24/7'] },
    ],
    highlights: [
      { title: 'Học viên', value: '400+', icon_key: 'users' }, { title: 'Kinh nghiệm', value: '4 năm', icon_key: 'calendar' },
      { title: 'Thành công', value: '96%', icon_key: 'trophy' }, { title: 'Chứng chỉ', value: 'RYT-500', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Phan Thị Hồng', rating: 5, comment: 'Nhi giúp tôi thoát khỏi tình trạng burnout sau 2 năm làm việc căng thẳng. Nay tôi ngủ ngon và không còn lo lắng quá mức.', result_achieved: 'Hết mất ngủ sau 4 tuần', is_featured: true },
      { client_name: 'Vũ Hoàng Long', rating: 5, comment: 'Tưởng yoga chỉ dành cho phụ nữ, nhưng sau 2 tháng với Nhi, lưng của tôi đỡ đau hẳn và tinh thần tốt hơn nhiều.', result_achieved: 'Hết đau lưng, cải thiện giấc ngủ' },
    ],
    beforeAfter: [],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=800&q=80', caption: 'Lớp Hatha Yoga buổi sáng', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', caption: 'Thiền định ngoài trời', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', caption: 'Vinyasa flow tại studio', image_type: 'workout' },
    ],
    programs: [
      { name: 'Yoga 30 Ngày Cho Người Mới', description: 'Yoga buổi sáng 30-45 phút, cải thiện tinh thần và linh hoạt.', duration_weeks: 4, difficulty: 'beginner', price_one_time: 700000, pricing_type: 'lump_sum', training_format: 'online', max_clients: 50 },
      { name: 'Mindfulness & Stress Relief', description: 'Chương trình giảm stress dành cho dân văn phòng, kết hợp yoga và thiền.', duration_weeks: 8, difficulty: 'beginner', price_monthly: 1000000, pricing_type: 'monthly', training_format: 'online', max_clients: 25 },
    ],
  },
  {
    email: 'huong.crossfit@demo.com', full_name: 'Mai Thị Hương', slug: 'mai-thi-huong',
    avatar_url: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400&q=80',
    bio: 'CrossFit Level 2 Trainer & HIIT Specialist. 6 năm giúp mọi người vượt qua giới hạn bản thân.',
    specialties: ['CrossFit', 'HIIT', 'Functional Fitness', 'Olympic Weightlifting'],
    base_price_monthly: 1800000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80',
      headline: 'CrossFit L2 Trainer | Functional Fitness Expert',
      bio_short: 'Cứng cáp hơn mỗi ngày — cả thể chất lẫn tinh thần.',
      bio_long: 'Hương bắt đầu CrossFit sau chấn thương chạy bộ năm 2017 và yêu nó từ buổi đầu tiên. Sau khi hoàn thành CrossFit Level 2 Training Certificate, cô bắt đầu đào tạo và đã xây dựng cộng đồng 200+ học viên yêu CrossFit tại TP.HCM. Cô chuyên về Functional Fitness cho người mới và Olympic Weightlifting nâng cao.',
      years_experience: 6, clients_trained: 200, success_stories: 55,
      certifications: [{ name: 'CrossFit Level 2 Training Certificate', issuer: 'CrossFit Inc', year: 2021 }, { name: 'NSCA-CPT', issuer: 'NSCA', year: 2020 }],
      awards: [{ name: 'Open Vietnam Region Top 10%', organization: 'CrossFit Open', year: 2022 }],
      social_links: { instagram: 'https://instagram.com/huongcrossfit', tiktok: 'https://tiktok.com/@huongcrossfit' },
      languages: ['Tiếng Việt', 'English'], location: 'TP. Hồ Chí Minh', phone: '+84 912 345 006',
      timezone: 'Asia/Ho_Chi_Minh', theme_color: '#1a1a2e', is_accepting_clients: true, is_featured_profile: false,
      profile_tagline: 'Vượt giới hạn mỗi ngày — từng buổi một',
      hero_badges: [{ label: 'Verified Coach', icon_key: 'shield-check' }, { label: 'CrossFit L2', icon_key: 'award' }],
      key_metrics: [{ label: 'Học viên', value: '200+' }, { label: 'Kinh nghiệm', value: '6 năm' }, { label: 'Thành công', value: '88%' }],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'CrossFit & Functional Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2021-01-01', is_current: true },
      { title: 'Head Coach', organization: 'CrossFit Saigon Box', experience_type: 'work', start_date: '2018-06-01', end_date: '2020-12-31' },
      { title: 'CrossFit L2 Training', organization: 'CrossFit Inc', experience_type: 'certification', start_date: '2021-03-01' },
    ],
    skills: [
      { name: 'CrossFit WODs', level: 95, category: 'fitness' },
      { name: 'Olympic Weightlifting', level: 90, category: 'fitness' },
      { name: 'HIIT Programming', level: 92, category: 'fitness' },
      { name: 'Gymnastics Movement', level: 85, category: 'fitness' },
      { name: 'Endurance Conditioning', level: 88, category: 'fitness' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 1800000, is_popular: false, features: ['3 WODs/tuần', 'Kỹ thuật cơ bản', 'Chat hỗ trợ'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 4800000, is_popular: true, features: ['4 WODs/tuần', 'Olympic lifting coaching', 'Benchmark tracking', 'Video review'] },
      { name: 'Cao Cấp', duration_months: 6, sessions_per_week: 5, price: 9000000, is_popular: false, features: ['5 buổi/tuần', 'Open prep', '1-1 coaching', 'Nutrition guidance', 'Hỗ trợ 24/7'] },
    ],
    highlights: [
      { title: 'Học viên', value: '200+', icon_key: 'users' }, { title: 'Kinh nghiệm', value: '6 năm', icon_key: 'calendar' },
      { title: 'Thành công', value: '88%', icon_key: 'trophy' }, { title: 'Chứng chỉ', value: 'CF L2', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Đặng Thị Thu', rating: 5, comment: 'Hương rất tuyệt! Tôi từ người không kéo xà được lần nào, sau 3 tháng đã kéo được 5 reps liên tiếp.', result_achieved: 'Pull-up 5 reps từ zero', is_featured: true },
      { client_name: 'Ngô Quang Tùng', rating: 5, comment: 'CrossFit với Hương rất vui và hiệu quả. Tôi giảm 5kg và thể lực tốt hơn hẳn chỉ sau 2 tháng.', result_achieved: 'Giảm 5kg, tăng thể lực rõ rệt' },
    ],
    beforeAfter: [],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', caption: 'WOD buổi sáng tại box', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a34?w=800&q=80', caption: 'Clean & Jerk technique', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80', caption: 'CrossFit Open 2022', image_type: 'event' },
    ],
    programs: [
      { name: 'CrossFit Foundations', description: 'Làm quen CrossFit an toàn: kỹ thuật, movements cơ bản, WOD đầu tiên.', duration_weeks: 6, difficulty: 'beginner', price_one_time: 2500000, pricing_type: 'lump_sum', training_format: 'offline_group', max_clients: 12 },
      { name: 'HIIT Burn — Đốt Mỡ Cực Mạnh', description: 'HIIT 5 buổi/tuần, đốt 600 kcal/buổi, giảm cân nhanh.', duration_weeks: 8, difficulty: 'intermediate', price_monthly: 1800000, pricing_type: 'monthly', training_format: 'offline_group', max_clients: 15 },
    ],
  },
  {
    email: 'huy.running@demo.com', full_name: 'Bùi Quang Huy', slug: 'bui-quang-huy',
    avatar_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&q=80',
    bio: 'Running Coach & Endurance Specialist. Sub-3 hour marathoner đào tạo 100+ runner hoàn thành first marathon.',
    specialties: ['Running', 'Marathon', 'Endurance', 'Triathlon', 'Trail Running'],
    base_price_monthly: 1400000,
    profile: {
      cover_image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&q=80',
      headline: 'Marathon Running Coach | Sub-3hr Finisher',
      bio_short: 'Từ 5km đến Full Marathon — Huy đồng hành cùng bạn từng bước.',
      bio_long: 'Huy chạy full marathon sub-3 giờ năm 2020 sau 3 năm tập luyện và đã quyết định chuyển sang huấn luyện để chia sẻ đam mê. Anh đã dẫn dắt 100+ người hoàn thành Half Marathon và Full Marathon đầu tiên của họ. Phương pháp của anh dựa trên khoa học tim mạch và phòng chống chấn thương, phù hợp với người bận rộn.',
      years_experience: 5, clients_trained: 120, success_stories: 40,
      certifications: [{ name: 'RRCA Certified Running Coach', issuer: 'Road Runners Club of America', year: 2021 }, { name: 'Athletics Coach Level 1', issuer: 'Vietnam Athletics Federation', year: 2020 }],
      awards: [{ name: 'Sub-3 Finisher — Vietnam Marathon 2020', organization: 'Vietnam Runner', year: 2020 }],
      social_links: { instagram: 'https://instagram.com/buiquanghuy_run', strava: 'https://strava.com/athletes/huybui' },
      languages: ['Tiếng Việt', 'English'], location: 'Hà Nội', phone: '+84 912 345 007',
      timezone: 'Asia/Ho_Chi_Minh', theme_color: '#1a1a2e', is_accepting_clients: true, is_featured_profile: false,
      profile_tagline: 'Mỗi bước chân là một câu chuyện — hãy để tôi viết cùng bạn',
      hero_badges: [{ label: 'Verified Coach', icon_key: 'shield-check' }, { label: 'RRCA Certified', icon_key: 'award' }],
      key_metrics: [{ label: 'Runner', value: '120+' }, { label: 'Kinh nghiệm', value: '5 năm' }, { label: 'FM Finishers', value: '40+' }],
      section_order: ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact'],
    },
    experience: [
      { title: 'Running & Endurance Coach', organization: 'GYMERVIET', experience_type: 'work', start_date: '2020-01-01', is_current: true },
      { title: 'Running Club Leader', organization: 'Hanoi Runners Club', experience_type: 'work', start_date: '2018-01-01', end_date: '2019-12-31' },
      { title: 'RRCA Running Coach Certification', organization: 'Road Runners Club of America', experience_type: 'certification', start_date: '2021-01-01' },
      { title: 'Sub-3 Marathon — Vietnam Marathon', organization: 'Vietnam Runner', experience_type: 'achievement', start_date: '2020-10-01' },
    ],
    skills: [
      { name: 'Marathon Training', level: 95, category: 'fitness' },
      { name: 'Interval & Tempo Running', level: 92, category: 'fitness' },
      { name: 'Running Form Analysis', level: 90, category: 'fitness' },
      { name: 'Injury Prevention', level: 88, category: 'fitness' },
      { name: 'Triathlon Prep', level: 82, category: 'fitness' },
    ],
    packages: [
      { name: 'Cơ Bản', duration_months: 1, sessions_per_week: 3, price: 1400000, is_popular: false, features: ['Lịch chạy 3 buổi/tuần', 'Hướng dẫn form chạy', 'Chat hỗ trợ'] },
      { name: 'Tiêu Chuẩn', duration_months: 3, sessions_per_week: 4, price: 3800000, is_popular: true, features: ['4 buổi/tuần', 'GPS data analysis', 'Interval training plan', 'Race strategy'] },
      { name: 'Cao Cấp', duration_months: 6, sessions_per_week: 5, price: 7200000, is_popular: false, features: ['5 buổi/tuần', 'Full marathon prep', 'Nutrition for endurance', '1-1 coaching', 'Hỗ trợ 24/7'] },
    ],
    highlights: [
      { title: 'Runners', value: '120+', icon_key: 'users' }, { title: 'Kinh nghiệm', value: '5 năm', icon_key: 'calendar' },
      { title: 'FM Finishers', value: '40+', icon_key: 'trophy' }, { title: 'Best Time', value: 'Sub-3h', icon_key: 'award' },
    ],
    testimonials: [
      { client_name: 'Trần Thanh Hà', rating: 5, comment: 'Hoàn thành Full Marathon đầu tiên trong 4h30 — điều tôi nghĩ mình không bao giờ làm được. Huy là nguồn động lực tuyệt vời!', result_achieved: 'FM đầu tiên 4h30', is_featured: true },
      { client_name: 'Nguyễn Hữu Thắng', rating: 5, comment: 'Sau 3 tháng training với Huy, pace 5K của tôi cải thiện từ 7:00/km xuống 5:30/km.', result_achieved: 'Cải thiện pace 5K từ 7:00 xuống 5:30' },
    ],
    beforeAfter: [],
    gallery: [
      { image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80', caption: 'Buổi chạy long run cuối tuần', image_type: 'workout' },
      { image_url: 'https://images.unsplash.com/photo-1542748707-0d5d7b5b4e4a?w=800&q=80', caption: 'Vietnam Marathon 2020 — Sub-3h', image_type: 'event' },
      { image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', caption: 'Track interval session', image_type: 'workout' },
    ],
    programs: [
      { name: 'From Zero to 5K', description: 'Hoàn thành 5K đầu tiên trong 8 tuần, dành cho người chưa bao giờ chạy.', duration_weeks: 8, difficulty: 'beginner', price_one_time: 1200000, pricing_type: 'lump_sum', training_format: 'online', max_clients: 30 },
      { name: 'Half Marathon Prep', description: 'Chuẩn bị Half Marathon 21km trong 12 tuần cho runner đã chạy 5-10km.', duration_weeks: 12, difficulty: 'intermediate', price_monthly: 1400000, pricing_type: 'monthly', training_format: 'online', max_clients: 20 },
    ],
  },
];

// ── Athletes ──────────────────────────────────────────────────────────────────
const ATHLETES = [
  { email: 'tuan.vp@demo.com', full_name: 'Vũ Anh Tuấn', slug: 'vu-anh-tuan', avatar_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80', bio: 'Lập trình viên 28 tuổi, ngồi nhiều, mục tiêu giảm mỡ bụng.', height_cm: 170, current_weight_kg: 78, experience_level: 'beginner', specialties: ['Gym tổng hợp', 'Giảm cân'], profile: { bio_long: 'Tuấn làm software engineer 9-5 tại Hà Nội. 2 năm ngồi máy tính khiến cân nặng tăng 12kg. Mục tiêu 2026: giảm 10kg và duy trì lối sống lành mạnh.', social_links: { facebook: 'https://facebook.com/vat' }, location: 'Hà Nội' }, experience: [{ title: 'Hoàn thành 30-day workout challenge', organization: 'Self-training', experience_type: 'achievement', start_date: '2025-06-01' }], gallery: [{ image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', caption: 'Bắt đầu hành trình', image_type: 'workout' }] },
  { email: 'ngoc.run@demo.com', full_name: 'Nguyễn Bảo Ngọc', slug: 'nguyen-bao-ngoc', avatar_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80', bio: 'Runner đam mê, 3 Half Marathon, hướng tới Full Marathon đầu tiên.', height_cm: 162, current_weight_kg: 52, experience_level: 'intermediate', specialties: ['Running', 'Marathon', 'Endurance'], profile: { bio_long: 'Ngọc bắt đầu chạy bộ từ năm nhất đại học. Hoàn thành Half Marathon đầu tiên 2h25 tại Hanoi Marathon 2024. Mục tiêu: Sub-2h Half và Full Marathon 2026.', social_links: { instagram: 'https://instagram.com/ngocrun' }, location: 'TP. Hồ Chí Minh' }, experience: [{ title: 'Hanoi Marathon — 21km 2h25', organization: 'Vietnam Runner', experience_type: 'achievement', start_date: '2024-10-15' }, { title: 'HCMC Marathon — 2h15 PR', organization: 'Vietnam Runner', experience_type: 'achievement', start_date: '2025-01-12' }], gallery: [{ image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80', caption: 'Hanoi Marathon 2024', image_type: 'event' }] },
  { email: 'tam.cut@demo.com', full_name: 'Trần Minh Tâm', slug: 'tran-minh-tam', avatar_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80', bio: 'Cựu vận động viên điền kinh 400m, đang chuyển sang powerlifting.', height_cm: 178, current_weight_kg: 82, experience_level: 'advanced', specialties: ['Powerlifting', 'Athletics', 'Strength'], profile: { bio_long: 'Tâm từng thi đấu điền kinh 400m cho đội tuyển quốc gia 2018-2021. Hiện Squat 160kg / Bench 100kg / Dead 190kg. Mục tiêu: Squat 200kg tại giải toàn quốc 2026.', social_links: { instagram: 'https://instagram.com/tampower' }, location: 'Hà Nội' }, experience: [{ title: 'VĐV Điền kinh 400m — Đội tuyển QG', organization: 'Vietnam Athletics', experience_type: 'work', start_date: '2018-01-01', end_date: '2021-12-31' }, { title: 'Squat 160kg PR', organization: 'Self', experience_type: 'achievement', start_date: '2025-03-01' }], gallery: [{ image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', caption: 'Squat 155kg session', image_type: 'workout' }] },
  { email: 'an.yoga@demo.com', full_name: 'Lê Hoài An', slug: 'le-hoai-an', avatar_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=400&q=80', bio: 'Yoga 3 năm, đang học thiền định và Ayurveda.', height_cm: 158, current_weight_kg: 50, experience_level: 'intermediate', specialties: ['Yoga', 'Wellness', 'Meditation'], profile: { bio_long: 'An bắt đầu yoga sau burnout vì công việc marketing. 3 năm sau yoga thay đổi hoàn toàn cuộc sống. Đang học Ayurveda và muốn trở thành instructor.', social_links: { instagram: 'https://instagram.com/anhoaian_yoga' }, location: 'TP. Hồ Chí Minh' }, experience: [{ title: 'Vipassana 10 ngày im lặng', organization: 'Dhamma Mahima', experience_type: 'achievement', start_date: '2024-08-01' }], gallery: [{ image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', caption: 'Morning yoga routine', image_type: 'workout' }] },
  { email: 'hau.gym@demo.com', full_name: 'Đào Văn Hậu', slug: 'dao-van-hau', avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', bio: 'Gym 2 năm, mục tiêu Men\'s Physique amateur 2026.', height_cm: 175, current_weight_kg: 74, experience_level: 'intermediate', specialties: ['Bodybuilding', 'Physique', 'Hypertrophy'], profile: { bio_long: 'Hậu bắt đầu gym để cải thiện ngoại hình. 2 năm sau tăng 8kg cơ và giảm 4% body fat. Mục tiêu: leo sân khấu Men\'s Physique amateur 2026.', social_links: { instagram: 'https://instagram.com/hauvandao_physique' }, location: 'TP. Hồ Chí Minh' }, experience: [{ title: 'Body Transformation — +8kg cơ, -4% BF', organization: 'Self', experience_type: 'achievement', start_date: '2024-12-01' }], gallery: [{ image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', caption: 'Leg day heavy', image_type: 'workout' }] },
  { email: 'khoa.demo@demo.com', full_name: 'Khoa Vũ', slug: 'khoa-vu-nguyen-dong', avatar_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', bio: 'CrossFit 5 năm, Top 15% Vietnam Region. C&J 100kg.', height_cm: 176, current_weight_kg: 80, experience_level: 'advanced', specialties: ['CrossFit', 'Olympic Lifting', 'Gymnastics'], profile: { bio_long: 'Khoa tập CrossFit từ 2020. 5 năm sau tham gia Open 3 lần, xếp Top 15% Vietnam Region. C&J 100kg / Snatch 85kg. Mục tiêu: Top 10% Open 2026.', social_links: { instagram: 'https://instagram.com/khoavucf' }, location: 'Hà Nội' }, experience: [{ title: 'Top 15% Vietnam Region — Open 2025', organization: 'CrossFit Open', experience_type: 'achievement', start_date: '2025-03-01' }, { title: 'C&J 100kg PR', organization: 'Self', experience_type: 'achievement', start_date: '2025-01-15' }], gallery: [{ image_url: 'https://images.unsplash.com/photo-1538805066729-81dc23a6eded?w=800&q=80', caption: 'Open WOD 25.1', image_type: 'event' }] },
];

// ── Gyms ──────────────────────────────────────────────────────────────────────
const GYMS = [
  { owner: { email: 'tien.elite@demo.com', full_name: 'Vương Đình Tiến' }, gym: { name: 'Elite Fitness & Yoga Center', tagline: 'Đẳng cấp thể hình 5 sao', description: 'Phòng tập cao cấp với thiết bị nhập khẩu từ Ý, khu xông hơi và hồ bơi vô cực.', cover_image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80', founded_year: 2018, total_area_sqm: 2000, highlights: ['Hồ bơi vô cực', 'Xông hơi cao cấp'] }, branch: { address: 'Số 10 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', city: 'Hà Nội', district: 'Hoàn Kiếm' }, amenities: ['Pool', 'Sauna', 'Locker Room', 'Café Bar'], equipment: ['Technogym Selection', 'Olympic Platforms'], pricing: { plan_name: 'Thẻ Kim Cương 1 Năm', price: 15000000, billing_cycle: 'per_year' }, gallery: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80' },
  { owner: { email: 'hieu.warehouse@demo.com', full_name: 'Bùi Công Hiếu' }, gym: { name: 'The Warehouse Boxing MMA', tagline: 'Bản lĩnh chiến binh', description: 'Phòng tập thuần striking và grappling. Không gian thô mộc, tinh thần thép.', cover_image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1200&q=80', founded_year: 2020, total_area_sqm: 800, highlights: ['Boxing Ring chuẩn', 'Grappling mat 200m2'] }, branch: { address: '23 Cao Thắng, Quận 3, TP. Hồ Chí Minh', city: 'TP. Hồ Chí Minh', district: 'Quận 3' }, amenities: ['Boxing Ring', 'MMA Cage', 'Showers'], equipment: ['Winning Gloves', 'Fairtex Pads'], pricing: { plan_name: 'Tháng MMA', price: 2500000, billing_cycle: 'per_month' }, gallery: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80' },
  { owner: { email: 'thao.lotus@demo.com', full_name: 'Lý Ngọc Thảo' }, gym: { name: 'Lotus Zen Yoga Studio', tagline: 'Khởi đầu bình an', description: 'Không gian tĩnh lặng giữa lòng thành phố cho những tâm hồn yêu Yoga và thiền.', cover_image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=1200&q=80', founded_year: 2019, total_area_sqm: 400, highlights: ['Studio yên tĩnh', 'Trà thảo mộc miễn phí'] }, branch: { address: '88 Nguyễn Đình Chiểu, Quận 1, TP. Hồ Chí Minh', city: 'TP. Hồ Chí Minh', district: 'Quận 1' }, amenities: ['Eco Mats', 'Herbal Tea', 'Meditation Room'], equipment: ['Reformer Machines', 'Yoga Props'], pricing: { plan_name: 'Unlimited Yoga 3 Tháng', price: 4500000, billing_cycle: 'per_quarter' }, gallery: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=800&q=80' },
];

const COMMUNITY_PHOTOS = [
  { image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', caption: 'Handstand at the park 🤸', category: 'workout' },
  { image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', caption: 'Late night grind 💪', category: 'workout' },
  { image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80', caption: 'Morning run at 5AM 🌅', category: 'lifestyle' },
  { image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80', caption: 'Pilates Reformer session', category: 'workout' },
  { image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80', caption: 'Elite Fitness — new gear', category: 'gym_space' },
  { image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=800&q=80', caption: 'Sunset rooftop yoga 🧘', category: 'lifestyle' },
  { image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', caption: 'Deadlift PR day 🏆', category: 'workout' },
  { image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', caption: 'CrossFit community WOD', category: 'event' },
  { image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80', caption: 'Boxing workshop', category: 'event' },
  { image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', caption: 'Transformation week 12 ✨', category: 'transformation' },
];

// ── Main Seed ─────────────────────────────────────────────────────────────────
export async function fullSeed() {
  console.log('🌱 Starting Full Seed...');
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(TrainerProfile);
  const expRepo = AppDataSource.getRepository(TrainerExperience);
  const skillRepo = AppDataSource.getRepository(TrainerSkill);
  const pkgRepo = AppDataSource.getRepository(TrainerPackage);
  const highlightRepo = AppDataSource.getRepository(TrainerProfileHighlight);
  const galleryRepo = AppDataSource.getRepository(TrainerGallery);
  const testimonialRepo = AppDataSource.getRepository(Testimonial);
  const beforeAfterRepo = AppDataSource.getRepository(BeforeAfterPhoto);
  const programRepo = AppDataSource.getRepository(Program);
  const gymRepo = AppDataSource.getRepository(GymCenter);
  const branchRepo = AppDataSource.getRepository(GymBranch);
  const amenityRepo = AppDataSource.getRepository(GymAmenity);
  const equipmentRepo = AppDataSource.getRepository(GymEquipment);
  const pricingRepo = AppDataSource.getRepository(GymPricing);
  const gymGalleryRepo = AppDataSource.getRepository(GymGallery);
  const communityRepo = AppDataSource.getRepository(CommunityGallery);
  const hashed = await bcrypt.hash(PASS, 10);

  // Admin
  let admin = await userRepo.findOneBy({ email: 'admin@gymerviet.com' });
  if (!admin) {
    admin = await userRepo.save(userRepo.create({
      email: 'admin@gymerviet.com', full_name: 'GYMERVIET Admin', password: hashed,
      user_type: 'admin', is_verified: true, is_email_verified: true, onboarding_completed: true,
    }));
  }

  // Coaches
  console.log('\n👔 Creating Coaches...');
  for (const c of COACHES) {
    let user = await userRepo.findOneBy({ email: c.email });
    if (!user) {
      user = await userRepo.save(userRepo.create({
        email: c.email, full_name: c.full_name, password: hashed, user_type: 'trainer',
        avatar_url: c.avatar_url, bio: c.bio, specialties: c.specialties,
        base_price_monthly: c.base_price_monthly as any, slug: c.slug,
        is_verified: true, is_email_verified: true, onboarding_completed: true,
      }));
      console.log(`  ✅ ${c.full_name}`);
    }
    if (!(await profileRepo.findOneBy({ trainer_id: user.id }))) {
      await profileRepo.save(profileRepo.create({ trainer_id: user.id, slug: c.slug, is_profile_public: true, profile_template: 'hero', ...c.profile } as any));
    }
    if (!(await expRepo.countBy({ trainer_id: user.id }))) {
      for (const e of c.experience) {
        await expRepo.save(expRepo.create({
          trainer_id: user.id, ...e,
          start_date: new Date(e.start_date) as any,
          end_date: (e as any).end_date ? new Date((e as any).end_date) as any : undefined,
          is_current: (e as any).is_current ?? false,
        } as any));
      }
    }
    if (!(await skillRepo.countBy({ trainer_id: user.id }))) {
      for (let i = 0; i < c.skills.length; i++) {
        await skillRepo.save(skillRepo.create({ trainer_id: user.id, ...c.skills[i], order_number: i } as any));
      }
    }
    if (!(await pkgRepo.countBy({ trainer_id: user.id }))) {
      for (let i = 0; i < c.packages.length; i++) {
        await pkgRepo.save(pkgRepo.create({ trainer_id: user.id, ...c.packages[i], order_number: i }));
      }
    }
    if (!(await highlightRepo.countBy({ trainer_id: user.id }))) {
      for (let i = 0; i < c.highlights.length; i++) {
        await highlightRepo.save(highlightRepo.create({ trainer_id: user.id, ...c.highlights[i], order_number: i }));
      }
    }
    if (!(await galleryRepo.countBy({ trainer_id: user.id }))) {
      for (let i = 0; i < c.gallery.length; i++) {
        await galleryRepo.save(galleryRepo.create({ trainer_id: user.id, ...c.gallery[i], order_number: i } as any));
      }
    }
    if (!(await testimonialRepo.countBy({ trainer_id: user.id }))) {
      for (const t of c.testimonials) {
        await testimonialRepo.save(testimonialRepo.create({
          trainer_id: user.id, client_name: t.client_name, comment: t.comment,
          rating: t.rating, result_achieved: t.result_achieved || null,
          is_featured: (t as any).is_featured || false, is_approved: true,
        }));
      }
    }
    if (!(await beforeAfterRepo.countBy({ trainer_id: user.id }))) {
      for (const ba of c.beforeAfter) {
        await beforeAfterRepo.save(beforeAfterRepo.create({ trainer_id: user.id, ...ba, is_approved: true }));
      }
    }
    if (!(await programRepo.countBy({ trainer_id: user.id }))) {
      for (const p of c.programs) {
        await programRepo.save(programRepo.create({
          trainer_id: user.id, ...p, is_published: true,
          equipment_needed: [], training_goals: [c.specialties[0]],
        } as any));
      }
    }
  }

  // Athletes
  console.log('\n🏃 Creating Athletes...');
  for (const a of ATHLETES) {
    let user = await userRepo.findOneBy({ email: a.email });
    if (!user) {
      user = await userRepo.save(userRepo.create({
        email: a.email, full_name: a.full_name, password: hashed, user_type: 'athlete',
        avatar_url: a.avatar_url, bio: a.bio, height_cm: a.height_cm,
        current_weight_kg: a.current_weight_kg as any, experience_level: a.experience_level,
        specialties: a.specialties, slug: a.slug,
        is_verified: true, is_email_verified: true, onboarding_completed: true,
      }));
      console.log(`  ✅ ${a.full_name}`);
    }
    if (!(await profileRepo.findOneBy({ trainer_id: user.id }))) {
      await profileRepo.save(profileRepo.create({
        trainer_id: user.id, slug: a.slug, is_profile_public: true,
        bio_long: a.profile.bio_long, social_links: a.profile.social_links as any,
        location: a.profile.location, profile_template: 'card',
      }));
    }
    if (!(await expRepo.countBy({ trainer_id: user.id }))) {
      for (const e of a.experience) {
        await expRepo.save(expRepo.create({
          trainer_id: user.id, ...e,
          start_date: new Date(e.start_date) as any,
          end_date: (e as any).end_date ? new Date((e as any).end_date) as any : undefined,
          is_current: false,
        } as any));
      }
    }
    if (!(await galleryRepo.countBy({ trainer_id: user.id }))) {
      for (let i = 0; i < a.gallery.length; i++) {
        await galleryRepo.save(galleryRepo.create({ trainer_id: user.id, ...a.gallery[i], order_number: i } as any));
      }
    }
  }

  // Gyms
  console.log('\n🏛️ Creating Gyms...');
  for (const g of GYMS) {
    let owner = await userRepo.findOneBy({ email: g.owner.email });
    if (!owner) {
      owner = await userRepo.save(userRepo.create({
        email: g.owner.email, full_name: g.owner.full_name, password: hashed,
        user_type: 'gym_owner', gym_owner_status: 'approved' as any,
        is_verified: true, is_email_verified: true, onboarding_completed: true,
      }));
    }
    if (!(await gymRepo.findOneBy({ name: g.gym.name, owner_id: owner.id }))) {
      const slug = g.gym.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50) + '-' + Date.now();
      const center = await gymRepo.save(gymRepo.create({ owner_id: owner.id, slug, logo_url: g.gym.cover_image_url, is_verified: true, is_active: true, ...g.gym } as any)) as unknown as GymCenter;
      const branch = await branchRepo.save(branchRepo.create({ gym_center_id: center.id, branch_name: 'Trụ sở chính', is_active: true, ...g.branch } as any)) as unknown as GymBranch;
      for (const am of g.amenities) await amenityRepo.save(amenityRepo.create({ branch_id: branch.id, name: am } as any));
      for (const eq of g.equipment) await equipmentRepo.save(equipmentRepo.create({ branch_id: branch.id, name: eq, category: 'other' } as any));
      await pricingRepo.save(pricingRepo.create({ branch_id: branch.id, plan_name: g.pricing.plan_name, description: 'Full access', price: g.pricing.price as any, billing_cycle: g.pricing.billing_cycle as any }));
      await gymGalleryRepo.save(gymGalleryRepo.create({ branch_id: branch.id, image_url: g.gallery, caption: 'Toàn cảnh phòng tập' } as any));
      console.log(`  ✅ ${g.gym.name}`);
    }
  }

  // Community Gallery
  console.log('\n🖼️ Creating Community Gallery...');
  if (!(await communityRepo.count())) {
    for (let i = 0; i < COMMUNITY_PHOTOS.length; i++) {
      const p = COMMUNITY_PHOTOS[i];
      await communityRepo.save(communityRepo.create({
        image_url: p.image_url, caption: p.caption, category: p.category as any,
        source: 'admin_upload', uploaded_by: admin.id,
        is_featured: i < 5, order_number: i, is_active: true,
      }));
    }
    console.log(`  ✅ ${COMMUNITY_PHOTOS.length} community photos`);
  }

  console.log('\n✨ Full Seed completed!');
  console.log(`  Coaches: ${COACHES.length} | Athletes: ${ATHLETES.length} | Gyms: ${GYMS.length}`);
  console.log('  🔑 Password for all demo accounts: Demo@123456');
}

if (require.main === module) {
  fullSeed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
