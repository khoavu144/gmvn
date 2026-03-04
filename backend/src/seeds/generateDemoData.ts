/**
 * GYMERVIET - Generate Demo Data & Test Accounts
 */

import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { GymCenter } from '../entities/GymCenter';
import { GymBranch } from '../entities/GymBranch';
import { GymTrainerLink } from '../entities/GymTrainerLink';
import { Program } from '../entities/Program';
import { Subscription } from '../entities/Subscription';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'test1234';
const ADMIN_PASSWORD = 'Vndk849090@';
const ADMIN_EMAIL = 'khoa.vnd92@gmail.com';

const testUsers = [
    { email: 'athlete@test.com', full_name: 'Test Athlete', user_type: 'athlete' as const, is_verified: true },
    { email: 'nopay@test.com', full_name: 'NoPay Athlete', user_type: 'athlete' as const, is_verified: true },
    { email: 'trainer@test.com', full_name: 'Test Trainer', user_type: 'trainer' as const, is_verified: true, bio: 'Expert Trainer' },
    { email: 'gymowner@test.com', full_name: 'Approved Gym Owner', user_type: 'gym_owner' as const, gym_owner_status: 'approved' as const, is_verified: true },
    { email: 'pending@test.com', full_name: 'Pending Gym Owner', user_type: 'gym_owner' as const, gym_owner_status: 'pending_review' as const, is_verified: true },
    { email: 'admin@test.com', full_name: 'Test Admin', user_type: 'admin' as const, is_verified: true },
];

async function seed() {
    console.log('🚀 GYMERVIET - Bắt đầu Seed dữ liệu...');
    try {
        await AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(User);
        const gymRepo = AppDataSource.getRepository(GymCenter);
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        const programRepo = AppDataSource.getRepository(Program);
        const subRepo = AppDataSource.getRepository(Subscription);

        const hashedDemoPwd = await bcrypt.hash(DEMO_PASSWORD, 10);

        // 1. Tạo test users
        console.log('\n👥 Đang tạo tài khoản test...');
        const userMap: Record<string, User> = {};
        for (const data of testUsers) {
            let user = await userRepo.findOneBy({ email: data.email });
            if (!user) {
                user = userRepo.create({ ...data, password: hashedDemoPwd });
                await userRepo.save(user);
            } else {
                user.user_type = data.user_type;
                if (data.gym_owner_status) user.gym_owner_status = data.gym_owner_status;
                await userRepo.save(user);
            }
            userMap[data.email] = user;
        }

        // Tạo admin chính
        const hashedAdminPwd = await bcrypt.hash(ADMIN_PASSWORD, 10);
        let mainAdmin = await userRepo.findOneBy({ email: ADMIN_EMAIL });
        if (!mainAdmin) {
            mainAdmin = userRepo.create({
                email: ADMIN_EMAIL, password: hashedAdminPwd, full_name: 'KHOA VN',
                user_type: 'admin', is_verified: true
            });
            await userRepo.save(mainAdmin);
        }

        // 2. Tạo GymCenter cho gymowner@test.com
        let gym = await gymRepo.findOneBy({ owner_id: userMap['gymowner@test.com'].id });
        if (!gym) {
            gym = gymRepo.create({
                owner_id: userMap['gymowner@test.com'].id,
                name: 'Test Gym Center',
                is_verified: true,
                is_active: true
            });
            await gymRepo.save(gym);
        }

        // 3. Tạo GymBranch
        let branch = await branchRepo.findOneBy({ gym_center_id: gym.id });
        if (!branch) {
            branch = branchRepo.create({
                gym_center_id: gym.id,
                branch_name: 'Branch 1',
                address: '123 Test St'
            });
            await branchRepo.save(branch);
        }

        // 4. Tạo TrainerLink (trainer@test.com thuộc Gym này với status active)
        let link = await linkRepo.findOneBy({ gym_center_id: gym.id, trainer_id: userMap['trainer@test.com'].id });
        if (!link) {
            link = linkRepo.create({
                gym_center_id: gym.id,
                branch_id: branch.id,
                trainer_id: userMap['trainer@test.com'].id,
                status: 'active',
                role_at_gym: 'Main Coach'
            });
            await linkRepo.save(link);
        }

        // 5. Tạo Program cho trainer@test.com
        let program = await programRepo.findOneBy({ trainer_id: userMap['trainer@test.com'].id });
        if (!program) {
            program = programRepo.create({
                trainer_id: userMap['trainer@test.com'].id,
                name: 'Test Program',
                description: 'A test program',
                difficulty: 'beginner',
                price_monthly: 100000,
                is_published: true
            });
            await programRepo.save(program);
        }

        // 6. Tạo Subscription (Athlete mua Program/Trainer)
        let sub = await subRepo.findOneBy({ user_id: userMap['athlete@test.com'].id, trainer_id: userMap['trainer@test.com'].id });
        if (!sub) {
            sub = subRepo.create({
                user_id: userMap['athlete@test.com'].id,
                trainer_id: userMap['trainer@test.com'].id,
                program_id: program.id,
                status: 'active'
            });
            await subRepo.save(sub);
        }

        console.log('\n✨ SEED TEST DATA HOÀN TẤT! ✨');
    } catch (error) {
        console.error('❌ Lỗi seed:', error);
    } finally {
        if (AppDataSource.isInitialized) await AppDataSource.destroy();
    }
}

seed();
