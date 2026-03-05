import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Testimonial } from '../entities/Testimonial';
import { BeforeAfterPhoto } from '../entities/BeforeAfterPhoto';
import { generateSlug } from '../utils/slugify';

async function seedTestimonialsAndPhotos() {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const photoRepo = AppDataSource.getRepository(BeforeAfterPhoto);

    // Get all trainers
    const trainers = await userRepo.find({ where: { user_type: 'trainer' } });
    console.log(`Found ${trainers.length} trainers`);

    if (trainers.length === 0) {
        console.log('No trainers found. Please create trainers first.');
        await AppDataSource.destroy();
        return;
    }

    // Sample testimonials data
    const testimonialTemplates = [
        { name: 'Nguyễn Văn A', rating: 5, comment: 'Coach rất tận tâm và chuyên nghiệp. Tôi đã giảm được 10kg sau 3 tháng tập luyện.' },
        { name: 'Trần Thị B', rating: 5, comment: 'Chương trình tập luyện rất hiệu quả, phù hợp với lịch trình bận rộn của tôi.' },
        { name: 'Lê Văn C', rating: 4, comment: 'Coach nhiệt tình, luôn động viên và hỗ trợ tôi trong quá trình tập luyện.' },
        { name: 'Phạm Thị D', rating: 5, comment: 'Tôi rất hài lòng với kết quả. Cơ thể săn chắc hơn rất nhiều.' },
        { name: 'Hoàng Văn E', rating: 4, comment: 'Phương pháp tập luyện khoa học, coach luôn theo dõi sát sao tiến độ.' },
        { name: 'Vũ Thị F', rating: 5, comment: 'Đây là coach tốt nhất tôi từng gặp. Rất đáng để đầu tư!' }
    ];

    // Sample before/after photos (using placeholder images)
    const photoTemplates = [
        {
            client_name: 'Nguyễn Văn G',
            duration_weeks: 12,
            story: 'Giảm 15kg, cải thiện sức khỏe tim mạch và tăng cường sức bền.',
            before_url: 'https://via.placeholder.com/400x600/cccccc/666666?text=Before+1',
            after_url: 'https://via.placeholder.com/400x600/4CAF50/ffffff?text=After+1'
        },
        {
            client_name: 'Trần Thị H',
            duration_weeks: 16,
            story: 'Tăng 8kg cơ bắp, cải thiện tỷ lệ mỡ cơ thể từ 28% xuống 18%.',
            before_url: 'https://via.placeholder.com/400x600/cccccc/666666?text=Before+2',
            after_url: 'https://via.placeholder.com/400x600/2196F3/ffffff?text=After+2'
        },
        {
            client_name: 'Lê Văn I',
            duration_weeks: 20,
            story: 'Chuyển đổi hoàn toàn lối sống, giảm 20kg và duy trì được kết quả.',
            before_url: 'https://via.placeholder.com/400x600/cccccc/666666?text=Before+3',
            after_url: 'https://via.placeholder.com/400x600/FF9800/ffffff?text=After+3'
        }
    ];

    let testimonialCount = 0;
    let photoCount = 0;

    // Add testimonials and photos for each trainer
    for (const trainer of trainers) {
        console.log(`\nProcessing trainer: ${trainer.full_name}`);

        // Add 3-4 testimonials per trainer
        const numTestimonials = Math.floor(Math.random() * 2) + 3; // 3 or 4
        for (let i = 0; i < numTestimonials; i++) {
            const template = testimonialTemplates[i % testimonialTemplates.length];
            const testimonial = testimonialRepo.create({
                trainer_id: trainer.id,
                client_name: template.name,
                client_avatar: null,
                rating: template.rating,
                comment: template.comment,
                is_approved: true
            });
            await testimonialRepo.save(testimonial);
            testimonialCount++;
        }

        // Add 2-3 before/after photos per trainer
        const numPhotos = Math.floor(Math.random() * 2) + 2; // 2 or 3
        for (let i = 0; i < numPhotos; i++) {
            const template = photoTemplates[i % photoTemplates.length];
            const photo = photoRepo.create({
                trainer_id: trainer.id,
                client_name: template.client_name,
                duration_weeks: template.duration_weeks,
                story: template.story,
                before_url: template.before_url,
                after_url: template.after_url,
                is_approved: true
            });
            await photoRepo.save(photo);
            photoCount++;
        }

        console.log(`  Added ${numTestimonials} testimonials and ${numPhotos} photos`);
    }

    console.log(`\n✅ Seed completed:`);
    console.log(`   - ${testimonialCount} testimonials created`);
    console.log(`   - ${photoCount} before/after photos created`);

    await AppDataSource.destroy();
}

seedTestimonialsAndPhotos().catch(err => {
    console.error('Error seeding data:', err);
    process.exit(1);
});
