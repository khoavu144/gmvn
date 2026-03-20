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
import { GymTaxonomyTerm } from '../entities/GymTaxonomyTerm';
import { GymCenterTaxonomyTerm } from '../entities/GymCenterTaxonomyTerm';
import { GymZone } from '../entities/GymZone';
import { GymProgram as GymMarketplaceProgram } from '../entities/GymProgram';
import { GymProgramSession } from '../entities/GymProgramSession';
import { GymLeadRoute } from '../entities/GymLeadRoute';
import { GymReview } from '../entities/GymReview';
import { GymTrainerLink } from '../entities/GymTrainerLink';
import { CommunityGallery } from '../entities/CommunityGallery';
import { generateSlug } from '../utils/slugify';
import bcrypt from 'bcryptjs';

const PASS = 'Demo@123456';

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
const GYMS: any[] = [
  {
    owner: { email: 'an.forge@demo.com', full_name: 'Nguyễn Hoài An' },
    taxonomy: ['gym', 'beginner', 'strength', 'functional', 'community_driven', 'open_floor', 'energetic'],
    gym: {
      name: 'Forge House Gym District 7',
      tagline: 'Phòng gym hàng ngày cho người muốn tập đều và tập đúng',
      description: 'Một mainstream gym được build cho nhịp tập thực tế: rack đủ nhiều, cardio đủ thoáng, coach đủ sát để người mới không bị ngợp nhưng người tập lâu năm vẫn thấy đáng tiền.',
      cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
      founded_year: 2021,
      total_area_sqm: 1100,
      total_equipment_count: 148,
      highlights: ['Free-weight floor 2 tầng', 'Cardio deck tách tiếng ồn', 'Mở cửa từ 05:30'],
      primary_venue_type_slug: 'gym',
      positioning_tier: 'mid',
      beginner_friendly: true,
      women_friendly: true,
      athlete_friendly: true,
      recovery_focused: false,
      discovery_blurb: 'Một venue dễ vào cho người mới nhưng đủ rack và coach floor để người tập nghiêm túc vẫn muốn quay lại nhiều buổi mỗi tuần.',
      hero_value_props: ['6 half rack Rogue', 'Assessment miễn phí buổi đầu', 'Parking dễ'],
      profile_completeness_score: 95,
      response_sla_text: 'Phản hồi trong 20 phút',
      default_primary_cta: 'visit_booking',
      default_secondary_cta: 'consultation',
      featured_weight: 76,
    },
    branch: {
      branch_name: 'Sunrise branch',
      address: '12 Nguyễn Lương Bằng, Quận 7, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 7',
      latitude: 10.7297,
      longitude: 106.7219,
      description: 'Chi nhánh thiên về tập hàng ngày: đủ chỗ squat, đủ máy cardio, không gian sáng và ít drama giờ cao điểm hơn mặt bằng chung.',
      opening_hours: buildSchedule('05:30', '22:30', { open: '06:00', close: '22:00' }, { open: '07:00', close: '20:00' }),
      neighborhood_label: 'Phú Mỹ Hưng access',
      parking_summary: 'Hầm giữ xe 2 giờ miễn phí cho hội viên',
      locker_summary: 'Locker day-use miễn phí, mang khoá riêng hoặc mượn tại lễ tân',
      shower_summary: '6 buồng tắm nước nóng, tách riêng nam nữ',
      towel_service_summary: 'Thuê khăn 15.000₫ hoặc dùng khăn gói tháng',
      crowd_level_summary: 'Đông nhất 18:00–20:00, rack vẫn xoay khá nhanh',
      best_visit_time_summary: 'Yên nhất 09:30–11:30 và sau 20:15',
      accessibility_summary: 'Có ramp, thang máy và toilet rộng cho xe lăn',
      women_only_summary: 'Không women-only nhưng khu squat và dumbbell thoáng, dễ quan sát',
      child_friendly_summary: 'Không có khu trông trẻ chuyên dụng',
      check_in_instructions: 'Báo tên + số điện thoại tại quầy, scan QR và nhận tour 3 phút nếu là lần đầu.',
      branch_tagline: 'Tập nặng nhưng không ngợp',
      whatsapp_number: '+84901234001',
      messenger_url: 'https://m.me/forgehousegym',
      consultation_phone: '+84901234001',
      branch_status_badges: ['Coach floor', 'Easy parking', 'Beginner safe'],
    },
    amenities: [
      { name: 'Locker room', is_available: true, note: 'Tủ khoá day-use' },
      { name: 'Shower', is_available: true, note: 'Nước nóng suốt ngày' },
      { name: 'Recovery corner', is_available: true, note: 'Foam roller và massage gun dùng chung' },
      { name: 'Parking', is_available: true, note: 'Hầm gửi xe chung toà nhà' },
    ],
    equipment: [
      { category: 'strength', name: 'Half rack', quantity: 6, brand: 'Rogue', is_available: true },
      { category: 'free_weight', name: 'Dumbbell set 2–42kg', quantity: 1, brand: 'Jordan', is_available: true },
      { category: 'cardio', name: 'AirBike', quantity: 4, brand: 'Assault', is_available: true },
      { category: 'functional', name: 'Cable tower', quantity: 2, brand: 'Torque', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Day Pass',
        price: 120000,
        billing_cycle: 'per_day',
        description: 'Dành cho người muốn thử không gian trước khi chốt gói.',
        plan_type: 'drop_in',
        access_scope: 'single_branch',
        included_services: ['Open gym', 'Locker room'],
        highlighted_reason: 'Buổi test ít rủi ro nhất',
        order_number: 0,
      },
      {
        plan_name: 'Monthly Open Gym',
        price: 890000,
        billing_cycle: 'per_month',
        description: 'Điểm vào tốt cho người mới bắt đầu tập đều 3–4 buổi mỗi tuần.',
        is_highlighted: true,
        plan_type: 'membership',
        access_scope: 'single_branch',
        included_services: ['Open gym', 'Shower', '2 buổi assessment'],
        trial_available: true,
        trial_price: 99000,
        freeze_policy_summary: 'Freeze 1 lần tối đa 30 ngày',
        cancellation_policy_summary: 'Báo trước 7 ngày',
        highlighted_reason: 'Điểm vào tốt nhất cho người mới',
        order_number: 1,
      },
      {
        plan_name: 'PT Starter 6 buổi',
        price: 2100000,
        billing_cycle: 'per_session',
        description: '6 buổi 1-1 để sửa form squat, hinge và machine basics.',
        plan_type: 'private_pt',
        access_scope: 'single_branch',
        included_services: ['6 buổi PT', 'InBody', 'Form check video'],
        session_count: 6,
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
        caption: 'Hero view nhìn toàn bộ strength floor',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        is_featured: true,
        orientation: 'landscape',
        alt_text: 'Toàn cảnh strength floor tại Forge House Gym District 7',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1400&q=80',
        caption: 'Dumbbell lane và mirror line',
        image_type: 'equipment',
        media_role: 'equipment_detail',
        orientation: 'landscape',
        alt_text: 'Khu dumbbell và mirror line của Forge House',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1400&q=80',
        caption: 'Conditioning class giờ trưa',
        image_type: 'class',
        media_role: 'class_in_action',
        orientation: 'landscape',
        alt_text: 'Lớp conditioning đang diễn ra tại Forge House',
      },
    ],
    zones: [
      {
        zone_type: 'free_weight_zone',
        name: 'Iron floor',
        description: '6 rack, platform deadlift và bench line đặt tách nhịp với cable zone.',
        capacity: 28,
        area_sqm: 260,
        sound_profile: 'energetic',
        natural_light_score: 4,
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'cardio_floor',
        name: 'Cardio deck',
        description: 'Máy chạy, AirBike và rower nhìn ra mặt tiền nên ít bí.',
        capacity: 18,
        area_sqm: 150,
        sound_profile: 'ambient_music',
        natural_light_score: 5,
        sort_order: 1,
      },
      {
        zone_type: 'functional_zone',
        name: 'Move studio',
        description: 'Sàn cỏ, sled lane và rig cho nhóm nhỏ hoặc assessment.',
        capacity: 14,
        area_sqm: 110,
        booking_required: true,
        sound_profile: 'instructor_led',
        sort_order: 2,
      },
    ],
    trainers: [
      {
        email: 'david.ng@demo.com',
        role_at_gym: 'Strength coach',
        specialization_summary: 'Strength onboarding, body recomposition và machine basics',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'David chạy assessment cho hội viên mới và build lộ trình 8 tuần đầu.',
        languages: ['Tiếng Việt', 'English'],
        visible_order: 0,
      },
      {
        email: 'hoang.cali@demo.com',
        role_at_gym: 'Movement coach',
        specialization_summary: 'Mobility, pull-up progression và bodyweight foundations',
        accepts_private_clients: true,
        branch_intro: 'Hoàng phụ trách mobility opener và buổi lunch-break conditioning.',
        languages: ['Tiếng Việt', 'English'],
        visible_order: 1,
      },
    ],
    programs: [
      {
        title: 'Strength Foundation 60',
        program_type: 'strength',
        level: 'beginner',
        description: 'Lớp nhập môn squat, hinge, press cho người tập dưới 6 tháng.',
        duration_minutes: 60,
        capacity: 12,
        equipment_required: ['Barbell', 'Bench'],
        booking_mode: 'pre_booking',
        trainer_email: 'david.ng@demo.com',
        zone_name: 'Iron floor',
        sessions: [
          { starts_at: '2026-04-02T18:30:00+07:00', ends_at: '2026-04-02T19:30:00+07:00', seats_total: 12, seats_remaining: 5, session_note: 'Buổi tối cho người đi làm' },
          { starts_at: '2026-04-04T10:00:00+07:00', ends_at: '2026-04-04T11:00:00+07:00', seats_total: 12, seats_remaining: 7, session_note: 'Cuối tuần ít đông hơn' },
        ],
      },
      {
        title: 'Lunch Break Conditioning',
        program_type: 'hiit',
        level: 'all',
        description: '45 phút đổ mồ hôi vừa đủ để vẫn quay lại bàn làm việc được.',
        duration_minutes: 45,
        capacity: 14,
        equipment_required: ['Sled', 'Kettlebell'],
        booking_mode: 'pre_booking',
        trainer_email: 'hoang.cali@demo.com',
        zone_name: 'Move studio',
        sessions: [
          { starts_at: '2026-04-03T12:15:00+07:00', ends_at: '2026-04-03T13:00:00+07:00', seats_total: 14, seats_remaining: 6, session_note: 'Mang khăn riêng nếu cần' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'visit_booking',
        primary_channel: 'whatsapp',
        fallback_channel: 'phone',
        whatsapp: '+84901234001',
        phone: '+84901234001',
        auto_prefill_message: 'Xin chào Forge House, tôi muốn book tour buổi đầu ở Sunrise branch.',
      },
      {
        inquiry_type: 'consultation',
        primary_channel: 'phone',
        fallback_channel: 'whatsapp',
        phone: '+84901234001',
        whatsapp: '+84901234001',
        auto_prefill_message: 'Tôi muốn được tư vấn gói Monthly Open Gym + assessment.',
      },
    ],
    reviews: [
      {
        athlete_email: 'tuan.vp@demo.com',
        rating: 5,
        equipment_rating: 5,
        cleanliness_rating: 4,
        coaching_rating: 5,
        atmosphere_rating: 4,
        value_rating: 5,
        crowd_rating: 3,
        visit_type: 'member',
        is_verified_visit: true,
        comment: 'Điểm mạnh là rack không bị tranh nhau quá khủng và coach floor rất chịu sửa form cho người mới.',
        reply_text: 'Cảm ơn Tuấn. Team đã giữ thêm khung giờ assessment buổi sáng đúng như feedback của bạn.',
      },
      {
        athlete_email: 'hau.gym@demo.com',
        rating: 4,
        equipment_rating: 4,
        cleanliness_rating: 4,
        coaching_rating: 4,
        atmosphere_rating: 4,
        value_rating: 5,
        crowd_rating: 3,
        visit_type: 'drop_in',
        is_verified_visit: true,
        comment: 'Free-weight zone chắc tay, đủ cho buổi push/pull nghiêm túc. Giá day pass hợp lý.',
      },
    ],
  },
  {
    owner: { email: 'minh.iron@demo.com', full_name: 'Trần Quang Minh' },
    taxonomy: ['gym', 'athlete', 'strength', 'hardcore', 'open_floor', 'energetic'],
    gym: {
      name: 'Northside Iron Club',
      tagline: 'Một mainstream gym thiên về lực và kỹ thuật hơn là ánh đèn selfie',
      description: 'Không gian strength-first với platform rõ ràng, rack chắc tay và nhịp vận hành hợp cho người theo powerbuilding hoặc muốn nâng kỹ thuật compound.',
      cover_image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1400&q=80',
      founded_year: 2020,
      total_area_sqm: 980,
      total_equipment_count: 124,
      highlights: ['Eleiko platform', 'Competition bench', 'Ít ồn hơn giờ cao điểm'],
      primary_venue_type_slug: 'gym',
      positioning_tier: 'mid',
      beginner_friendly: false,
      women_friendly: true,
      athlete_friendly: true,
      discovery_blurb: 'Nếu bạn quan tâm cảm giác cây đòn và khoảng trống để tập kỹ thuật nghiêm túc, đây là một lựa chọn đáng thử ở phía Bắc Hà Nội.',
      hero_value_props: ['Platform chuẩn giải phong trào', 'Coach technique day', 'Không gian tập trung'],
      profile_completeness_score: 93,
      response_sla_text: 'Phản hồi trong 30 phút',
      default_primary_cta: 'consultation',
      default_secondary_cta: 'visit_booking',
      featured_weight: 58,
    },
    branch: {
      branch_name: 'Flagship Ba Đình',
      address: '49 Đội Cấn, Ba Đình, Hà Nội',
      city: 'Hà Nội',
      district: 'Ba Đình',
      latitude: 21.0351,
      longitude: 105.8238,
      description: 'Một chi nhánh thiên về kỹ thuật và sức mạnh, ít lớp đông nhưng có zone platform rất rõ chức năng.',
      opening_hours: buildSchedule('06:00', '22:00', { open: '07:00', close: '21:00' }, { open: '08:00', close: '19:00' }),
      neighborhood_label: 'Ba Đình, gần hồ Giảng Võ',
      parking_summary: 'Gửi xe dưới tầng hầm, xe máy 5.000₫/lượt',
      locker_summary: 'Locker rộng cho belt, shoes và chalk bag',
      shower_summary: '4 phòng tắm, vệ sinh khá ổn vào cuối ngày',
      towel_service_summary: 'Không có khăn miễn phí',
      crowd_level_summary: 'Đông lúc 17:30–19:30 nhưng platform vẫn có line rõ ràng',
      best_visit_time_summary: 'Tốt nhất 07:30–09:00 hoặc 14:00–16:00',
      accessibility_summary: 'Có thang máy, lối vào hơi dốc với xe lăn',
      women_only_summary: 'Không có women-only, nhưng coach floor hỗ trợ tốt cho người mới vào khu tạ tự do',
      child_friendly_summary: 'Không phù hợp cho trẻ nhỏ đi cùng',
      check_in_instructions: 'Đi thẳng quầy tầng 2, khai báo first-time visit để được giới thiệu platform etiquette.',
      branch_tagline: 'Kỹ thuật trước, ego sau',
      whatsapp_number: '+84901234002',
      messenger_url: 'https://m.me/northsideironclub',
      consultation_phone: '+84901234002',
      branch_status_badges: ['Platform focus', 'Athlete crowd', 'Technique day'],
    },
    amenities: [
      { name: 'Platform area', is_available: true, note: 'Có line chờ và giờ kỹ thuật riêng' },
      { name: 'Chalk station', is_available: true, note: 'Chalk block dùng chung' },
      { name: 'Showers', is_available: true, note: '4 phòng, sạch vừa đủ' },
      { name: 'Café corner', is_available: false, note: 'Chưa có quầy đồ uống' },
    ],
    equipment: [
      { category: 'strength', name: 'Competition combo rack', quantity: 2, brand: 'Eleiko', is_available: true },
      { category: 'strength', name: 'Deadlift platform', quantity: 4, brand: 'Eleiko', is_available: true },
      { category: 'cardio', name: 'SkiErg', quantity: 3, brand: 'Concept2', is_available: true },
      { category: 'functional', name: 'Reverse hyper', quantity: 1, brand: 'Westside', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Day Pass',
        price: 150000,
        billing_cycle: 'per_day',
        description: 'Dành cho người muốn test platform và nhịp venue.',
        plan_type: 'drop_in',
        access_scope: 'single_branch',
        included_services: ['Open gym', 'Platform area'],
        order_number: 0,
      },
      {
        plan_name: 'Monthly Strength Access',
        price: 990000,
        billing_cycle: 'per_month',
        description: 'Full access cho open gym + buổi technique clinic cuối tuần.',
        is_highlighted: true,
        plan_type: 'membership',
        access_scope: 'single_branch',
        included_services: ['Open gym', 'Technique clinic', 'Locker room'],
        freeze_policy_summary: 'Freeze 1 lần / 21 ngày',
        highlighted_reason: 'Hợp nhất cho người tập strength đều đặn',
        order_number: 1,
      },
      {
        plan_name: 'Technique Reset 4 buổi',
        price: 1800000,
        billing_cycle: 'per_session',
        description: '4 buổi sửa squat, bench, deadlift và set-up platform.',
        plan_type: 'private_pt',
        access_scope: 'single_branch',
        included_services: ['4 buổi PT', 'Video feedback'],
        session_count: 4,
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1400&q=80',
        caption: 'Platform room nhìn thẳng từ lối vào',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        orientation: 'landscape',
        alt_text: 'Phòng platform tại Northside Iron Club',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1400&q=80',
        caption: 'Bench line và warm-up bench',
        image_type: 'equipment',
        media_role: 'equipment_detail',
        orientation: 'landscape',
        alt_text: 'Khu bench và warm-up bench tại Northside Iron Club',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80',
        caption: 'Technique clinic buổi chiều',
        image_type: 'class',
        media_role: 'class_in_action',
        orientation: 'landscape',
        alt_text: 'Buổi technique clinic tại Northside Iron Club',
      },
    ],
    zones: [
      {
        zone_type: 'strength_floor',
        name: 'Platform room',
        description: 'Combo rack, deadlift platform và plate tree xếp line rất gọn.',
        capacity: 20,
        area_sqm: 240,
        sound_profile: 'energetic',
        natural_light_score: 3,
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'free_weight_zone',
        name: 'Heavy dumbbell lane',
        description: 'Lane tách riêng để không cắt luồng platform.',
        capacity: 14,
        area_sqm: 120,
        sound_profile: 'ambient_music',
        sort_order: 1,
      },
      {
        zone_type: 'functional_zone',
        name: 'Reset lane',
        description: 'Khu reverse hyper, sled và prehab work.',
        capacity: 8,
        area_sqm: 70,
        booking_required: true,
        sound_profile: 'silent',
        sort_order: 2,
      },
    ],
    trainers: [
      {
        email: 'nam.power@demo.com',
        role_at_gym: 'Power coach',
        specialization_summary: 'Powerlifting technique, peaking và return-to-bar confidence',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'Nam phụ trách clinic cho người muốn tập bài bản với squat, bench, deadlift.',
        languages: ['Tiếng Việt'],
        visible_order: 0,
      },
      {
        email: 'david.ng@demo.com',
        role_at_gym: 'Hypertrophy consultant',
        specialization_summary: 'Strength + hypertrophy block cho người muốn vừa mạnh vừa đẹp form',
        accepts_private_clients: true,
        branch_intro: 'David xuất hiện trong các buổi block design và tư vấn body recomposition.',
        languages: ['Tiếng Việt', 'English'],
        visible_order: 1,
      },
    ],
    programs: [
      {
        title: 'Powerlifting Lab',
        program_type: 'strength',
        level: 'intermediate',
        description: 'Nhóm nhỏ cho người đã biết tập nhưng muốn nâng kỹ thuật thi đấu.',
        duration_minutes: 75,
        capacity: 10,
        equipment_required: ['Belt', 'Flat shoes'],
        booking_mode: 'pre_booking',
        trainer_email: 'nam.power@demo.com',
        zone_name: 'Platform room',
        sessions: [
          { starts_at: '2026-04-01T19:00:00+07:00', ends_at: '2026-04-01T20:15:00+07:00', seats_total: 10, seats_remaining: 3, session_note: 'Openers + top set review' },
          { starts_at: '2026-04-05T09:30:00+07:00', ends_at: '2026-04-05T10:45:00+07:00', seats_total: 10, seats_remaining: 4, session_note: 'Form check cuối tuần' },
        ],
      },
      {
        title: 'Technique Reset',
        program_type: 'mobility',
        level: 'all',
        description: 'Buổi ngắn để sửa bracing, set-up và warm-up sequence.',
        duration_minutes: 45,
        capacity: 8,
        equipment_required: ['Mini band'],
        booking_mode: 'pre_booking',
        trainer_email: 'david.ng@demo.com',
        zone_name: 'Reset lane',
        sessions: [
          { starts_at: '2026-04-03T17:45:00+07:00', ends_at: '2026-04-03T18:30:00+07:00', seats_total: 8, seats_remaining: 2, session_note: 'Pre-lift mobility' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'consultation',
        primary_channel: 'phone',
        fallback_channel: 'whatsapp',
        phone: '+84901234002',
        whatsapp: '+84901234002',
        auto_prefill_message: 'Tôi muốn được tư vấn gói Monthly Strength Access ở Northside Iron Club.',
      },
      {
        inquiry_type: 'visit_booking',
        primary_channel: 'whatsapp',
        fallback_channel: 'phone',
        whatsapp: '+84901234002',
        phone: '+84901234002',
        auto_prefill_message: 'Tôi muốn book buổi day pass để test platform room.',
      },
    ],
    reviews: [
      {
        athlete_email: 'tam.cut@demo.com',
        rating: 5,
        equipment_rating: 5,
        cleanliness_rating: 4,
        coaching_rating: 5,
        atmosphere_rating: 4,
        value_rating: 4,
        crowd_rating: 3,
        visit_type: 'member',
        is_verified_visit: true,
        comment: 'Không gian strength-focused rất rõ. Platform đủ chắc và coach sửa từng cue nhỏ rất kỹ.',
      },
      {
        athlete_email: 'khoa.demo@demo.com',
        rating: 4,
        equipment_rating: 4,
        cleanliness_rating: 4,
        coaching_rating: 4,
        atmosphere_rating: 4,
        value_rating: 4,
        crowd_rating: 3,
        visit_type: 'drop_in',
        is_verified_visit: true,
        comment: 'Venue hợp cho người cần tập trung vào lift chính. Không quá màu mè nhưng đúng việc.',
      },
    ],
  },
  {
    owner: { email: 'tien.elite@demo.com', full_name: 'Vương Đình Tiến' },
    taxonomy: ['fitness_club', 'family', 'cardio', 'swimming', 'premium', 'class_based', 'social'],
    gym: {
      name: 'Elite Fitness & Yoga Center',
      tagline: 'Một fitness club premium để vừa tập vừa sống chậm đúng mức',
      description: 'Một club thiên về trải nghiệm tổng thể: cardio thoáng, hồ bơi đẹp, recovery suite và nhịp dịch vụ ổn định cho người muốn đi tập như một nghi thức hàng ngày.',
      cover_image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1400&q=80',
      founded_year: 2018,
      total_area_sqm: 2000,
      total_equipment_count: 210,
      highlights: ['Hồ bơi vô cực', 'Sauna & steam', 'Studio group class riêng'],
      primary_venue_type_slug: 'fitness_club',
      positioning_tier: 'premium',
      beginner_friendly: true,
      women_friendly: true,
      family_friendly: true,
      athlete_friendly: false,
      recovery_focused: true,
      discovery_blurb: 'Đây là loại venue dành cho người muốn ghé đều, tắm rửa tử tế và biến việc tập thành một phần dễ chịu của lịch sống.',
      hero_value_props: ['Pool + sauna', 'All-club feel', 'Towel service'],
      profile_completeness_score: 96,
      response_sla_text: 'Phản hồi trong 15 phút',
      default_primary_cta: 'membership',
      default_secondary_cta: 'visit_booking',
      featured_weight: 88,
    },
    branch: {
      branch_name: 'Hoàn Kiếm club',
      address: 'Số 10 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
      city: 'Hà Nội',
      district: 'Hoàn Kiếm',
      latitude: 21.0255,
      longitude: 105.8524,
      description: 'Club phù hợp cho lịch tập công sở cao cấp: vào tập, bơi, xông hơi rồi quay lại nhịp sống mà không phải nghĩ nhiều.',
      opening_hours: buildSchedule('05:30', '22:00', { open: '06:00', close: '21:30' }, { open: '06:00', close: '21:00' }),
      neighborhood_label: 'Lõi trung tâm, gần hồ Hoàn Kiếm',
      parking_summary: 'Có valet cho ô tô và hầm riêng cho xe máy',
      locker_summary: 'Locker cố định theo tháng hoặc day-use premium',
      shower_summary: 'Phòng thay đồ và shower lớn, vệ sinh liên tục',
      towel_service_summary: 'Khăn tập và khăn tắm miễn phí',
      crowd_level_summary: 'Đông giờ sau công sở nhưng cardio vẫn thoáng hơn khu free-weight',
      best_visit_time_summary: 'Lý tưởng 06:30–08:30 hoặc 13:30–16:30',
      accessibility_summary: 'Thang máy rộng, lối đi sạch và dễ định hướng',
      women_only_summary: 'Không women-only, nhưng có studio class yên tĩnh và locker đủ riêng tư',
      child_friendly_summary: 'Có kids corner theo khung giờ cuối tuần',
      check_in_instructions: 'Check-in bằng QR ở cổng turnstile, first visit sẽ được concierge đưa tour nhanh.',
      branch_tagline: 'Đến để tập, ở lại vì service',
      whatsapp_number: '+84901234003',
      messenger_url: 'https://m.me/elitefitnessyoga',
      consultation_phone: '+84901234003',
      branch_status_badges: ['Premium service', 'Pool access', 'Towel included'],
    },
    amenities: [
      { name: 'Infinity pool', is_available: true, note: 'Mở theo giờ club' },
      { name: 'Sauna & steam', is_available: true, note: 'Nam nữ riêng' },
      { name: 'Kids corner', is_available: true, note: 'Cuối tuần có staff' },
      { name: 'Café bar', is_available: true, note: 'Protein shake và light meals' },
    ],
    equipment: [
      { category: 'cardio', name: 'Treadmill', quantity: 14, brand: 'Technogym', is_available: true },
      { category: 'strength', name: 'Selectorized line', quantity: 18, brand: 'Technogym', is_available: true },
      { category: 'recovery', name: 'Sauna suite', quantity: 2, brand: 'Custom', is_available: true },
      { category: 'pool', name: 'Lap pool lane', quantity: 4, brand: 'Custom', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Guest Pass',
        price: 350000,
        billing_cycle: 'per_day',
        description: 'Một ngày full access để test cardio, pool và locker experience.',
        plan_type: 'drop_in',
        access_scope: 'single_branch',
        included_services: ['Gym floor', 'Pool', 'Sauna', 'Towel'],
        order_number: 0,
      },
      {
        plan_name: 'Monthly Club Access',
        price: 1890000,
        billing_cycle: 'per_month',
        description: 'Full access cho người làm việc quanh trung tâm và muốn đi đều 4–5 buổi/tuần.',
        is_highlighted: true,
        plan_type: 'membership',
        access_scope: 'all_branches',
        included_services: ['Gym floor', 'Pool', 'Sauna', 'Towel', '2 guest pass/tháng'],
        freeze_policy_summary: 'Freeze 1 lần tối đa 30 ngày',
        supports_multi_branch: true,
        highlighted_reason: 'Cân bằng tốt nhất giữa service và giá vào',
        order_number: 1,
      },
      {
        plan_name: 'Annual Diamond',
        price: 15800000,
        billing_cycle: 'per_year',
        description: 'Gói all-club với ưu tiên class booking và concierge hỗ trợ.',
        plan_type: 'membership',
        access_scope: 'all_branches',
        included_services: ['All branches', 'Priority booking', 'Parking support'],
        supports_multi_branch: true,
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1400&q=80',
        caption: 'Hero view nhìn xuống cardio lounge',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        is_featured: true,
        orientation: 'landscape',
        alt_text: 'Cardio lounge tại Elite Fitness & Yoga Center',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=80',
        caption: 'Studio class và reformer line',
        image_type: 'class',
        media_role: 'class_in_action',
        orientation: 'landscape',
        alt_text: 'Studio class tại Elite Fitness & Yoga Center',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80',
        caption: 'Recovery suite sau buổi tập',
        image_type: 'pool',
        media_role: 'recovery',
        orientation: 'landscape',
        alt_text: 'Khu recovery và pool tại Elite Fitness & Yoga Center',
      },
    ],
    zones: [
      {
        zone_type: 'cardio_floor',
        name: 'Cardio lounge',
        description: 'Treadmill line nhìn ra mặt phố, không quá bí và ít chói.',
        capacity: 26,
        area_sqm: 220,
        sound_profile: 'ambient_music',
        natural_light_score: 5,
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'pool_zone',
        name: 'Pool deck',
        description: 'Lane bơi ngắn nhưng đủ cho active recovery và cardio nhẹ.',
        capacity: 18,
        area_sqm: 180,
        temperature_mode: 'ambient',
        sound_profile: 'silent',
        sort_order: 1,
      },
      {
        zone_type: 'recovery_zone',
        name: 'Recovery suite',
        description: 'Sauna, steam và ghế nghỉ yên tĩnh sau buổi tập.',
        capacity: 10,
        area_sqm: 80,
        temperature_mode: 'heated',
        sound_profile: 'silent',
        sort_order: 2,
      },
    ],
    trainers: [
      {
        email: 'linh.pilates@demo.com',
        role_at_gym: 'Mind-body specialist',
        specialization_summary: 'Pilates, posture và core dành cho hội viên công sở',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'Linh chạy các buổi core restore và posture reset vào giờ trưa.',
        languages: ['Tiếng Việt'],
        visible_order: 0,
      },
      {
        email: 'david.ng@demo.com',
        role_at_gym: 'Performance consultant',
        specialization_summary: 'Hypertrophy block cho hội viên muốn nâng chất lượng body composition',
        accepts_private_clients: true,
        branch_intro: 'David xuất hiện theo slot tư vấn 1-1 và movement screening.',
        languages: ['Tiếng Việt', 'English'],
        visible_order: 1,
      },
    ],
    programs: [
      {
        title: 'Core Restore Lunch Club',
        program_type: 'pilates',
        level: 'all',
        description: 'Lớp 45 phút giúp giải toả lưng và lấy lại nhịp sau buổi sáng ngồi nhiều.',
        duration_minutes: 45,
        capacity: 14,
        equipment_required: ['Mat', 'Ring'],
        booking_mode: 'pre_booking',
        trainer_email: 'linh.pilates@demo.com',
        sessions: [
          { starts_at: '2026-04-02T12:15:00+07:00', ends_at: '2026-04-02T13:00:00+07:00', seats_total: 14, seats_remaining: 5, session_note: 'Thích hợp dân văn phòng' },
        ],
      },
      {
        title: 'Aqua Conditioning',
        program_type: 'other',
        level: 'all',
        description: 'Buổi hồi phục nhẹ trong nước cho người tập nhiều buổi liên tiếp.',
        duration_minutes: 40,
        capacity: 10,
        booking_mode: 'pre_booking',
        zone_name: 'Pool deck',
        sessions: [
          { starts_at: '2026-04-06T18:00:00+07:00', ends_at: '2026-04-06T18:40:00+07:00', seats_total: 10, seats_remaining: 4, session_note: 'Mang sẵn kính bơi nếu cần' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'membership',
        primary_channel: 'phone',
        fallback_channel: 'whatsapp',
        phone: '+84901234003',
        whatsapp: '+84901234003',
        auto_prefill_message: 'Tôi muốn tư vấn gói Monthly Club Access tại Elite Hoàn Kiếm.',
      },
      {
        inquiry_type: 'visit_booking',
        primary_channel: 'whatsapp',
        fallback_channel: 'phone',
        whatsapp: '+84901234003',
        phone: '+84901234003',
        auto_prefill_message: 'Tôi muốn book guest pass để test pool + gym floor.',
      },
    ],
    reviews: [
      {
        athlete_email: 'ngoc.run@demo.com',
        rating: 5,
        equipment_rating: 4,
        cleanliness_rating: 5,
        coaching_rating: 4,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'guest',
        is_verified_visit: true,
        comment: 'Điểm đáng tiền là service rất mượt. Vào tập xong bơi và tắm rất thoải mái.',
      },
      {
        athlete_email: 'an.yoga@demo.com',
        rating: 4,
        equipment_rating: 4,
        cleanliness_rating: 5,
        coaching_rating: 4,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'drop_in',
        is_verified_visit: true,
        comment: 'Không gian mềm và sạch. Hợp những ngày muốn tập nhẹ, bơi rồi xông hơi thư giãn.',
      },
    ],
  },
  {
    owner: { email: 'thao.lotus@demo.com', full_name: 'Lý Ngọc Thảo' },
    taxonomy: ['yoga_studio', 'women_focused', 'yoga', 'community_driven', 'class_based', 'zen'],
    gym: {
      name: 'Lotus Zen Yoga Studio',
      tagline: 'Một studio để hít sâu, tập chậm và rời đi nhẹ đầu hơn',
      description: 'Một yoga studio theo hướng grounding và healing, nhịp chậm, ánh sáng dịu và trải nghiệm đủ yên để người mới không sợ bị áp lực.',
      cover_image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=1400&q=80',
      founded_year: 2019,
      total_area_sqm: 420,
      total_equipment_count: 64,
      highlights: ['Studio yên tĩnh', 'Tea corner', 'Sound bath định kỳ'],
      primary_venue_type_slug: 'yoga_studio',
      positioning_tier: 'mid',
      beginner_friendly: true,
      women_friendly: true,
      recovery_focused: true,
      discovery_blurb: 'Hợp với người cần một studio đủ ấm áp để bắt đầu yoga, thiền và các nhịp hồi phục tinh thần chậm rãi.',
      hero_value_props: ['Tea sau lớp', 'Small-group class', 'Yin & sound bath'],
      profile_completeness_score: 97,
      response_sla_text: 'Phản hồi trong 10 phút giờ hành chính',
      default_primary_cta: 'class_trial',
      default_secondary_cta: 'consultation',
      featured_weight: 82,
    },
    branch: {
      branch_name: 'Nguyễn Đình Chiểu studio',
      address: '88 Nguyễn Đình Chiểu, Quận 1, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      latitude: 10.7727,
      longitude: 106.6925,
      description: 'Studio đặt trọng tâm vào cảm giác an toàn, dễ thở và dễ theo kịp cho cả người mới lẫn người cần phục hồi nhịp sống.',
      opening_hours: buildSchedule('06:00', '21:00', { open: '06:30', close: '20:30' }, { open: '07:00', close: '19:00' }),
      neighborhood_label: 'Quận 1, đi bộ từ khu Hồ Con Rùa',
      parking_summary: 'Gửi xe ngay tầng trệt, staff dắt xe hỗ trợ',
      locker_summary: 'Tủ nhỏ cho điện thoại, ví và đồng hồ',
      shower_summary: '2 phòng tắm, sạch và thơm tinh dầu',
      towel_service_summary: 'Khăn tập nhỏ miễn phí',
      crowd_level_summary: 'Đông nhất sau giờ làm và sáng cuối tuần',
      best_visit_time_summary: 'Yên nhất 10:00–15:00',
      accessibility_summary: 'Lối vào bằng thang bộ ngắn, staff hỗ trợ khi cần',
      women_only_summary: 'Không women-only nhưng phần lớn cộng đồng là nữ',
      child_friendly_summary: 'Không phù hợp cho trẻ nhỏ trong giờ lớp',
      check_in_instructions: 'Đến sớm 10 phút để đổi đồ, nhận thảm và chọn vị trí yên tĩnh.',
      branch_tagline: 'Chậm lại để nghe cơ thể rõ hơn',
      whatsapp_number: '+84901234004',
      messenger_url: 'https://m.me/lotuszenyoga',
      consultation_phone: '+84901234004',
      branch_status_badges: ['Quiet studio', 'Tea included', 'Beginner kind'],
    },
    amenities: [
      { name: 'Tea corner', is_available: true, note: 'Trà thảo mộc sau lớp' },
      { name: 'Meditation cushions', is_available: true, note: 'Dùng tự do trong studio' },
      { name: 'Showers', is_available: true, note: 'Có xịt khoáng và máy sấy' },
      { name: 'Parking', is_available: true, note: 'Chỗ gửi xe ngay tầng trệt' },
    ],
    equipment: [
      { category: 'mind_body', name: 'Eco mat', quantity: 24, brand: 'Manduka', is_available: true },
      { category: 'mind_body', name: 'Yoga block set', quantity: 24, brand: 'Cork', is_available: true },
      { category: 'recovery', name: 'Bolster', quantity: 18, brand: 'Custom', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Drop-in Class',
        price: 180000,
        billing_cycle: 'per_session',
        description: 'Một lớp linh hoạt để thử studio và teacher vibe.',
        plan_type: 'drop_in',
        access_scope: 'single_branch',
        included_services: ['1 lớp', 'Tea corner'],
        order_number: 0,
      },
      {
        plan_name: 'Unlimited Yoga Monthly',
        price: 1290000,
        billing_cycle: 'per_month',
        description: 'Điểm vào hợp lý cho người muốn biến yoga thành nhịp đều hàng tuần.',
        is_highlighted: true,
        plan_type: 'membership',
        access_scope: 'single_branch',
        included_services: ['Unlimited classes', 'Tea corner', '1 sound bath/tháng'],
        trial_available: true,
        trial_price: 99000,
        highlighted_reason: 'Phù hợp nhất cho người mới muốn vào nhịp',
        order_number: 1,
      },
      {
        plan_name: 'Yin + Sound Bath 4 buổi',
        price: 960000,
        billing_cycle: 'per_session',
        description: 'Gói 4 buổi chuyên để phục hồi và ngủ sâu hơn.',
        plan_type: 'class_pack',
        access_scope: 'single_branch',
        class_credits: 4,
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1545208393-596371ba4d31?w=1400&q=80',
        caption: 'Hero view của main shala lúc sáng sớm',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        is_featured: true,
        orientation: 'landscape',
        alt_text: 'Main shala tại Lotus Zen Yoga Studio',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1400&q=80',
        caption: 'Reformer và props cho lớp core nhẹ',
        image_type: 'class',
        media_role: 'class_in_action',
        orientation: 'landscape',
        alt_text: 'Lớp yoga nhẹ tại Lotus Zen Yoga Studio',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80',
        caption: 'Tea corner và khu nghỉ sau lớp',
        image_type: 'other',
        media_role: 'community',
        orientation: 'landscape',
        alt_text: 'Tea corner tại Lotus Zen Yoga Studio',
      },
    ],
    zones: [
      {
        zone_type: 'yoga_room',
        name: 'Main shala',
        description: 'Phòng tập chính ánh sáng dịu, sàn gỗ và trần cao vừa đủ thoáng.',
        capacity: 22,
        area_sqm: 135,
        sound_profile: 'instructor_led',
        natural_light_score: 5,
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'recovery_zone',
        name: 'Meditation room',
        description: 'Không gian nhỏ cho thiền, thở và reset trước khi về.',
        capacity: 8,
        area_sqm: 42,
        sound_profile: 'silent',
        sort_order: 1,
      },
    ],
    trainers: [
      {
        email: 'nhi.yoga@demo.com',
        role_at_gym: 'Lead yoga teacher',
        specialization_summary: 'Hatha grounding, breathwork và yoga cho người cần giảm căng thẳng',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'Nhi là gương mặt dẫn dắt vibe mềm và chậm của Lotus Zen.',
        languages: ['Tiếng Việt'],
        visible_order: 0,
      },
      {
        email: 'linh.pilates@demo.com',
        role_at_gym: 'Posture guest teacher',
        specialization_summary: 'Core restore và lower-back friendly sequences',
        accepts_private_clients: true,
        branch_intro: 'Linh có mặt ở các lớp phục hồi dành cho dân văn phòng và sau sinh.',
        languages: ['Tiếng Việt'],
        visible_order: 1,
      },
    ],
    programs: [
      {
        title: 'Hatha Grounding',
        program_type: 'yoga',
        level: 'beginner',
        description: 'Lớp ổn định hơi thở và căn chỉnh cơ bản cho người mới quay lại với cơ thể.',
        duration_minutes: 60,
        capacity: 20,
        equipment_required: ['Mat', 'Block'],
        booking_mode: 'pre_booking',
        trainer_email: 'nhi.yoga@demo.com',
        zone_name: 'Main shala',
        sessions: [
          { starts_at: '2026-04-02T07:00:00+07:00', ends_at: '2026-04-02T08:00:00+07:00', seats_total: 20, seats_remaining: 6, session_note: 'Mang trang phục nhẹ, không cần kinh nghiệm trước' },
          { starts_at: '2026-04-04T09:00:00+07:00', ends_at: '2026-04-04T10:00:00+07:00', seats_total: 20, seats_remaining: 7, session_note: 'Buổi cuối tuần yên và chậm hơn' },
        ],
      },
      {
        title: 'Yin + Sound Bath',
        program_type: 'meditation',
        level: 'all',
        description: 'Buổi tối để hạ nhịp thần kinh và ngủ sâu hơn sau tuần làm việc.',
        duration_minutes: 75,
        capacity: 14,
        equipment_required: ['Bolster', 'Blanket'],
        booking_mode: 'pre_booking',
        trainer_email: 'nhi.yoga@demo.com',
        zone_name: 'Meditation room',
        sessions: [
          { starts_at: '2026-04-03T19:15:00+07:00', ends_at: '2026-04-03T20:30:00+07:00', seats_total: 14, seats_remaining: 4, session_note: 'Âm lượng nhỏ, hạn chế vào trễ' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'class_trial',
        primary_channel: 'whatsapp',
        fallback_channel: 'email',
        whatsapp: '+84901234004',
        email: 'hello@lotuszen.demo',
        auto_prefill_message: 'Xin chào Lotus Zen, tôi muốn thử một lớp Hatha Grounding cho người mới.',
      },
      {
        inquiry_type: 'consultation',
        primary_channel: 'email',
        fallback_channel: 'whatsapp',
        email: 'hello@lotuszen.demo',
        whatsapp: '+84901234004',
        auto_prefill_message: 'Tôi muốn được tư vấn lớp phù hợp cho stress recovery và đau lưng nhẹ.',
      },
    ],
    reviews: [
      {
        athlete_email: 'an.yoga@demo.com',
        rating: 5,
        equipment_rating: 4,
        cleanliness_rating: 5,
        coaching_rating: 5,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'member',
        is_verified_visit: true,
        comment: 'Studio rất dịu và teacher giữ không khí an toàn. Người mới đến cũng không bị ngại.',
      },
      {
        athlete_email: 'ngoc.run@demo.com',
        rating: 4,
        equipment_rating: 4,
        cleanliness_rating: 5,
        coaching_rating: 4,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'trial',
        is_verified_visit: true,
        comment: 'Sau buổi Yin + Sound Bath mình ngủ ngon hơn hẳn. Hợp cho tuần chạy nặng.',
      },
    ],
  },
  {
    owner: { email: 'linh.reform@demo.com', full_name: 'Hoàng Mỹ Linh' },
    taxonomy: ['pilates_studio', 'women_focused', 'pilates', 'premium', 'class_based', 'minimalist'],
    gym: {
      name: 'Reform Lab Pilates',
      tagline: 'Pilates reformer với nhịp gọn, sạch và đủ riêng tư để theo tiến bộ thật',
      description: 'Một reformer studio thiên về kỹ thuật và cảm giác chăm chút. Phù hợp cho người cần posture, core và body tone mà không thích môi trường quá ồn.',
      cover_image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1400&q=80',
      founded_year: 2022,
      total_area_sqm: 320,
      total_equipment_count: 28,
      highlights: ['Reformer spacing rộng', 'Teacher chỉnh form sát', 'Không gian tối giản'],
      primary_venue_type_slug: 'pilates_studio',
      positioning_tier: 'premium',
      beginner_friendly: true,
      women_friendly: true,
      recovery_focused: true,
      discovery_blurb: 'Hợp với người muốn một pilates studio rõ kỹ thuật, ít đông và không bị xô bồ bởi mô hình class số lượng lớn.',
      hero_value_props: ['8 reformer spacing rộng', 'Teacher sửa form sát', 'Studio tối giản'],
      profile_completeness_score: 98,
      response_sla_text: 'Phản hồi trong 10 phút',
      default_primary_cta: 'class_trial',
      default_secondary_cta: 'consultation',
      featured_weight: 84,
    },
    branch: {
      branch_name: 'Thảo Điền studio',
      address: '24 Xuân Thuỷ, Thảo Điền, TP. Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      district: 'TP. Thủ Đức',
      latitude: 10.8037,
      longitude: 106.7388,
      description: 'Studio nhỏ nhưng tinh gọn, tập trung vào reformer và progression theo từng block 4–8 tuần.',
      opening_hours: buildSchedule('06:30', '20:30', { open: '07:00', close: '18:30' }, { open: '07:30', close: '17:00' }),
      neighborhood_label: 'Thảo Điền, gần bãi xe Xuân Thuỷ',
      parking_summary: 'Gửi xe ngay trước cửa, có slot cho ô tô theo lịch hẹn',
      locker_summary: 'Locker gọn cho vật dụng cá nhân',
      shower_summary: '2 phòng thay đồ riêng, sạch và khô',
      towel_service_summary: 'Khăn mặt miễn phí, khăn tắm theo yêu cầu',
      crowd_level_summary: 'Lớp đông nhất 07:00 và 18:00',
      best_visit_time_summary: 'Yên nhất 09:00–15:30',
      accessibility_summary: 'Lối vào thấp, dễ tiếp cận hơn đa số studio trong khu',
      women_only_summary: 'Không women-only nhưng phần lớn học viên là nữ',
      child_friendly_summary: 'Không phù hợp cho trẻ nhỏ ngồi chờ lâu',
      check_in_instructions: 'Đến sớm 5–10 phút để chọn reformer và trao đổi tình trạng cơ thể.',
      branch_tagline: 'Pilates rõ kỹ thuật, không chạy theo số đông',
      whatsapp_number: '+84901234005',
      messenger_url: 'https://m.me/reformlabpilates',
      consultation_phone: '+84901234005',
      branch_status_badges: ['Reformer first', 'Quiet studio', 'Form-focused'],
    },
    amenities: [
      { name: 'Changing room', is_available: true, note: '2 phòng riêng' },
      { name: 'Filtered water', is_available: true, note: 'Refill miễn phí' },
      { name: 'Posture wall', is_available: true, note: 'Dùng cho before/after cueing' },
    ],
    equipment: [
      { category: 'pilates', name: 'Reformer machine', quantity: 8, brand: 'Balanced Body', is_available: true },
      { category: 'pilates', name: 'Pilates chair', quantity: 2, brand: 'Balanced Body', is_available: true },
      { category: 'pilates', name: 'Magic circle', quantity: 10, brand: 'Custom', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Intro Reformer 3 buổi',
        price: 690000,
        billing_cycle: 'per_session',
        description: 'Gói thử cho người muốn cảm được reformer trước khi commit dài.',
        plan_type: 'trial',
        access_scope: 'single_branch',
        session_count: 3,
        trial_available: true,
        trial_price: 690000,
        highlighted_reason: 'Cách dễ nhất để test reformer',
        order_number: 0,
      },
      {
        plan_name: '8-Class Reformer Pack',
        price: 2480000,
        billing_cycle: 'per_session',
        description: '8 credits dùng trong 30 ngày cho người đi đều 2 buổi/tuần.',
        is_highlighted: true,
        plan_type: 'reformer_pack',
        access_scope: 'single_branch',
        class_credits: 8,
        validity_days: 30,
        highlighted_reason: 'Phổ biến nhất với người đi làm',
        order_number: 1,
      },
      {
        plan_name: 'Unlimited Morning Reformer',
        price: 2790000,
        billing_cycle: 'per_month',
        description: 'Cho người thích slot sáng và muốn đi đều nhiều hơn 2 buổi/tuần.',
        plan_type: 'membership',
        access_scope: 'single_branch',
        peak_access_rule: 'Áp dụng trước 11:00 mỗi ngày',
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1400&q=80',
        caption: 'Hero view nhìn trọn reformer line',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        is_featured: true,
        orientation: 'landscape',
        alt_text: 'Không gian reformer tại Reform Lab Pilates',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1400&q=80',
        caption: 'Teacher chỉnh trục vai và rib cage',
        image_type: 'class',
        media_role: 'trainer_in_action',
        orientation: 'landscape',
        alt_text: 'Teacher pilates đang chỉnh form tại Reform Lab',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1571902258032-78a167d6742c?w=1400&q=80',
        caption: 'Mat room cho các buổi restore',
        image_type: 'class',
        media_role: 'zone_overview',
        orientation: 'landscape',
        alt_text: 'Mat room tại Reform Lab Pilates',
      },
    ],
    zones: [
      {
        zone_type: 'pilates_reformer_room',
        name: 'Reformer gallery',
        description: '8 máy xếp thoáng, đủ khoảng cách để teacher di chuyển sửa form.',
        capacity: 8,
        area_sqm: 110,
        sound_profile: 'instructor_led',
        natural_light_score: 4,
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'pilates_mat_room',
        name: 'Mat room',
        description: 'Phòng nhỏ hơn cho core restore, breathwork và private assessment.',
        capacity: 10,
        area_sqm: 55,
        sound_profile: 'silent',
        sort_order: 1,
      },
    ],
    trainers: [
      {
        email: 'linh.pilates@demo.com',
        role_at_gym: 'Lead reformer teacher',
        specialization_summary: 'Posture, lower-back friendly pilates và body-tone block',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'Linh dẫn main progression và trực tiếp chỉnh form trong các lớp reformer cốt lõi.',
        languages: ['Tiếng Việt'],
        visible_order: 0,
      },
    ],
    programs: [
      {
        title: 'Reformer Flow 50',
        program_type: 'pilates',
        level: 'beginner',
        description: 'Flow căn bản cho người mới cần core, posture và chuyển động mượt hơn.',
        duration_minutes: 50,
        capacity: 8,
        equipment_required: ['Reformer'],
        booking_mode: 'pre_booking',
        trainer_email: 'linh.pilates@demo.com',
        zone_name: 'Reformer gallery',
        sessions: [
          { starts_at: '2026-04-02T07:15:00+07:00', ends_at: '2026-04-02T08:05:00+07:00', seats_total: 8, seats_remaining: 2, session_note: 'Slot sáng đông nhất tuần' },
          { starts_at: '2026-04-03T18:15:00+07:00', ends_at: '2026-04-03T19:05:00+07:00', seats_total: 8, seats_remaining: 3, session_note: 'Lớp tối phù hợp người đi làm' },
        ],
      },
      {
        title: 'Core Restore 45',
        program_type: 'mobility',
        level: 'all',
        description: 'Buổi nhẹ cho người đau lưng hoặc cần hạ nhịp sau chuỗi ngày ngồi nhiều.',
        duration_minutes: 45,
        capacity: 10,
        equipment_required: ['Mat', 'Ring'],
        booking_mode: 'pre_booking',
        trainer_email: 'linh.pilates@demo.com',
        zone_name: 'Mat room',
        sessions: [
          { starts_at: '2026-04-05T10:30:00+07:00', ends_at: '2026-04-05T11:15:00+07:00', seats_total: 10, seats_remaining: 4, session_note: 'Mức độ nhẹ, phù hợp recovery day' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'class_trial',
        primary_channel: 'whatsapp',
        fallback_channel: 'phone',
        whatsapp: '+84901234005',
        phone: '+84901234005',
        auto_prefill_message: 'Tôi muốn đăng ký gói Intro Reformer 3 buổi ở Reform Lab Pilates.',
      },
      {
        inquiry_type: 'consultation',
        primary_channel: 'phone',
        fallback_channel: 'whatsapp',
        phone: '+84901234005',
        whatsapp: '+84901234005',
        auto_prefill_message: 'Tôi muốn được tư vấn lớp phù hợp cho đau lưng nhẹ và core yếu.',
      },
    ],
    reviews: [
      {
        athlete_email: 'ngoc.run@demo.com',
        rating: 5,
        equipment_rating: 5,
        cleanliness_rating: 5,
        coaching_rating: 5,
        atmosphere_rating: 4,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'trial',
        is_verified_visit: true,
        comment: 'Teacher sửa form rất sát và reformer spacing rộng nên không bị áp lực.',
      },
      {
        athlete_email: 'an.yoga@demo.com',
        rating: 4,
        equipment_rating: 5,
        cleanliness_rating: 5,
        coaching_rating: 4,
        atmosphere_rating: 4,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'member',
        is_verified_visit: true,
        comment: 'Studio nhỏ nhưng đủ riêng tư. Hợp cho những ngày muốn tập kỹ và chậm.',
      },
    ],
  },
  {
    owner: { email: 'hieu.warehouse@demo.com', full_name: 'Bùi Công Hiếu' },
    taxonomy: ['boutique_studio', 'athlete', 'boxing', 'community_driven', 'class_based', 'energetic'],
    gym: {
      name: 'The Warehouse Boxing MMA',
      tagline: 'Boutique combat studio cho người thích mùi mồ hôi thật và nhịp tập có lửa',
      description: 'Một boxing & conditioning studio đậm chất cộng đồng: ring rõ ràng, pad work nghiêm túc, conditioning lane đủ nặng nhưng không bị hỗn loạn.',
      cover_image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1400&q=80',
      founded_year: 2020,
      total_area_sqm: 820,
      total_equipment_count: 96,
      highlights: ['Ring chuẩn', 'Grappling mat', 'Nhịp class máu lửa'],
      primary_venue_type_slug: 'boutique_studio',
      positioning_tier: 'mid',
      beginner_friendly: true,
      women_friendly: true,
      athlete_friendly: true,
      discovery_blurb: 'Nếu bạn đang tìm một venue combat thiên về energy và cộng đồng thay vì gym khổng lồ vô danh, Warehouse là cái tên đáng test.',
      hero_value_props: ['Boxing ring chuẩn', 'Bag line dài', 'Coach-led energy'],
      profile_completeness_score: 94,
      response_sla_text: 'Phản hồi trong 15 phút',
      default_primary_cta: 'class_trial',
      default_secondary_cta: 'visit_booking',
      featured_weight: 74,
    },
    branch: {
      branch_name: 'Cao Thắng fight floor',
      address: '23 Cao Thắng, Quận 3, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 3',
      latitude: 10.7808,
      longitude: 106.6817,
      description: 'Không gian combat không quá bóng bẩy nhưng có cấu trúc rõ: bag line, ring, mat và conditioning lane đều đủ chức năng.',
      opening_hours: buildSchedule('06:00', '22:00', { open: '07:00', close: '20:30' }, { open: '08:00', close: '18:00' }),
      neighborhood_label: 'Quận 3, 5 phút từ vòng xoay Dân Chủ',
      parking_summary: 'Giữ xe trước cửa và bãi phụ cách 30m',
      locker_summary: 'Locker mở khoá số đơn giản',
      shower_summary: '3 phòng tắm nhanh sau lớp',
      towel_service_summary: 'Không có khăn miễn phí',
      crowd_level_summary: 'Đông và nóng nhất 18:30–20:00',
      best_visit_time_summary: 'Yên nhất 10:00–16:00 cho buổi tập kỹ thuật riêng',
      accessibility_summary: 'Lối vào phẳng, không có thang máy',
      women_only_summary: 'Không women-only nhưng có lớp fundamentals rất thân thiện',
      child_friendly_summary: 'Không phù hợp cho trẻ em đứng chờ trong giờ sparring',
      check_in_instructions: 'Nếu mới đến, báo front desk để được mượn găng và xếp vào lớp fundamentals.',
      branch_tagline: 'Cộng đồng nhỏ nhưng lửa rất thật',
      whatsapp_number: '+84901234006',
      messenger_url: 'https://m.me/thewarehousefightclub',
      consultation_phone: '+84901234006',
      branch_status_badges: ['Combat energy', 'Bag line', 'Beginner intro'],
    },
    amenities: [
      { name: 'Boxing ring', is_available: true, note: 'Dùng cho lớp và sparring' },
      { name: 'Showers', is_available: true, note: '3 phòng cơ bản' },
      { name: 'Glove rental', is_available: true, note: 'Thuê 30.000₫/buổi' },
    ],
    equipment: [
      { category: 'boxing', name: 'Heavy bag', quantity: 12, brand: 'Fairtex', is_available: true },
      { category: 'boxing', name: 'Thai pad set', quantity: 10, brand: 'Fairtex', is_available: true },
      { category: 'functional', name: 'SkiErg', quantity: 2, brand: 'Concept2', is_available: true },
      { category: 'functional', name: 'Battle rope', quantity: 3, brand: 'Again Faster', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Fundamentals Trial',
        price: 150000,
        billing_cycle: 'per_session',
        description: 'Một buổi thử để làm quen footwork, guard và nhịp class.',
        plan_type: 'trial',
        access_scope: 'single_branch',
        trial_available: true,
        trial_price: 150000,
        highlighted_reason: 'Cách vào venue dễ nhất cho người mới',
        order_number: 0,
      },
      {
        plan_name: '10-Class Fight Pack',
        price: 2100000,
        billing_cycle: 'per_session',
        description: '10 credits dùng trong 45 ngày cho boxing, kickboxing và conditioning.',
        is_highlighted: true,
        plan_type: 'class_pack',
        access_scope: 'single_branch',
        class_credits: 10,
        validity_days: 45,
        highlighted_reason: 'Linh hoạt nhất cho người chưa đi đều mỗi tuần',
        order_number: 1,
      },
      {
        plan_name: 'Unlimited Striking Monthly',
        price: 1650000,
        billing_cycle: 'per_month',
        description: 'Full access cho boxing, bag work và conditioning class.',
        plan_type: 'membership',
        access_scope: 'single_branch',
        included_services: ['Unlimited classes', 'Open bag work'],
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1400&q=80',
        caption: 'Hero view của fight floor và ring',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        is_featured: true,
        orientation: 'landscape',
        alt_text: 'Fight floor tại The Warehouse Boxing MMA',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80',
        caption: 'Nhịp class conditioning sau phần pad work',
        image_type: 'class',
        media_role: 'class_in_action',
        orientation: 'landscape',
        alt_text: 'Lớp conditioning tại The Warehouse Boxing MMA',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1400&q=80',
        caption: 'Bag line cho self-practice ngoài giờ lớp',
        image_type: 'equipment',
        media_role: 'equipment_detail',
        orientation: 'landscape',
        alt_text: 'Bag line tại The Warehouse Boxing MMA',
      },
    ],
    zones: [
      {
        zone_type: 'boxing_zone',
        name: 'Ring floor',
        description: 'Ring chuẩn, bag line dài và khoảng đứng pad work đủ thoáng.',
        capacity: 22,
        area_sqm: 190,
        sound_profile: 'energetic',
        natural_light_score: 3,
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'functional_zone',
        name: 'Conditioning lane',
        description: 'Sled, rope, ski erg và bodyweight stations.',
        capacity: 14,
        area_sqm: 95,
        sound_profile: 'energetic',
        sort_order: 1,
      },
    ],
    trainers: [
      {
        email: 'huong.crossfit@demo.com',
        role_at_gym: 'Conditioning coach',
        specialization_summary: 'Fight conditioning, engine building và hybrid class energy',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'Hương chạy các lớp conditioning giúp người mới theo kịp nhịp venue nhanh hơn.',
        languages: ['Tiếng Việt'],
        visible_order: 0,
      },
      {
        email: 'hoang.cali@demo.com',
        role_at_gym: 'Movement coach',
        specialization_summary: 'Footwork, mobility vai-hông và bodyweight conditioning',
        accepts_private_clients: true,
        branch_intro: 'Hoàng hỗ trợ warm-up flow và reset mobility sau các buổi nặng.',
        languages: ['Tiếng Việt', 'English'],
        visible_order: 1,
      },
    ],
    programs: [
      {
        title: 'Boxing Fundamentals',
        program_type: 'boxing',
        level: 'beginner',
        description: 'Guard, footwork và combo cơ bản cho người chưa từng tập đối kháng.',
        duration_minutes: 60,
        capacity: 16,
        equipment_required: ['Hand wrap'],
        booking_mode: 'pre_booking',
        trainer_email: 'huong.crossfit@demo.com',
        zone_name: 'Ring floor',
        sessions: [
          { starts_at: '2026-04-02T19:15:00+07:00', ends_at: '2026-04-02T20:15:00+07:00', seats_total: 16, seats_remaining: 5, session_note: 'Găng có thể thuê tại quầy' },
          { starts_at: '2026-04-04T11:00:00+07:00', ends_at: '2026-04-04T12:00:00+07:00', seats_total: 16, seats_remaining: 6, session_note: 'Buổi trưa cho người muốn test nhẹ' },
        ],
      },
      {
        title: 'Fight Conditioning',
        program_type: 'hiit',
        level: 'all',
        description: 'Circuit cường độ cao sau phần kỹ thuật, tập trung vào engine và grit.',
        duration_minutes: 45,
        capacity: 14,
        equipment_required: ['Rope', 'SkiErg'],
        booking_mode: 'pre_booking',
        trainer_email: 'huong.crossfit@demo.com',
        zone_name: 'Conditioning lane',
        sessions: [
          { starts_at: '2026-04-03T18:15:00+07:00', ends_at: '2026-04-03T19:00:00+07:00', seats_total: 14, seats_remaining: 4, session_note: 'Đến sớm 10 phút để warm-up' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'class_trial',
        primary_channel: 'whatsapp',
        fallback_channel: 'phone',
        whatsapp: '+84901234006',
        phone: '+84901234006',
        auto_prefill_message: 'Tôi muốn thử lớp Boxing Fundamentals cho người mới.',
      },
      {
        inquiry_type: 'visit_booking',
        primary_channel: 'phone',
        fallback_channel: 'whatsapp',
        phone: '+84901234006',
        whatsapp: '+84901234006',
        auto_prefill_message: 'Tôi muốn ghé xem venue và hỏi về gói 10-Class Fight Pack.',
      },
    ],
    reviews: [
      {
        athlete_email: 'tam.cut@demo.com',
        rating: 5,
        equipment_rating: 4,
        cleanliness_rating: 4,
        coaching_rating: 5,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'drop_in',
        is_verified_visit: true,
        comment: 'Không khí lớp rất thật, không diễn. Người mới vẫn được kéo vào nhịp khá tốt.',
      },
      {
        athlete_email: 'khoa.demo@demo.com',
        rating: 4,
        equipment_rating: 4,
        cleanliness_rating: 4,
        coaching_rating: 4,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 4,
        visit_type: 'trial',
        is_verified_visit: true,
        comment: 'Fight conditioning đủ nặng và có structure. Hợp cho ai thích energy cộng đồng nhỏ.',
      },
    ],
  },
  {
    owner: { email: 'reset.recovery@demo.com', full_name: 'Phạm Gia Hân' },
    taxonomy: ['recovery_venue', 'beginner', 'functional', 'hybrid', 'minimalist', 'sauna', 'massage'],
    gym: {
      name: 'Reset Recovery Social',
      tagline: 'Recovery venue cho những ngày bạn cần hồi phục có chủ đích chứ không chỉ nghỉ ngơi mơ hồ',
      description: 'Một venue thiên về reset cơ thể và thần kinh: sauna, cold circuit, mobility coach và các protocol phục hồi cho người tập đều hoặc làm việc căng.',
      cover_image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80',
      founded_year: 2023,
      total_area_sqm: 360,
      total_equipment_count: 32,
      highlights: ['Contrast therapy', 'Mobility reset', 'Quiet lounge'],
      primary_venue_type_slug: 'recovery_venue',
      positioning_tier: 'premium',
      beginner_friendly: true,
      women_friendly: true,
      recovery_focused: true,
      discovery_blurb: 'Phù hợp cho runner, người tập nặng hoặc dân văn phòng cần phục hồi có cấu trúc thay vì chỉ đi spa đơn thuần.',
      hero_value_props: ['Infrared sauna', 'Cold plunge circuit', 'Mobility coach'],
      profile_completeness_score: 92,
      response_sla_text: 'Phản hồi trong 15 phút',
      default_primary_cta: 'consultation',
      default_secondary_cta: 'visit_booking',
      featured_weight: 69,
    },
    branch: {
      branch_name: 'Thảo Điền recovery house',
      address: '9 Quốc Hương, Thảo Điền, TP. Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      district: 'TP. Thủ Đức',
      latitude: 10.8045,
      longitude: 106.7381,
      description: 'Venue nhỏ, sáng và tối giản. Mục tiêu là giúp bạn bước vào, hạ nhịp và rời đi với cảm giác cơ thể được sắp xếp lại.',
      opening_hours: buildSchedule('08:00', '21:00', { open: '08:00', close: '19:00' }, { open: '08:00', close: '18:00' }),
      neighborhood_label: 'Thảo Điền, cách ga metro 7 phút đi bộ',
      parking_summary: 'Có bãi xe trước cửa, ô tô đỗ được theo lịch hẹn',
      locker_summary: 'Locker nhỏ gọn, có túi chống nước',
      shower_summary: '2 shower room, đồ vệ sinh cá nhân có sẵn',
      towel_service_summary: 'Towel set miễn phí trong mọi gói',
      crowd_level_summary: 'Đông nhất sau 18:00 và sáng Chủ nhật',
      best_visit_time_summary: 'Tốt nhất 10:00–16:00 nếu thích không gian rất yên',
      accessibility_summary: 'Mặt bằng trệt, dễ tiếp cận',
      women_only_summary: 'Không women-only nhưng có private slot theo lịch hẹn',
      child_friendly_summary: 'Không phù hợp cho trẻ nhỏ đi cùng lâu',
      check_in_instructions: 'Đổi dép, nghe staff giới thiệu protocol rồi vào từng zone theo vòng.',
      branch_tagline: 'Recovery có chủ đích, không làm quá',
      whatsapp_number: '+84901234007',
      messenger_url: 'https://m.me/resetrecoverysocial',
      consultation_phone: '+84901234007',
      branch_status_badges: ['Recovery-first', 'Quiet lounge', 'Protocol guided'],
    },
    amenities: [
      { name: 'Infrared sauna', is_available: true, note: 'Theo protocol 20 phút' },
      { name: 'Cold plunge', is_available: true, note: 'Có staff hướng dẫn' },
      { name: 'Shower', is_available: true, note: 'Towel included' },
      { name: 'Quiet lounge', is_available: true, note: 'Có electrolyte station' },
    ],
    equipment: [
      { category: 'recovery', name: 'Compression boots', quantity: 4, brand: 'Normatec', is_available: true },
      { category: 'recovery', name: 'Ice tub', quantity: 2, brand: 'Custom', is_available: true },
      { category: 'mobility', name: 'Mobility rail', quantity: 1, brand: 'Custom', is_available: true },
    ],
    pricing: [
      {
        plan_name: 'Recovery Circuit Day Pass',
        price: 280000,
        billing_cycle: 'per_day',
        description: '1 vòng sauna + cold + compression trong 90 phút.',
        plan_type: 'recovery_pack',
        access_scope: 'single_branch',
        included_services: ['Sauna', 'Cold plunge', 'Compression boots', 'Towel'],
        highlighted_reason: 'Cách dễ nhất để test protocol',
        order_number: 0,
      },
      {
        plan_name: 'Monthly Recovery Club',
        price: 1680000,
        billing_cycle: 'per_month',
        description: '8 visits/tháng cho người tập đều hoặc làm việc stress cao.',
        is_highlighted: true,
        plan_type: 'recovery_pack',
        access_scope: 'single_branch',
        included_services: ['8 visits', 'Electrolyte bar', '1 mobility screening'],
        highlighted_reason: 'Hợp nhất cho người cần recovery như một thói quen',
        order_number: 1,
      },
      {
        plan_name: 'Mobility Reset 1-1',
        price: 650000,
        billing_cycle: 'per_session',
        description: '1 buổi private để xây protocol phục hồi theo tình trạng thật.',
        plan_type: 'private_pt',
        access_scope: 'single_branch',
        session_count: 1,
        order_number: 2,
      },
    ],
    gallery: [
      {
        image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=80',
        caption: 'Hero view của recovery lounge',
        image_type: 'interior',
        media_role: 'hero',
        is_hero: true,
        is_listing_thumb: true,
        is_featured: true,
        orientation: 'landscape',
        alt_text: 'Recovery lounge tại Reset Recovery Social',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1400&q=80',
        caption: 'Contrast therapy suite',
        image_type: 'other',
        media_role: 'recovery',
        orientation: 'landscape',
        alt_text: 'Contrast therapy suite tại Reset Recovery Social',
      },
      {
        image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1400&q=80',
        caption: 'Mobility reset cùng coach',
        image_type: 'class',
        media_role: 'trainer_in_action',
        orientation: 'landscape',
        alt_text: 'Buổi mobility reset tại Reset Recovery Social',
      },
    ],
    zones: [
      {
        zone_type: 'recovery_zone',
        name: 'Contrast suite',
        description: 'Sauna, cold plunge và ghế nghỉ theo một vòng protocol rõ ràng.',
        capacity: 10,
        area_sqm: 75,
        temperature_mode: 'infrared',
        sound_profile: 'silent',
        is_signature_zone: true,
        sort_order: 0,
      },
      {
        zone_type: 'sauna_zone',
        name: 'Infrared room',
        description: 'Phòng nhiệt hồng ngoại cho buổi solo hoặc sau mobility session.',
        capacity: 4,
        area_sqm: 24,
        temperature_mode: 'infrared',
        sound_profile: 'silent',
        sort_order: 1,
      },
      {
        zone_type: 'recovery_zone',
        name: 'Mobility bar',
        description: 'Khu rail, mat và screen nhanh để coach build protocol cá nhân.',
        capacity: 6,
        area_sqm: 32,
        sound_profile: 'instructor_led',
        sort_order: 2,
      },
    ],
    trainers: [
      {
        email: 'linh.pilates@demo.com',
        role_at_gym: 'Recovery specialist',
        specialization_summary: 'Posture reset, low-back recovery và gentle core activation',
        featured_at_branch: true,
        accepts_private_clients: true,
        branch_intro: 'Linh phụ trách các protocol cho dân văn phòng, sau sinh và người đau lưng nhẹ.',
        languages: ['Tiếng Việt'],
        visible_order: 0,
      },
      {
        email: 'nhi.yoga@demo.com',
        role_at_gym: 'Breathwork guide',
        specialization_summary: 'Breath-led down regulation và nervous-system reset',
        accepts_private_clients: true,
        branch_intro: 'Nhi dẫn các buổi breath + reset cho người stress cao hoặc khó ngủ.',
        languages: ['Tiếng Việt'],
        visible_order: 1,
      },
    ],
    programs: [
      {
        title: 'Mobility Reset 45',
        program_type: 'mobility',
        level: 'all',
        description: 'Buổi short-format để mở hông, vai và reset cột sống sau tuần ngồi nhiều.',
        duration_minutes: 45,
        capacity: 8,
        equipment_required: ['Mat', 'Rail'],
        booking_mode: 'pre_booking',
        trainer_email: 'linh.pilates@demo.com',
        zone_name: 'Mobility bar',
        sessions: [
          { starts_at: '2026-04-02T18:00:00+07:00', ends_at: '2026-04-02T18:45:00+07:00', seats_total: 8, seats_remaining: 3, session_note: 'Phù hợp recovery day' },
        ],
      },
      {
        title: 'Breath + Cold Plunge',
        program_type: 'recovery',
        level: 'all',
        description: 'Buổi hướng dẫn thở và vào cold plunge có kiểm soát, không làm quá cơ thể.',
        duration_minutes: 35,
        capacity: 6,
        booking_mode: 'pre_booking',
        trainer_email: 'nhi.yoga@demo.com',
        zone_name: 'Contrast suite',
        sessions: [
          { starts_at: '2026-04-06T19:00:00+07:00', ends_at: '2026-04-06T19:35:00+07:00', seats_total: 6, seats_remaining: 2, session_note: 'Không phù hợp nếu chưa ăn nhẹ trước buổi' },
        ],
      },
    ],
    leadRoutes: [
      {
        inquiry_type: 'consultation',
        primary_channel: 'whatsapp',
        fallback_channel: 'email',
        whatsapp: '+84901234007',
        email: 'hello@resetrecovery.demo',
        auto_prefill_message: 'Tôi muốn được tư vấn protocol recovery phù hợp với lịch tập hiện tại.',
      },
      {
        inquiry_type: 'visit_booking',
        primary_channel: 'phone',
        fallback_channel: 'whatsapp',
        phone: '+84901234007',
        whatsapp: '+84901234007',
        auto_prefill_message: 'Tôi muốn book Recovery Circuit Day Pass trong tuần này.',
      },
    ],
    reviews: [
      {
        athlete_email: 'tuan.vp@demo.com',
        rating: 5,
        equipment_rating: 4,
        cleanliness_rating: 5,
        coaching_rating: 5,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 5,
        visit_type: 'drop_in',
        is_verified_visit: true,
        comment: 'Rất hợp cho dân ngồi nhiều. Sau buổi mobility + contrast mình thấy lưng nhẹ hơn rõ.',
      },
      {
        athlete_email: 'an.yoga@demo.com',
        rating: 4,
        equipment_rating: 4,
        cleanliness_rating: 5,
        coaching_rating: 4,
        atmosphere_rating: 5,
        value_rating: 4,
        crowd_rating: 5,
        visit_type: 'trial',
        is_verified_visit: true,
        comment: 'Không gian tối giản và yên. Đi một mình vẫn thấy được dẫn nhịp rất kỹ.',
      },
    ],
  },
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
  const taxonomyRepo = AppDataSource.getRepository(GymTaxonomyTerm);
  const centerTaxonomyRepo = AppDataSource.getRepository(GymCenterTaxonomyTerm);
  const zoneRepo = AppDataSource.getRepository(GymZone);
  const gymProgramRepo = AppDataSource.getRepository(GymMarketplaceProgram);
  const gymProgramSessionRepo = AppDataSource.getRepository(GymProgramSession);
  const leadRouteRepo = AppDataSource.getRepository(GymLeadRoute);
  const reviewRepo = AppDataSource.getRepository(GymReview);
  const trainerLinkRepo = AppDataSource.getRepository(GymTrainerLink);
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
    let user = await userRepo.findOne({ where: [{ email: c.email }, { slug: c.slug }] });
    if (!user) {
      user = await userRepo.save(userRepo.create({
        email: c.email, full_name: c.full_name, password: hashed, user_type: 'trainer',
        avatar_url: c.avatar_url, bio: c.bio, specialties: c.specialties,
        base_price_monthly: c.base_price_monthly as any, slug: c.slug,
        is_verified: true, is_email_verified: true, onboarding_completed: true,
      })) as unknown as User;
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
    let user = await userRepo.findOne({ where: [{ email: a.email }, { slug: a.slug }] });
    if (!user) {
      user = await userRepo.save(userRepo.create({
        email: a.email, full_name: a.full_name, password: hashed, user_type: 'athlete',
        avatar_url: a.avatar_url, bio: a.bio, height_cm: a.height_cm,
        current_weight_kg: a.current_weight_kg as any, experience_level: a.experience_level,
        specialties: a.specialties, slug: a.slug,
        is_verified: true, is_email_verified: true, onboarding_completed: true,
      })) as unknown as User;
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
  const trainerUsers = await userRepo.find({ where: { user_type: 'trainer' as any } });
  const athleteUsers = await userRepo.find({ where: { user_type: 'athlete' as any } });
  const taxonomyTerms = await taxonomyRepo.find();
  const trainerByEmail = new Map(trainerUsers.map((user) => [user.email, user]));
  const athleteByEmail = new Map(athleteUsers.map((user) => [user.email, user]));
  const taxonomyBySlug = new Map(taxonomyTerms.map((term) => [term.slug, term]));

  console.log('\n🏛️ Creating Gyms...');
  for (const g of GYMS) {
    let owner = await userRepo.findOneBy({ email: g.owner.email });
    if (!owner) {
      owner = await userRepo.save(userRepo.create({
        email: g.owner.email,
        full_name: g.owner.full_name,
        password: hashed,
        user_type: 'gym_owner',
        gym_owner_status: 'approved' as any,
        is_verified: true,
        is_email_verified: true,
        onboarding_completed: true,
      }));
    }

    const existingCenter = await gymRepo.findOneBy({ name: g.gym.name, owner_id: owner.id });
    const centerEntity: GymCenter = existingCenter ?? gymRepo.create() as unknown as GymCenter;
    Object.assign(centerEntity, {
      owner_id: owner.id,
      slug: generateSlug(g.gym.name),
      logo_url: (g.gym as any).cover_image_url,
      is_verified: true,
      is_active: true,
      ...g.gym,
    });
    const center: GymCenter = await gymRepo.save(centerEntity) as unknown as GymCenter;

    const existingBranch = await branchRepo.findOneBy({ gym_center_id: center.id, branch_name: g.branch.branch_name });
    const branchEntity: GymBranch = existingBranch ?? branchRepo.create() as unknown as GymBranch;
    Object.assign(branchEntity, {
      gym_center_id: center.id,
      is_active: true,
      ...g.branch,
    });
    const branch: GymBranch = await branchRepo.save(branchEntity) as unknown as GymBranch;

    await centerTaxonomyRepo.delete({ gym_center_id: center.id });
    await trainerLinkRepo.delete({ branch_id: branch.id });
    await reviewRepo.delete({ branch_id: branch.id });
    await leadRouteRepo.delete({ branch_id: branch.id });
    await gymGalleryRepo.delete({ branch_id: branch.id });
    await gymProgramRepo.delete({ branch_id: branch.id });
    await zoneRepo.delete({ branch_id: branch.id });
    await pricingRepo.delete({ branch_id: branch.id });
    await equipmentRepo.delete({ branch_id: branch.id });
    await amenityRepo.delete({ branch_id: branch.id });

    const taxonomyRows = (g.taxonomy || [])
      .map((slug: string, index: number) => {
        const term = taxonomyBySlug.get(slug);
        if (!term) return null;
        return centerTaxonomyRepo.create({
          gym_center_id: center.id,
          term_id: term.id,
          is_primary: index === 0,
          sort_order: index,
        });
      })
      .filter(Boolean);

    if (taxonomyRows.length > 0) {
      await centerTaxonomyRepo.save(taxonomyRows as any);
    }

    for (const amenity of g.amenities || []) {
      await amenityRepo.save(amenityRepo.create({ branch_id: branch.id, ...amenity } as any));
    }

    for (const equipment of g.equipment || []) {
      await equipmentRepo.save(equipmentRepo.create({ branch_id: branch.id, ...equipment } as any));
    }

    const pricingRows: GymPricing[] = [];
    for (let index = 0; index < (g.pricing || []).length; index++) {
      const plan = g.pricing[index];
      const pricing = await pricingRepo.save(pricingRepo.create({
        branch_id: branch.id,
        order_number: plan.order_number ?? index,
        ...plan,
      } as any)) as unknown as GymPricing;
      pricingRows.push(pricing);
    }

    const zoneRows: GymZone[] = [];
    for (let index = 0; index < (g.zones || []).length; index++) {
      const zone = g.zones[index];
      const savedZone = await zoneRepo.save(zoneRepo.create({
        branch_id: branch.id,
        sort_order: zone.sort_order ?? index,
        ...zone,
      } as any)) as unknown as GymZone;
      zoneRows.push(savedZone);
    }
    const zoneByName = new Map(zoneRows.map((zone) => [zone.name, zone]));

    const galleryRows: GymGallery[] = [];
    for (let index = 0; index < (g.gallery || []).length; index++) {
      const image = g.gallery[index];
      const zoneId = image.zone_name ? zoneByName.get(image.zone_name)?.id ?? null : null;
      const { zone_name, ...imageData } = image;
      const savedImage = await gymGalleryRepo.save(gymGalleryRepo.create({
        branch_id: branch.id,
        order_number: imageData.order_number ?? index,
        zone_id: zoneId,
        ...imageData,
      } as any)) as unknown as GymGallery;
      galleryRows.push(savedImage);
    }

    for (let index = 0; index < (g.trainers || []).length; index++) {
      const trainerSeed = g.trainers[index];
      const trainer = trainerByEmail.get(trainerSeed.email);
      if (!trainer) continue;
      const { email, ...trainerLinkData } = trainerSeed;
      await trainerLinkRepo.save(trainerLinkRepo.create({
        branch_id: branch.id,
        gym_center_id: center.id,
        trainer_id: trainer.id,
        status: 'active',
        linked_at: new Date(),
        visible_order: trainerLinkData.visible_order ?? index,
        ...trainerLinkData,
      } as any));
    }

    for (const programSeed of g.programs || []) {
      const trainer = programSeed.trainer_email ? trainerByEmail.get(programSeed.trainer_email) : null;
      const zone = programSeed.zone_name ? zoneByName.get(programSeed.zone_name) : null;
      const { sessions = [], trainer_email, zone_name, ...programData } = programSeed;
      const savedProgram = await gymProgramRepo.save(gymProgramRepo.create({
        branch_id: branch.id,
        trainer_id: trainer?.id ?? null,
        zone_id: zone?.id ?? null,
        ...programData,
      } as any)) as unknown as GymMarketplaceProgram;

      for (const session of sessions) {
        await gymProgramSessionRepo.save(gymProgramSessionRepo.create({
          program_id: savedProgram.id,
          starts_at: new Date(session.starts_at),
          ends_at: new Date(session.ends_at),
          seats_total: session.seats_total ?? savedProgram.capacity,
          seats_remaining: session.seats_remaining ?? savedProgram.capacity,
          waitlist_enabled: session.waitlist_enabled ?? false,
          session_note: session.session_note ?? null,
        } as any));
      }
    }

    for (const route of g.leadRoutes || []) {
      await leadRouteRepo.save(leadRouteRepo.create({
        branch_id: branch.id,
        owner_user_id: owner.id,
        is_active: true,
        ...route,
      } as any));
    }

    for (const reviewSeed of g.reviews || []) {
      const athlete = athleteByEmail.get(reviewSeed.athlete_email);
      if (!athlete) continue;
      const { athlete_email, ...reviewData } = reviewSeed;
      await reviewRepo.save(reviewRepo.create({
        branch_id: branch.id,
        user_id: athlete.id,
        replied_by_id: reviewData.reply_text ? owner.id : null,
        replied_at: reviewData.reply_text ? new Date() : null,
        is_visible: true,
        ...reviewData,
      } as any));
    }

    const heroImage = galleryRows.find((image) => image.is_hero) || galleryRows[0] || null;
    branch.cover_media_id = heroImage?.id ?? null;
    await branchRepo.save(branch);

    const cheapestPlan = pricingRows
      .map((plan) => ({ plan, amount: Number(plan.price) }))
      .filter((entry) => entry.amount > 0)
      .sort((a, b) => a.amount - b.amount)[0];

    center.price_from_amount = cheapestPlan?.amount ?? null;
    center.price_from_billing_cycle = cheapestPlan?.plan.billing_cycle ?? null;
    center.primary_venue_type_slug = g.gym.primary_venue_type_slug;
    await gymRepo.save(center);

    console.log(`  ✅ ${g.gym.name}`);
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
