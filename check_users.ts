
import { AppDataSource } from './backend/src/config/database';
import { User } from './backend/src/entities/User';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function checkUsers() {
    try {
        await AppDataSource.initialize();
        console.log('Database initialized');
        
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        
        console.log(`Total users: ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, ID: ${u.id}`);
        });
        
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();
