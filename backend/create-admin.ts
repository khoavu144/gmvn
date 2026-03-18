import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';
import { hashPassword } from './src/utils/password';

async function createAdmin() {
    try {
        // Initialize database connection
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(User);

        // Check if admin already exists
        const existingAdmin = await userRepo.findOneBy({ email: 'khoa.vnd92@gmail.com' });
        if (existingAdmin) {
            console.log('❌ Admin account already exists');
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await hashPassword('Vndk849090@');

        // Create admin user
        const admin = userRepo.create({
            email: 'khoa.vnd92@gmail.com',
            password: hashedPassword,
            full_name: 'Khoa Admin',
            user_type: 'admin',
            is_verified: true,
        });

        await userRepo.save(admin);

        console.log('✅ Admin account created successfully!');
        console.log('Email: khoa.vnd92@gmail.com');
        console.log('Password: Vndk849090@');
        console.log('User ID:', admin.id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
