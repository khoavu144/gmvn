import dotenv from 'dotenv';
import { getEnv } from '../config/env';
import { getMigrationStatus } from '../services/sqlMigrationService';

dotenv.config();

const main = async () => {
    try {
        getEnv();
        const { applied, pending } = await getMigrationStatus();

        console.log(`Applied migrations: ${applied.length}`);
        console.log(`Pending migrations: ${pending.length}`);

        if (pending.length > 0) {
            pending.forEach((migration) => {
                console.log(` - ${migration.name}`);
            });
            process.exit(1);
        }

        console.log('✅ Database migration state is up to date');
    } catch (error: any) {
        console.error('❌ Migration status check failed:', error.message);
        process.exit(1);
    }
};

void main();
